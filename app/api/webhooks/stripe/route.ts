import { headers } from "next/headers";
import Stripe from "stripe";

import { env } from "@/env.mjs";
import { prisma } from "@/lib/db";
import { stripe } from "@/lib/stripe";

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

      await prisma.user.update({
        where: {
          id: userId,
        },
        data: {
          stripeSubscriptionId: subscription.id,
          stripeCustomerId: subscription.customer as string,
          stripePriceId: subscription.items.data[0].price.id,
          stripeCurrentPeriodEnd: new Date(
            subscription.current_period_end * 1000,
          ),
        },
      });
    }

    if (event.type === "invoice.payment_succeeded") {
      const invoice = event.data.object as Stripe.Invoice;

      if (
        invoice.billing_reason !== "subscription_create" &&
        invoice.subscription
      ) {
        const subscription = await stripe.subscriptions.retrieve(
          invoice.subscription as string,
        );

        await prisma.user.update({
          where: {
            stripeSubscriptionId: subscription.id,
          },
          data: {
            stripePriceId: subscription.items.data[0].price.id,
            stripeCurrentPeriodEnd: new Date(
              subscription.current_period_end * 1000,
            ),
          },
        });
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
