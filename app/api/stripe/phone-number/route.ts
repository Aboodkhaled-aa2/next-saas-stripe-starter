import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { env } from "@/env.mjs";
import { prisma } from "@/lib/db";
import { stripe } from "@/lib/stripe";

const PHONE_NUMBER_MONTHLY_PRICE_CENTS = 999;

export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const phoneNumber = String(body.phoneNumber ?? "").trim();

    if (!/^\+[1-9]\d{7,14}$/.test(phoneNumber)) {
      return NextResponse.json(
        { error: "Invalid phone number format." },
        { status: 400 },
      );
    }

    const existingNumber = await prisma.phoneNumber.findUnique({
      where: { phoneNumber },
      select: { id: true, status: true },
    });

    if (existingNumber) {
      return NextResponse.json(
        { error: "This phone number is already associated with an account." },
        { status: 409 },
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

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer_email: user.email ?? undefined,
      line_items: [
        {
          price_data: {
            currency: "usd",
            unit_amount: PHONE_NUMBER_MONTHLY_PRICE_CENTS,
            recurring: { interval: "month" },
            product_data: {
              name: "Smart Cleaning Desk Business Phone Number",
              description: phoneNumber,
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        type: "phone_number",
        userId: user.id,
        phoneNumber,
      },
      subscription_data: {
        metadata: {
          type: "phone_number",
          userId: user.id,
          phoneNumber,
        },
      },
      success_url: `${baseUrl}/dashboard/phone?purchase=success`,
      cancel_url: `${baseUrl}/dashboard/phone?purchase=canceled`,
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error("[PHONE NUMBER CHECKOUT ERROR]", error);

    return NextResponse.json(
      { error: "Unable to start phone number checkout." },
      { status: 500 },
    );
  }
}
