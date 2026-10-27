import { headers } from "next/headers";
import Stripe from "stripe";

import { env } from "@/env.mjs";
import { prisma } from "@/lib/db";
import { stripe } from "@/lib/stripe";
import { pricingData } from "@/config/subscriptions";
import { sendPaymentConfirmation } from "@/lib/email";

const allowedStripePriceIds = new Set(
  pricingData
    .flatMap((plan) => [plan.stripeIds.monthly, plan.stripeIds.yearly])
    .filter(
      (priceId) =>
        priceId && !priceId.startsWith("price_placeholder_"),
    ),
);

const voicePackages = {
  "100": { minutes: 100, amountCents: 1500 },
  "500": { minutes: 500, amountCents: 7500 },
  "1000": { minutes: 1000, amountCents: 12000 },
} as const;

const messagePackages = {
  "1000": { messages: 1000, amountCents: 1000 },
  "5000": { messages: 5000, amountCents: 4000 },
  "10000": { messages: 10000, amountCents: 7000 },
} as const;

const TEST_PHONE_NUMBER = "+12012770096";

async function provisionReceptionNumber(userId: string, subscriptionId: string) {
  const existingNumber = await prisma.phoneNumber.findFirst({
    where: {
      userId,
      status: "ACTIVE",
      phoneNumber: { not: TEST_PHONE_NUMBER },
    },
    select: { id: true, phoneNumber: true },
  });

  if (existingNumber) {
    return existingNumber;
  }

  if (
    !env.SIGNALWIRE_SPACE_URL ||
    !env.SIGNALWIRE_PROJECT_ID ||
    !env.SIGNALWIRE_API_TOKEN
  ) {
    throw new Error("SignalWire is not configured for automatic phone provisioning");
  }

  const baseUrl = env.SIGNALWIRE_SPACE_URL.replace(/\/$/, "");
  const authorization =
    "Basic " +
    Buffer.from(
      `${env.SIGNALWIRE_PROJECT_ID}:${env.SIGNALWIRE_API_TOKEN}`,
    ).toString("base64");

  const searchResponse = await fetch(
    `${baseUrl}/api/relay/rest/phone_numbers/search?number_type=local&max_results=20`,
    {
      headers: {
        Accept: "application/json",
        Authorization: authorization,
      },
      cache: "no-store",
    },
  );
  const searchPayload = await searchResponse.json().catch(() => null);

  if (!searchResponse.ok) {
    console.error("SignalWire automatic number search failed", searchResponse.status, searchPayload);
    throw new Error("Unable to search for an automatic reception number");
  }

  const candidates = Array.isArray(searchPayload?.data) ? searchPayload.data : [];
  let selectedNumber: any = null;

  for (const candidate of candidates) {
    const number = typeof candidate?.number === "string" ? candidate.number : "";
    if (!number || number === TEST_PHONE_NUMBER || !candidate?.capabilities?.voice) {
      continue;
    }

    const alreadyAssigned = await prisma.phoneNumber.findUnique({
      where: { phoneNumber: number },
      select: { id: true },
    });

    if (!alreadyAssigned) {
      selectedNumber = candidate;
      break;
    }
  }

  if (!selectedNumber?.number) {
    throw new Error("SignalWire returned no available voice-capable US phone numbers");
  }

  const purchaseResponse = await fetch(
    `${baseUrl}/api/relay/rest/phone_numbers`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: authorization,
      },
      body: JSON.stringify({ number: selectedNumber.number }),
    },
  );
  const purchasePayload = await purchaseResponse.json().catch(() => null);

  if (!purchaseResponse.ok) {
    console.error("SignalWire automatic phone purchase failed", purchaseResponse.status, purchasePayload);
    throw new Error("Automatic reception number purchase failed");
  }

  if (
    !purchasePayload?.id ||
    purchasePayload.number !== selectedNumber.number
  ) {
    console.error("SignalWire returned an invalid automatic phone number payload");
    throw new Error("Invalid SignalWire phone number response");
  }

  return prisma.phoneNumber.create({
    data: {
      userId,
      provider: "SIGNALWIRE",
      providerId: purchasePayload.id,
      phoneNumber: purchasePayload.number,
      countryCode: purchasePayload.country_code ?? "US",
      region: purchasePayload.region ?? selectedNumber.region ?? null,
      city: purchasePayload.city ?? selectedNumber.city ?? null,
      status: "ACTIVE",
      monthlyPriceCents: 0,
      stripeSubscriptionId: subscriptionId,
      metadata: {
        capabilities: purchasePayload.capabilities ?? selectedNumber.capabilities ?? [],
        numberType: purchasePayload.number_type ?? selectedNumber.number_type ?? null,
        assignedAutomatically: true,
      },
    },
  });
}

export async function POST(req: Request) {
  const body = await req.text();
  const signature = headers().get("Stripe-Signature");

  if (!signature) {
    console.error("Stripe webhook error: Missing Stripe-Signature header");
    return new Response("Missing Stripe-Signature header", { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (error) {
    console.error(
      "Stripe webhook signature verification error:",
      error instanceof Error ? error.message : String(error),
    );

    return new Response("Webhook signature verification failed", {
      status: 400,
    });
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;

      if (session.metadata?.type === "voice_minutes") {
        if (session.mode !== "payment" || session.payment_status !== "paid") {
          return new Response("Voice payment not completed", { status: 400 });
        }

        const userId = session.metadata.userId;
        const packageKey = session.metadata.package;

        if (!userId || !packageKey) {
          return new Response("Missing voice purchase metadata", {
            status: 400,
          });
        }

        const selected =
          voicePackages[packageKey as keyof typeof voicePackages];

        if (!selected) {
          return new Response("Unknown voice package", { status: 400 });
        }

        if (
          session.amount_total !== null &&
          session.amount_total !== selected.amountCents
        ) {
          console.error(
            "Stripe webhook error: Voice package amount mismatch",
            {
              sessionId: session.id,
              expected: selected.amountCents,
              received: session.amount_total,
            },
          );

          return new Response("Voice package amount mismatch", {
            status: 400,
          });
        }

        await prisma.$transaction(async (tx) => {
          const existingPurchase = await tx.voiceCreditPurchase.findUnique({
            where: { stripeSessionId: session.id },
            select: { id: true },
          });

          if (existingPurchase) {
            return;
          }

          await tx.voiceCreditPurchase.create({
            data: {
              userId,
              stripeSessionId: session.id,
              minutes: selected.minutes,
              amountCents: selected.amountCents,
              status: "PAID",
            },
          });

          await tx.user.update({
            where: { id: userId },
            data: {
              extraVoiceMinutes: {
                increment: selected.minutes,
              },
            },
          });
        });

        return new Response(null, { status: 200 });
      }

      if (session.metadata?.type === "message_credits") {
        if (session.mode !== "payment" || session.payment_status !== "paid") {
          return new Response("Message payment not completed", { status: 400 });
        }

        const userId = session.metadata.userId;
        const packageKey = session.metadata.package;

        if (!userId || !packageKey) {
          return new Response("Missing message purchase metadata", {
            status: 400,
          });
        }

        const selected =
          messagePackages[packageKey as keyof typeof messagePackages];

        if (!selected) {
          return new Response("Unknown message package", { status: 400 });
        }

        if (
          session.amount_total !== null &&
          session.amount_total !== selected.amountCents
        ) {
          console.error(
            "Stripe webhook error: Message package amount mismatch",
            {
              sessionId: session.id,
              expected: selected.amountCents,
              received: session.amount_total,
            },
          );

          return new Response("Message package amount mismatch", {
            status: 400,
          });
        }

        await prisma.$transaction(async (tx) => {
          const existingPurchase = await tx.messageCreditPurchase.findUnique({
            where: { stripeSessionId: session.id },
            select: { id: true },
          });

          if (existingPurchase) {
            return;
          }

          await tx.messageCreditPurchase.create({
            data: {
              userId,
              stripeSessionId: session.id,
              messages: selected.messages,
              amountCents: selected.amountCents,
              status: "PAID",
            },
          });

          await tx.user.update({
            where: { id: userId },
            data: {
              extraMessageCredits: {
                increment: selected.messages,
              },
            },
          });
        });

        return new Response(null, { status: 200 });
      }

      if (session.metadata?.type === "phone_number") {
        if (session.mode !== "subscription" || session.payment_status !== "paid") {
          return new Response("Phone number payment not completed", { status: 400 });
        }

        const userId = session.metadata.userId;
        const phoneNumber = session.metadata.phoneNumber;

        if (!userId || !phoneNumber) {
          return new Response("Missing phone number metadata", { status: 400 });
        }

        const existing = await prisma.phoneNumber.findUnique({
          where: { phoneNumber },
          select: { id: true, status: true },
        });

        if (existing?.status === "ACTIVE") {
          return new Response(null, { status: 200 });
        }

        if (
          !env.SIGNALWIRE_SPACE_URL ||
          !env.SIGNALWIRE_PROJECT_ID ||
          !env.SIGNALWIRE_API_TOKEN
        ) {
          console.error("SignalWire is not configured for phone provisioning");
          return new Response("SignalWire is not configured", { status: 500 });
        }

        const baseUrl = env.SIGNALWIRE_SPACE_URL.replace(/\/$/, "");
        const authorization =
          "Basic " +
          Buffer.from(
            `${env.SIGNALWIRE_PROJECT_ID}:${env.SIGNALWIRE_API_TOKEN}`,
          ).toString("base64");

        const ownedResponse = await fetch(
          `${baseUrl}/api/relay/rest/phone_numbers?filter_number=${encodeURIComponent(phoneNumber)}&page_size=10`,
          {
            headers: {
              Accept: "application/json",
              Authorization: authorization,
            },
            cache: "no-store",
          },
        );

        const ownedPayload = await ownedResponse.json().catch(() => null);
        const ownedNumber = Array.isArray(ownedPayload?.data)
          ? ownedPayload.data.find(
              (item: { number?: string }) => item.number === phoneNumber,
            )
          : null;

        let signalWireNumber = ownedNumber;

        if (!signalWireNumber) {
          const purchaseResponse = await fetch(
            `${baseUrl}/api/relay/rest/phone_numbers`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
                Authorization: authorization,
              },
              body: JSON.stringify({ number: phoneNumber }),
            },
          );

          const purchasePayload = await purchaseResponse.json().catch(() => null);

          if (!purchaseResponse.ok) {
            console.error(
              "SignalWire phone number purchase failed",
              purchaseResponse.status,
              purchasePayload,
            );
            return new Response("Phone number provisioning failed", {
              status: 502,
            });
          }

          signalWireNumber = purchasePayload;
        }

        if (!signalWireNumber?.id || signalWireNumber.number !== phoneNumber) {
          console.error("SignalWire returned an invalid phone number payload");
          return new Response("Invalid SignalWire phone number response", {
            status: 502,
          });
        }

        await prisma.phoneNumber.upsert({
          where: { phoneNumber },
          create: {
            userId,
            provider: "SIGNALWIRE",
            providerId: signalWireNumber.id,
            phoneNumber,
            countryCode: signalWireNumber.country_code ?? "US",
            status: "ACTIVE",
            monthlyPriceCents: 999,
            stripeSubscriptionId: session.subscription as string,
            metadata: {
              capabilities: signalWireNumber.capabilities ?? [],
              numberType: signalWireNumber.number_type ?? null,
            },
          },
          update: {
            userId,
            providerId: signalWireNumber.id,
            countryCode: signalWireNumber.country_code ?? "US",
            status: "ACTIVE",
            monthlyPriceCents: 999,
            stripeSubscriptionId: session.subscription as string,
            metadata: {
              capabilities: signalWireNumber.capabilities ?? [],
              numberType: signalWireNumber.number_type ?? null,
            },
          },
        });

        return new Response(null, { status: 200 });
      }

      if (!session.subscription) {
        console.error("Stripe webhook error: Missing subscription ID");
        return new Response("Missing subscription ID", { status: 400 });
      }

      const userId = session.metadata?.userId;

      if (!userId) {
        console.error("Stripe webhook error: Missing userId metadata");
        return new Response("Missing userId metadata", { status: 400 });
      }

      const subscription = await stripe.subscriptions.retrieve(
        session.subscription as string,
      );

      const priceId = subscription.items.data[0]?.price.id;

      if (!priceId || !allowedStripePriceIds.has(priceId)) {
        console.error(
          "Stripe webhook error: Unknown subscription price",
          priceId,
        );
        return new Response("Unknown subscription price", { status: 400 });
      }

      await prisma.user.update({
        where: {
          id: userId,
        },
        data: {
          stripeSubscriptionId: subscription.id,
          stripeCustomerId: subscription.customer as string,
          stripePriceId: priceId,
          stripeCurrentPeriodEnd: new Date(
            subscription.current_period_end * 1000,
          ),
        },
      });

      const selectedPlan =
        session.metadata?.plan?.toUpperCase() ??
        pricingData
          .find(
            (plan) =>
              plan.stripeIds.monthly === priceId ||
              plan.stripeIds.yearly === priceId,
          )
          ?.title.toUpperCase();

      // Only provision a paid subscription here. Trial/no-payment sessions
      // must not trigger a billable phone-number purchase.
      if (
        session.payment_status === "paid" &&
        (selectedPlan === "BUSINESS" || selectedPlan === "PRO")
      ) {
        await provisionReceptionNumber(userId, subscription.id);
      }
    }

    if (event.type === "invoice.payment_succeeded") {
      const invoice = event.data.object as Stripe.Invoice;
      const isPaid = invoice.status === "paid";

      if (invoice.subscription && isPaid) {
        const subscription = await stripe.subscriptions.retrieve(
          invoice.subscription as string,
        );

        await prisma.user.update({
          where: {
            stripeSubscriptionId: subscription.id,
          },
          data: {
            stripePriceId: allowedStripePriceIds.has(
              subscription.items.data[0]?.price.id ?? "",
            )
              ? subscription.items.data[0]?.price.id
              : null,
            stripeCurrentPeriodEnd: new Date(
              subscription.current_period_end * 1000,
            ),
          },
        });

        const priceId = subscription.items.data[0]?.price.id;
        const plan = pricingData.find(
          (item) =>
            item.stripeIds.monthly === priceId ||
            item.stripeIds.yearly === priceId,
        );

        // First successful invoice also handles subscriptions whose Checkout
        // session did not complete with an immediately paid status.
        if (plan?.title === "Business" || plan?.title === "Pro") {
          const subscriber = await prisma.user.findFirst({
            where: { stripeSubscriptionId: subscription.id },
            select: { id: true },
          });

          if (subscriber?.id) {
            await provisionReceptionNumber(subscriber.id, subscription.id);
          }
        }

        const user = await prisma.user.findFirst({
          where: {
            stripeSubscriptionId: subscription.id,
          },
          select: {
            name: true,
            email: true,
          },
        });

        if (user?.email) {
          const priceId = subscription.items.data[0]?.price.id;
          const plan = pricingData.find(
            (item) =>
              item.stripeIds.monthly === priceId ||
              item.stripeIds.yearly === priceId,
          );

          await sendPaymentConfirmation({
            email: user.email,
            customerName:
              invoice.customer_name ?? user.name ?? "Customer",
            planName: plan?.title ?? "Subscription",
            amount: new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: invoice.currency ?? "usd",
            }).format((invoice.amount_paid ?? 0) / 100),
            paymentDate: new Date(invoice.created * 1000),
            invoiceNumber: invoice.number,
            invoiceUrl: invoice.hosted_invoice_url,
          });
        }
      }
    }

    if (event.type === "customer.subscription.deleted") {
      const subscription = event.data.object as Stripe.Subscription;

      const phoneNumber = await prisma.phoneNumber.findUnique({
        where: { stripeSubscriptionId: subscription.id },
        select: {
          id: true,
          provider: true,
          providerId: true,
          status: true,
        },
      });

      if (phoneNumber) {
        if (phoneNumber.status === "RELEASED") {
          return new Response(null, { status: 200 });
        }

        if (phoneNumber.provider !== "SIGNALWIRE") {
          await prisma.phoneNumber.update({
            where: { id: phoneNumber.id },
            data: {
              status: "RELEASED",
              releasedAt: new Date(),
            },
          });
          return new Response(null, { status: 200 });
        }

        if (
          !env.SIGNALWIRE_SPACE_URL ||
          !env.SIGNALWIRE_PROJECT_ID ||
          !env.SIGNALWIRE_API_TOKEN
        ) {
          console.error("SignalWire is not configured for phone release");
          return new Response("SignalWire is not configured", { status: 500 });
        }

        const baseUrl = env.SIGNALWIRE_SPACE_URL.replace(/\/$/, "");
        const authorization =
          "Basic " +
          Buffer.from(
            env.SIGNALWIRE_PROJECT_ID + ":" + env.SIGNALWIRE_API_TOKEN,
          ).toString("base64");

        const releaseResponse = await fetch(
          baseUrl +
            "/api/relay/rest/phone_numbers/" +
            encodeURIComponent(phoneNumber.providerId),
          {
            method: "DELETE",
            headers: {
              Accept: "application/json",
              Authorization: authorization,
            },
            cache: "no-store",
          },
        );

        if (!releaseResponse.ok && releaseResponse.status !== 404) {
          const payload = await releaseResponse.json().catch(() => null);
          console.error(
            "SignalWire phone number release failed",
            releaseResponse.status,
            payload,
          );
          return new Response("Phone number release failed", { status: 502 });
        }

        await prisma.phoneNumber.update({
          where: { id: phoneNumber.id },
          data: {
            status: "RELEASED",
            releasedAt: new Date(),
          },
        });

        return new Response(null, { status: 200 });
      }
    }

    if (event.type === "customer.subscription.updated") {
      const subscription = event.data.object as Stripe.Subscription;

      const user = await prisma.user.findFirst({
        where: {
          stripeSubscriptionId: subscription.id,
        },
        select: {
          id: true,
        },
      });

      if (user) {
        await prisma.user.update({
          where: {
            id: user.id,
          },
          data: {
            stripePriceId:
              subscription.status === "active" ||
              subscription.status === "trialing"
                ? subscription.items.data[0]?.price.id ?? null
                : null,
            stripeCurrentPeriodEnd: new Date(
              subscription.current_period_end * 1000,
            ),
          },
        });
      }
    }

    return new Response(null, { status: 200 });
  } catch (error) {
    console.error(
      "Stripe webhook processing error:",
      error instanceof Error ? error.message : String(error),
    );

    return new Response("Webhook processing failed", { status: 500 });
  }
}
