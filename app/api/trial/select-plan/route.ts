import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

const validPlans = {
  starter: "STARTER",
  business: "BUSINESS",
  pro: "PRO",
} as const;

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Please sign in to start your trial." }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const planKey = String(body.plan ?? "").toLowerCase() as keyof typeof validPlans;
    const plan = validPlans[planKey];

    if (!plan) {
      return NextResponse.json({ error: "Invalid plan selected." }, { status: 400 });
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

    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    if (!user.emailVerified) {
      return NextResponse.json({ error: "Verify your email before starting a trial." }, { status: 403 });
    }

    const now = new Date();
    const paidSubscriptionActive = Boolean(
      user.stripeSubscriptionId &&
      user.stripePriceId &&
      user.stripeCurrentPeriodEnd &&
      user.stripeCurrentPeriodEnd > now
    );

    if (paidSubscriptionActive) {
      return NextResponse.json({ redirect: "/dashboard" });
    }

    if (!user.trialStartedAt || !user.trialEndsAt || user.trialEndsAt <= now) {
      return NextResponse.json({
        error: "Your trial has expired. Continue to checkout to activate your saved plan.",
        redirect: "/pricing?trial=expired",
      }, { status: 403 });
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data: { plan },
    });

    return NextResponse.json({ success: true, redirect: "/dashboard", plan: planKey });
  } catch (error) {
    console.error("Trial plan selection error:", error);
    return NextResponse.json({ error: "Unable to select this plan right now." }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    const url = new URL("/login", request.url);
    url.searchParams.set("callbackUrl", new URL(request.url).pathname + new URL(request.url).search);
    return NextResponse.redirect(url);
  }

  const requestUrl = new URL(request.url);
  const planKey = String(requestUrl.searchParams.get("plan") ?? "").toLowerCase() as keyof typeof validPlans;
  const plan = validPlans[planKey];

  if (!plan) {
    return NextResponse.redirect(new URL("/pricing?error=invalid-plan", request.url));
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      stripeSubscriptionId: true,
      trialEndsAt: true,
    },
  });

  if (!user || user.stripeSubscriptionId) {
    return NextResponse.redirect(new URL("/pricing", request.url));
  }

  if (!user.trialEndsAt || user.trialEndsAt.getTime() <= Date.now()) {
    return NextResponse.redirect(new URL("/pricing?trial=expired", request.url));
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { plan },
  });

  return NextResponse.redirect(new URL("/dashboard", request.url));
}
