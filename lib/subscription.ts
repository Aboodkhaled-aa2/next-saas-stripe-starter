// @ts-nocheck
// TODO: Fix this when we turn strict mode on.
import { pricingData } from "@/config/subscriptions";
import { prisma } from "@/lib/db";
import { stripe } from "@/lib/stripe";
import { isTrialActive } from "@/lib/trial-policy";
import { UserSubscriptionPlan } from "types";

const META_REVIEW_EMAIL = "meta-review@smartcleaningdesk.com";

export async function getUserSubscriptionPlan(
  userId: string,
): Promise<UserSubscriptionPlan> {
  if (!userId) {
    throw new Error("Missing parameters");
  }

  let user = await prisma.user.findFirst({
    where: {
      id: userId,
    },
    select: {
      id: true,
      email: true,
      stripeSubscriptionId: true,
      stripeCurrentPeriodEnd: true,
      stripeCustomerId: true,
      stripePriceId: true,
      plan: true,
      trialStartedAt: true,
      trialEndsAt: true,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  // Legacy accounts without trial dates remain without a trial.
  // Never manufacture trial dates during reads, login, or subscription checks.

  if (user.email?.toLowerCase() === META_REVIEW_EMAIL) {
    const reviewPlan =
      pricingData.find((plan) => plan.title === "Pro") || pricingData[0];

    return {
      ...reviewPlan,
      ...user,
      stripeCurrentPeriodEnd: Date.now() + 366 * 86_400_000,
      isPaid: true,
      interval: "year",
      isCanceled: false,
    };
  }

  const currentPeriodEnd = user.stripeCurrentPeriodEnd?.getTime() ?? 0;
  const now = Date.now();
  const trialEndsAt = user.trialEndsAt?.getTime() ?? 0;
  const isTrial = isTrialActive(
    user.trialEndsAt,
    new Date(now),
    Boolean(user.stripeSubscriptionId),
  );

  const isPaid =
    Boolean(user.stripePriceId) &&
    currentPeriodEnd + 86_400_000 > Date.now();

  console.info("[TRIAL][SUBSCRIPTION_CHECK]", {
    userId: user.id,
    status: isPaid ? "active" : isTrial ? "trialing" : "expired",
    trialStartedAt: user.trialStartedAt?.toISOString() ?? null,
    trialEndsAt: user.trialEndsAt?.toISOString() ?? null,
    nowUtc: new Date(now).toISOString(),
    hasStripeSubscription: Boolean(user.stripeSubscriptionId),
    isPaid,
    isTrial,
  });

  const userPlan =
    pricingData.find(
      (plan) => plan.stripeIds.monthly === user.stripePriceId,
    ) ||
    pricingData.find(
      (plan) => plan.stripeIds.yearly === user.stripePriceId,
    );

  const plan = isPaid && userPlan ? userPlan : pricingData[0];

  let interval: "month" | "year" | null = null;

  if (isPaid && userPlan) {
    if (userPlan.stripeIds.monthly === user.stripePriceId) {
      interval = "month";
    } else if (userPlan.stripeIds.yearly === user.stripePriceId) {
      interval = "year";
    }
  }

  let isCanceled = false;

  if (isPaid && user.stripeSubscriptionId) {
    try {
      const stripeSubscription = await stripe.subscriptions.retrieve(
        user.stripeSubscriptionId,
      );

      isCanceled = stripeSubscription.cancel_at_period_end;
    } catch (error) {
      console.error("Failed to retrieve Stripe subscription:", error);
    }
  }

  const savedPlan =
    pricingData.find(
      (item) => item.title.toUpperCase() === user.plan,
    ) || plan;

  return {
    ...(isTrial || !isPaid ? savedPlan : plan),
    ...user,
    stripeCurrentPeriodEnd: currentPeriodEnd,
    isPaid,
    isTrial,
    trialEndsAt: user.trialEndsAt,
    interval,
    isCanceled,
  };
}
