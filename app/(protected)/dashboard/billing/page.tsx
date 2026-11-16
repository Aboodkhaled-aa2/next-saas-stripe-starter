import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/session";
import { getUserSubscriptionPlan } from "@/lib/subscription";
import { constructMetadata } from "@/lib/utils";
import { DashboardHeader } from "@/components/dashboard/header";
import { BillingInfo } from "@/components/pricing/billing-info";
import { prisma } from "@/lib/db";
import { stripe } from "@/lib/stripe";

export const metadata = constructMetadata({
  title: "Billing – Smart Cleaning Desk",
  description: "Manage your subscription and billing.",
});

export default async function BillingPage() {
  const user = await getCurrentUser();

  let userSubscriptionPlan;

  if (user && user.id && user.role === "USER") {
    userSubscriptionPlan = await getUserSubscriptionPlan(user.id);
  } else {
    redirect("/login");
  }

  const account = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      plan: true,
      stripeSubscriptionId: true,
      trialStartedAt: true,
      trialEndsAt: true,
      extraMessageCredits: true,
      extraVoiceMinutes: true,
    },
  });

  let periodStart = account?.trialStartedAt ?? new Date();
  let periodEnd = account?.trialEndsAt ?? new Date();
  if (account?.stripeSubscriptionId) {
    try {
      const subscription = await stripe.subscriptions.retrieve(account.stripeSubscriptionId);
      if (subscription.status === "active" || subscription.status === "trialing") {
        periodStart = new Date(subscription.current_period_start * 1000);
        periodEnd = new Date(subscription.current_period_end * 1000);
      }
    } catch (error) {
      console.error("Unable to load billing usage period:", error);
    }
  }

  const isTrial = Boolean(
    account?.trialStartedAt && account?.trialEndsAt &&
    account.trialEndsAt > new Date() && !account.stripeSubscriptionId
  );
  const plan = account?.plan ?? "STARTER";
  const messageLimit = plan === "PRO" ? 15000 : plan === "BUSINESS" ? 6000 : 3000;
  const includedVoiceMinutes = isTrial
    ? plan === "PRO" ? 30 : plan === "BUSINESS" ? 15 : 0
    : plan === "PRO" ? 500 : plan === "BUSINESS" ? 200 : 0;

  const usedMessages = await prisma.message.count({
    where: {
      direction: "OUTBOUND",
      createdAt: { gte: periodStart, lt: periodEnd },
      conversation: {
        userId: user.id,
        channel: { in: ["FACEBOOK", "INSTAGRAM", "WHATSAPP"] },
      },
    },
  });

  let usedVoiceMinutes = 0;
  if (isTrial) {
    const trialUsage = await prisma.voiceUsage.aggregate({
      where: {
        userId: user.id,
        source: "VAPI_CALL",
        startedAt: { gte: periodStart, lt: periodEnd },
        metadata: { path: ["billingPeriod"], equals: "trial" },
      },
      _sum: { billedMinutes: true },
    });
    usedVoiceMinutes = trialUsage._sum.billedMinutes ?? 0;
  } else {
    const paidUsage = await prisma.voiceUsage.aggregate({
      where: {
        userId: user.id,
        source: "VAPI_CALL",
        startedAt: { gte: periodStart, lt: periodEnd },
      },
      _sum: { includedMinutesUsed: true },
    });
    usedVoiceMinutes = paidUsage._sum.includedMinutesUsed ?? 0;
  }

  const billingUsage = {
    messageLimit,
    usedMessages,
    extraMessages: account?.extraMessageCredits ?? 0,
    voiceLimit: includedVoiceMinutes,
    usedVoiceMinutes,
    extraVoiceMinutes: account?.extraVoiceMinutes ?? 0,
    periodEnd,
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white">
      <div className="space-y-8">
        <DashboardHeader
          heading="Billing"
          text="Manage your subscription and billing."
        />

        <div className="grid gap-8">
          <BillingInfo userSubscriptionPlan={userSubscriptionPlan} billingUsage={billingUsage} />
        </div>
      </div>
    </div>
  );
}
