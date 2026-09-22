import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { stripe } from "@/lib/stripe";
import { env } from "@/env.mjs";

const planPrices = {
  STARTER: "price_1UGfnw2M5bpEgchA0Unbwzg2",
  BUSINESS: "price_1UGfqo2M5bpEgchAc37UEGLh",
  PRO: "price_1UGfrS2M5bpEgchA5lBSFEPr",
} as const;

type Plan = keyof typeof planPrices;

export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const plan = String(body.plan || "").toUpperCase() as Plan;

    if (!plan || !planPrices[plan]) {
      return NextResponse.json(
        { error: "Invalid plan selected." },
        { status: 400 }
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
        { status: 404 }
      );
    }

    const priceId = planPrices[plan];

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

      success_url: `${baseUrl}/dashboard?success=true`,
      cancel_url: `${baseUrl}/signup?plan=${plan.toLowerCase()}&canceled=true`,
    });

    return NextResponse.json({
      url: stripeSession.url,
    });
  } catch (error) {
    console.error("[STRIPE CHECKOUT ERROR]", error);

    return NextResponse.json(
      { error: "Unable to create checkout session." },
      { status: 500 }
    );
  }
}
