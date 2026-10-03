"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { stripe } from "@/lib/stripe";
import { getUserSubscriptionPlan } from "@/lib/subscription";
import { pricingData } from "@/config/subscriptions";
import { absoluteUrl } from "@/lib/utils";
import { redirect } from "next/navigation";

export type responseAction = {
  status: "success" | "error";
  stripeUrl?: string;
};

const billingUrl = absoluteUrl("/pricing");

const allowedStripePriceIds = new Set(
  pricingData.flatMap((offer) => [offer.stripeIds.monthly, offer.stripeIds.yearly])
    .filter((priceId) => priceId && !priceId.startsWith("price_placeholder_")),
);

export async function generateUserStripe(
  priceId: string,
): Promise<responseAction> {
  let redirectUrl = "";

  try {
    const session = await auth();
    const user = session?.user;

    if (!user || !user.email || !user.id) {
      throw new Error("Unauthorized");
    }

    if (!allowedStripePriceIds.has(priceId)) {
      throw new Error("Invalid Stripe price selected");
    }

    const selectedOffer = pricingData.find(
      (offer) =>
        offer.stripeIds.monthly === priceId ||
        offer.stripeIds.yearly === priceId,
    );

    if (!selectedOffer) {
      throw new Error("Invalid subscription plan");
    }

    const selectedPlan =
      selectedOffer.title.toUpperCase() as "STARTER" | "BUSINESS" | "PRO";

    await prisma.user.update({
      where: { id: user.id },
      data: { plan: selectedPlan },
    });

    const subscriptionPlan = await getUserSubscriptionPlan(user.id);

    if (subscriptionPlan.isPaid && subscriptionPlan.stripeCustomerId) {
      const stripeSession = await stripe.billingPortal.sessions.create({
        customer: subscriptionPlan.stripeCustomerId,
        return_url: billingUrl,
      });

      redirectUrl = stripeSession.url as string;
    } else {
      const stripeSession = await stripe.checkout.sessions.create({
        success_url: absoluteUrl("/payment-success"),
        cancel_url: billingUrl,
        payment_method_types: ["card"],
        mode: "subscription",
        billing_address_collection: "auto",
        payment_method_collection: "if_required",
        customer_email: user.email,
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        subscription_data: {
          trial_period_days: 3,
          metadata: {
            userId: user.id,
          },
        },
        metadata: {
          userId: user.id,
        },
      });

      redirectUrl = stripeSession.url as string;
    }
  } catch (error) {
    console.error("Stripe session error:", error);
    throw new Error("Failed to generate user stripe session");
  }

  redirect(redirectUrl);
}
