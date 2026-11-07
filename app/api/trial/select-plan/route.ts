import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

const validPlans = {
  starter: "STARTER",
  business: "BUSINESS",
  pro: "PRO",
} as const;

type PlanKey = keyof typeof validPlans;

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const planKey = String(body.plan ?? "").toLowerCase();

    if (!Object.prototype.hasOwnProperty.call(validPlans, planKey)) {
      return NextResponse.json({ error: "Invalid plan selected." }, { status: 400 });
    }

    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Please sign in to select your plan." }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        emailVerified: true,
        stripeSubscriptionId: true,
        stripePriceId: true,
        stripeCurrentPeriodEnd: true,
        trialStartedAt: true,
        trialEndsAt: true,
        accounts: {
          where: { provider: "google" },
          select: { provider: true },
          take: 1,
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "Account not found." }, { status: 404 });
    }

    const isVerifiedGoogleAccount = user.accounts.length > 0;
    if (!user.emailVerified && !isVerifiedGoogleAccount) {
      return NextResponse.json({ error: "Verify your email before selecting a plan." }, { status: 403 });
    }

    const now = new Date();
    const paidSubscriptionActive = Boolean(
      user.stripeSubscriptionId &&
      user.stripePriceId &&
      user.stripeCurrentPeriodEnd &&
      user.stripeCurrentPeriodEnd > now
    );

    if (paidSubscriptionActive) {
      return NextResponse.json({
        error: "You already have an active subscription. Manage plan changes from Billing.",
      }, { status: 409 });
    }

    if (Boolean(user.trialStartedAt) !== Boolean(user.trialEndsAt)) {
      return NextResponse.json({
        error: "Your trial status needs support review. Please contact support.",
      }, { status: 409 });
    }

    if (user.trialEndsAt && user.trialEndsAt <= now) {
      return NextResponse.json({
        error: "Your free trial has expired. Please choose a paid subscription.",
        redirect: "/pricing?trial=expired",
      }, { status: 403 });
    }

    const selectedPlan = validPlans[planKey as PlanKey];
    const trialStartedAt = user.trialStartedAt ?? now;
    const trialEndsAt = user.trialEndsAt ??
      new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        plan: selectedPlan,
        hasSelectedPlan: true,
        trialStartedAt,
        trialEndsAt,
        ...(isVerifiedGoogleAccount && !user.emailVerified
          ? { emailVerified: now }
          : {}),
      },
    });

    const savedUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { plan: true, hasSelectedPlan: true, trialStartedAt: true, trialEndsAt: true },
    });

    if (
      savedUser?.plan !== selectedPlan ||
      !savedUser.hasSelectedPlan ||
      !savedUser.trialStartedAt ||
      !savedUser.trialEndsAt
    ) {
      return NextResponse.json({
        error: "Your selected plan could not be saved. Please choose again.",
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      redirect: "/dashboard",
      plan: planKey,
      trialEndsAt: savedUser.trialEndsAt,
    });
  } catch (error) {
    console.error("Trial plan selection error:", error);
    return NextResponse.json({
      error: "Unable to select this plan right now.",
    }, { status: 500 });
  }
}
