import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { stripe } from "@/lib/stripe";
import { env } from "@/env.mjs";

const planPrices = {
  STARTER: env.NEXT_PUBLIC_STRIPE_STARTER_MONTHLY_PLAN_ID,
  BUSINESS: env.NEXT_PUBLIC_STRIPE_BUSINESS_MONTHLY_PLAN_ID,
  PRO: env.NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PLAN_ID,
} as const;

type Plan = keyof typeof planPrices;

export async function POST() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        plan: true,
        emailVerified: true,
        trialEndsAt: true,
        stripeSubscriptionId: true,
        stripePriceId: true,
        stripeCurrentPeriodEnd: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    if (!user.emailVerified) {
      return NextResponse.json({ error: "Verify your email before subscribing." }, { status: 403 });
    }

    // The server-side database plan is authoritative; never trust a client-supplied plan.
    const plan = user.plan as Plan;
    const priceId = planPrices[plan];

    if (!priceId) {
      return NextResponse.json({ error: "This saved plan is not configured for checkout." }, { status: 500 });
    }

    const now = new Date();
    const hasActiveSubscription =
      Boolean(user.stripeSubscriptionId) &&
      Boolean(user.stripePriceId) &&
      Boolean(user.stripeCurrentPeriodEnd && user.stripeCurrentPeriodEnd > now);

    if (hasActiveSubscription) {
      return NextResponse.json({ code: "SUBSCRIPTION_ACTIVE", redirect: "/dashboard" });
    }

    // Missing trial dates mean this is a legacy account. Do not create a new trial
    // or allow checkout to silently reset its trial clock.
    if (!user.trialEndsAt) {
      return NextResponse.json({
        error: "No trial end date is recorded for this account. Contact support to continue.",
        code: "TRIAL_NOT_CONFIGURED",
      }, { status: 403 });
    }

    if (now < user.trialEndsAt) {
      return NextResponse.json({
        error: "Your free trial is still active. No payment is needed yet.",
        trialEndsAt: user.trialEndsAt,
        code: "TRIAL_ACTIVE",
      }, { status: 403 });
    }

    const baseUrl = env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const stripeSession = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer_email: user.email ?? undefined,
      payment_method_collection: "always",
      line_items: [{ price: priceId, quantity: 1 }],
      subscription_data: {
        metadata: { userId: user.id, plan },
      },
      metadata: { userId: user.id, plan },
      success_url: `${baseUrl}/payment-success`,
      cancel_url: `${baseUrl}/pricing?plan=${plan.toLowerCase()}&canceled=true`,
    });

    return NextResponse.json({ url: stripeSession.url });
  } catch (error) {
    console.error("[STRIPE CHECKOUT ERROR]", error);
    return NextResponse.json({ error: "Unable to create checkout session." }, { status: 500 });
  }
}
