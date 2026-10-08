import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { stripe } from "@/lib/stripe";
import { env } from "@/env.mjs";

const messagePackages = {
  "1000": {
    messages: 1000,
    priceId: env.STRIPE_MESSAGES_1000_PRICE_ID,
  },
  "5000": {
    messages: 5000,
    priceId: env.STRIPE_MESSAGES_5000_PRICE_ID,
  },
  "10000": {
    messages: 10000,
    priceId: env.STRIPE_MESSAGES_10000_PRICE_ID,
  },
} as const;

export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const packageKey = String(body.messages ?? "");

    if (!(packageKey in messagePackages)) {
      return NextResponse.json(
        { error: "Invalid message package." },
        { status: 400 },
      );
    }

    const selected =
      messagePackages[packageKey as keyof typeof messagePackages];

    if (!selected.priceId) {
      console.error(
        `Missing Stripe price ID for message package: ${packageKey}`,
      );

      return NextResponse.json(
        { error: "This message package is not configured." },
        { status: 500 },
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, email: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    const baseUrl = env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const stripeSession = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: user.email ?? undefined,
      line_items: [{ price: selected.priceId, quantity: 1 }],
      metadata: {
        type: "message_credits",
        userId: user.id,
        messages: String(selected.messages),
        package: packageKey,
      },
      success_url: `${baseUrl}/dashboard?message_purchase=success`,
      cancel_url: `${baseUrl}/dashboard?message_purchase=canceled`,
    });

    return NextResponse.json({ url: stripeSession.url });
  } catch (error) {
    console.error("[MESSAGE CREDIT CHECKOUT ERROR]", error);

    return NextResponse.json(
      { error: "Unable to create message credit checkout." },
      { status: 500 },
    );
  }
}
