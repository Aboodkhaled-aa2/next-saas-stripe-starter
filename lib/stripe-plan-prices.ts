import { pricingData } from "@/config/subscriptions";

const legacyAnnualPriceIdsByPlan = {
  Starter: process.env.NEXT_PUBLIC_STRIPE_STARTER_YEARLY_PLAN_ID,
  Business: process.env.NEXT_PUBLIC_STRIPE_BUSINESS_YEARLY_PLAN_ID,
  Pro: process.env.NEXT_PUBLIC_STRIPE_PRO_YEARLY_PLAN_ID,
} as const;

/**
 * Existing annual Stripe prices are retained only so subscriptions created
 * before annual billing was retired can keep renewing. They are never used
 * by the public pricing page or new checkout sessions.
 */
export function isLegacyAnnualStripePriceId(priceId: string | null | undefined) {
  return Boolean(
    priceId &&
      Object.values(legacyAnnualPriceIdsByPlan).some(
        (legacyPriceId) => legacyPriceId === priceId,
      ),
  );
}

export function findPlanByStripePriceId(priceId: string | null | undefined) {
  if (!priceId) return undefined;

  const monthlyPlan = pricingData.find(
    (plan) => plan.stripeIds.monthly === priceId,
  );
  if (monthlyPlan) return monthlyPlan;

  const legacyPlanTitle = Object.entries(legacyAnnualPriceIdsByPlan).find(
    ([, legacyPriceId]) => Boolean(legacyPriceId && legacyPriceId === priceId),
  )?.[0];

  return legacyPlanTitle
    ? pricingData.find((plan) => plan.title === legacyPlanTitle)
    : undefined;
}

export function getSupportedRecurringStripePriceIds() {
  return new Set(
    [
      ...pricingData.map((plan) => plan.stripeIds.monthly),
      ...Object.values(legacyAnnualPriceIdsByPlan),
    ].filter((priceId): priceId is string => Boolean(priceId)),
  );
}
