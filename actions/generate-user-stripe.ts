"use server";

import { auth } from "@/auth";
import { stripe } from "@/lib/stripe";
import { getUserSubscriptionPlan } from "@/lib/subscription";
import { pricingData } from "@/config/subscriptions";
import { absoluteUrl } from "@/lib/utils";
import { redirect } from "next/navigation";

export type responseAction = {
  status: "success" | "error";
  stripeUrl?: string;
  message?: string;
};

const billingUrl = absoluteUrl("/pricing");
const TRIAL_PERIOD_DAYS = 7;

const allowedStripePriceIds = new Set(
  pricingData
    .flatMap((offer) => [offer.stripeIds.monthly, offer.stripeIds.yearly])
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
      return { status: "error", message: "Please sign in again before managing your subscription." };
    }

    if (!allowedStripePriceIds.has(priceId)) {
      console.error("Stripe checkout rejected an unconfigured price ID.");
      return { status: "error", message: "This plan is not configured for checkout yet. Please contact support." };
    }

    const selectedOffer = pricingData.find(
      (offer) =>
        offer.stripeIds.monthly === priceId ||
        offer.stripeIds.yearly === priceId,
    );

    if (!selectedOffer) {
      return { status: "error", message: "The selected subscription plan could not be found." };
    }

    const selectedPlan = selectedOffer.title.toUpperCase() as "STARTER" | "BUSINESS" | "PRO";
    const subscriptionPlan = await getUserSubscriptionPlan(user.id);

    if (subscriptionPlan.isPaid && subscriptionPlan.stripeCustomerId) {
      const stripeSession = await stripe.billingPortal.sessions.create({
        customer: subscriptionPlan.stripeCustomerId,
        return_url: billingUrl,
      });

      redirectUrl = stripeSession.url;
    } else {
      const stripeSession = await stripe.checkout.sessions.create({
        success_url: absoluteUrl("/payment-success"),
        cancel_url: billingUrl,
        mode: "subscription",
        payment_method_collection: "if_required",
        billing_address_collection: "auto",
        customer_email: user.email,
        line_items: [{ price: priceId, quantity: 1 }],
        subscription_data: {
          trial_period_days: TRIAL_PERIOD_DAYS,
          trial_settings: {
            end_behavior: {
              missing_payment_method: "pause",
            },
          },
          metadata: { userId: user.id, plan: selectedPlan },
        },
        metadata: { userId: user.id, plan: selectedPlan },
      });

      if (!stripeSession.url) {
        return { status: "error", message: "Stripe did not return a checkout link. Please try again." };
      }

      redirectUrl = stripeSession.url;
    }
  } catch (error) {
    console.error("Stripe session creation failed:", error);
    return {
      status: "error",
      message: "Checkout could not be started. Please try again; if it continues, contact support.",
    };
  }

  if (!redirectUrl) {
    return { status: "error", message: "A billing link could not be created. Please try again." };
  }

  redirect(redirectUrl);
}
