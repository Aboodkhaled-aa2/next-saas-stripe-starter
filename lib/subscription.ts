// @ts-nocheck
// TODO: Fix this when we turn strict mode on.
import { pricingData } from "@/config/subscriptions";
import { prisma } from "@/lib/db";
import { stripe } from "@/lib/stripe";
import { UserSubscriptionPlan } from "types";

export async function getUserSubscriptionPlan(
  userId: string,
): Promise<UserSubscriptionPlan> {
  if (!userId) {
    throw new Error("Missing parameters");
  }

  const user = await prisma.user.findFirst({
    where: {
      id: userId,
    },
    select: {
      stripeSubscriptionId: true,
      stripeCurrentPeriodEnd: true,
      stripeCustomerId: true,
      stripePriceId: true,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const currentPeriodEnd = user.stripeCurrentPeriodEnd?.getTime() ?? 0;

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

  return {
    ...plan,
    ...user,
    stripeCurrentPeriodEnd: currentPeriodEnd,
    isPaid,
    interval,
    isCanceled,
  };
}
