// @ts-nocheck
// TODO: Fix this when we turn strict mode on.
import { pricingData } from "@/config/subscriptions";
import { prisma } from "@/lib/db";
import { stripe } from "@/lib/stripe";
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

  // Normalize legacy accounts once. Never restart a trial on subsequent logins.
  if (!user.stripeSubscriptionId && (!user.trialStartedAt || !user.trialEndsAt)) {
    const startedAt = user.trialStartedAt ?? new Date();
    const endsAt = user.trialEndsAt ?? new Date(startedAt.getTime() + 7 * 24 * 60 * 60 * 1000);
    user = await prisma.user.update({
      where: { id: userId },
      data: {
        trialStartedAt: startedAt,
        trialEndsAt: endsAt,
        plan: user.plan ?? "STARTER",
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
  }

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
  const trialEndsAt = user.trialEndsAt?.getTime() ?? 0;
  const isTrial = !user.stripeSubscriptionId && trialEndsAt > Date.now();

  const isPaid =
    Boolean(user.stripePriceId) &&
    currentPeriodEnd + 86_400_000 > Date.now();

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
