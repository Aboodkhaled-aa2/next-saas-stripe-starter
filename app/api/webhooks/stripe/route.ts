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
            monthlyPriceCents: 499,
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
            monthlyPriceCents: 499,
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

    if (
      event.type === "customer.subscription.deleted" ||
      event.type === "customer.subscription.updated"
    ) {
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
