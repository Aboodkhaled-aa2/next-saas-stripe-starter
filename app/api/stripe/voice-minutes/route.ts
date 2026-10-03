import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { stripe } from "@/lib/stripe";
import { env } from "@/env.mjs";

const voicePackages = {
  "100": {
    minutes: 100,
    priceId: env.STRIPE_VOICE_100_PRICE_ID,
  },
  "500": {
    minutes: 500,
    priceId: env.STRIPE_VOICE_500_PRICE_ID,
  },
  "1000": {
    minutes: 1000,
    priceId: env.STRIPE_VOICE_1000_PRICE_ID,
  },
} as const;

export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const packageKey = String(body.minutes ?? "");

    if (!(packageKey in voicePackages)) {
      return NextResponse.json(
        { error: "Invalid voice minute package." },
        { status: 400 },
      );
    }

    const selected =
      voicePackages[packageKey as keyof typeof voicePackages];

    if (!selected.priceId) {
      console.error(
        `Missing Stripe price ID for voice package: ${packageKey}`,
      );

      return NextResponse.json(
        { error: "This voice minute package is not configured." },
        { status: 500 },
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, email: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found." },
        { status: 404 },
      );
    }

    const baseUrl = env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const stripeSession = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: user.email ?? undefined,
      line_items: [
        {
          price: selected.priceId,
          quantity: 1,
        },
      ],
      metadata: {
        type: "voice_minutes",
        userId: user.id,
        minutes: String(selected.minutes),
        package: packageKey,
      },
      success_url: `${baseUrl}/dashboard?voice_purchase=success`,
      cancel_url: `${baseUrl}/dashboard?voice_purchase=canceled`,
    });

    return NextResponse.json({ url: stripeSession.url });
  } catch (error) {
    console.error("[VOICE MINUTE CHECKOUT ERROR]", error);

    return NextResponse.json(
      { error: "Unable to create voice minute checkout." },
      { status: 500 },
    );
  }
}
