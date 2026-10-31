import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

const validPlans = {
  starter: "STARTER",
  business: "BUSINESS",
  pro: "PRO",
} as const;

type PlanKey = keyof typeof validPlans;

async function saveSelectedPlan(planKey: string) {
  if (!(planKey in validPlans)) {
    return { error: "Invalid plan selected.", status: 400 as const };
  }

  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Please sign in to select your plan.", status: 401 as const };
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
    },
  });

  if (!user) return { error: "Account not found.", status: 404 as const };
  if (!user.emailVerified) {
    return { error: "Verify your email before selecting a plan.", status: 403 as const };
  }

  const now = new Date();
  const paidSubscriptionActive = Boolean(
    user.stripeSubscriptionId &&
    user.stripePriceId &&
    user.stripeCurrentPeriodEnd &&
    user.stripeCurrentPeriodEnd > now
  );

  if (paidSubscriptionActive) return { redirect: "/dashboard" as const };

  if (!user.trialStartedAt || !user.trialEndsAt || user.trialEndsAt <= now) {
    return {
      error: "Your trial has expired. Continue to checkout.",
      redirect: "/pricing?trial=expired",
      status: 403 as const,
    };
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { plan: validPlans[planKey as PlanKey] },
  });

  return { success: true, redirect: "/dashboard", plan: planKey };
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const result = await saveSelectedPlan(String(body.plan ?? "").toLowerCase());
    return NextResponse.json(result, {
      status: "status" in result ? result.status : 200,
    });
  } catch (error) {
    console.error("Trial plan selection error:", error);
    return NextResponse.json(
      { error: "Unable to select this plan right now." },
      { status: 500 },
    );
  }
}

// Google OAuth returns to this route with GET. Persist the chosen tier after
// Auth.js has established the user's session, then send them to the dashboard.
export async function GET(request: NextRequest) {
  try {
    const plan = request.nextUrl.searchParams.get("plan")?.toLowerCase() ?? "";
    const result = await saveSelectedPlan(plan);

    if ("error" in result) {
      return NextResponse.redirect(
        new URL(result.redirect || "/pricing?plan_error=1", request.url),
      );
    }

    return NextResponse.redirect(new URL(result.redirect || "/dashboard", request.url));
  } catch (error) {
    console.error("Google OAuth plan selection error:", error);
    return NextResponse.redirect(new URL("/pricing?plan_error=1", request.url));
  }
}
