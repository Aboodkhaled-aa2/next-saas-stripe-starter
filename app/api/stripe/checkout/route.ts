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

export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 },
      );
    }

    const body = await req.json();
    const plan = String(body.plan || "").toUpperCase() as Plan;

    if (!plan || !planPrices[plan]) {
      return NextResponse.json(
        { error: "Invalid plan selected." },
        { status: 400 },
      );
    }

    const priceId = planPrices[plan];

    if (!priceId) {
      console.error(`Missing Stripe price ID for plan: ${plan}`);

      return NextResponse.json(
        { error: "This plan is not configured for checkout." },
        { status: 500 },
      );
    }

    const user = await prisma.user.findUnique({
      where: {
        id: session.user.id,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found." },
        { status: 404 },
      );
    }

    const baseUrl =
      env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const stripeSession = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer_email: user.email ?? undefined,
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      metadata: {
        userId: user.id,
        plan,
      },
      success_url: `${baseUrl}/payment-success`,
      cancel_url: `${baseUrl}/pricing?plan=${plan.toLowerCase()}&canceled=true`,
    });

    return NextResponse.json({
      url: stripeSession.url,
    });
  } catch (error) {
    console.error("[STRIPE CHECKOUT ERROR]", error);

    return NextResponse.json(
      { error: "Unable to create checkout session." },
      { status: 500 },
    );
  }
}
