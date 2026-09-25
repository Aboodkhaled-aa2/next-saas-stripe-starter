import { headers } from "next/headers";
import Stripe from "stripe";

import { env } from "@/env.mjs";
import { prisma } from "@/lib/db";
import { stripe } from "@/lib/stripe";
import { pricingData } from "@/config/subscriptions";
import { sendPaymentConfirmation } from "@/lib/email";

const allowedStripePriceIds = new Set(
  pricingData.flatMap((plan) => [plan.stripeIds.monthly, plan.stripeIds.yearly])
    .filter((priceId) => priceId && !priceId.startsWith("price_placeholder_")),
);

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
        console.error("Stripe webhook error: Unknown subscription price", priceId);
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

      if (invoice.subscription && invoice.payment_status === "paid") {
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
            customerName: invoice.customer_name ?? user.name ?? "Customer",
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
