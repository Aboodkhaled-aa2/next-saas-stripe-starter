import { NextResponse } from "next/server";

import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { getUserSubscriptionPlan } from "@/lib/subscription";
import { stripe } from "@/lib/stripe";

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const plan = await getUserSubscriptionPlan(user.id);

    // The new paid-plan usage display and alerts must not alter the free trial.
    if (!plan.isPaid || !plan.stripeSubscriptionId) {
      return NextResponse.json({
        eligible: false,
        reason: plan.isTrial ? "TRIAL" : "NO_ACTIVE_PAID_SUBSCRIPTION",
      });
    }

    const subscription = await stripe.subscriptions.retrieve(
      plan.stripeSubscriptionId,
    );

    if (!["active", "trialing"].includes(subscription.status)) {
      return NextResponse.json({
        eligible: false,
        reason: "SUBSCRIPTION_INACTIVE",
      });
    }

    const includedMinutes =
      plan.title === "Pro" ? 500 : plan.title === "Business" ? 200 : 0;

    if (includedMinutes <= 0) {
      return NextResponse.json({
        eligible: false,
        reason: "PLAN_DOES_NOT_INCLUDE_AI_PHONE",
      });
    }

    const periodStart = new Date(subscription.current_period_start * 1000);
    const periodEnd = new Date(subscription.current_period_end * 1000);

    const [usage, account] = await Promise.all([
      prisma.voiceUsage.aggregate({
        where: {
          userId: user.id,
          source: "VAPI_CALL",
          startedAt: {
            gte: periodStart,
            lt: periodEnd,
          },
        },
        _sum: { includedMinutesUsed: true },
      }),
      prisma.user.findUnique({
        where: { id: user.id },
        select: { extraVoiceMinutes: true },
      }),
    ]);

    const includedUsed = usage._sum.includedMinutesUsed ?? 0;
    const includedRemaining = Math.max(includedMinutes - includedUsed, 0);
    const extraRemaining = Math.max(account?.extraVoiceMinutes ?? 0, 0);

    return NextResponse.json({
      eligible: true,
      plan: plan.title,
      periodStart: periodStart.toISOString(),
      periodEnd: periodEnd.toISOString(),
      includedMinutes,
      includedUsed,
      includedRemaining,
      extraRemaining,
      totalRemaining: includedRemaining + extraRemaining,
      warningLevel:
        includedRemaining + extraRemaining <= 0
          ? "EMPTY"
          : includedRemaining + extraRemaining <= includedMinutes * 0.1
            ? "CRITICAL"
            : includedRemaining + extraRemaining <= includedMinutes * 0.2
              ? "LOW"
              : "OK",
    });
  } catch (error) {
    console.error("AI Phone usage summary error:", error);
    return NextResponse.json(
      { error: "Unable to load AI Phone usage." },
      { status: 500 },
    );
  }
}
