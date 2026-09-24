import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { pricingData } from "@/config/subscriptions";
import { stripe } from "@/lib/stripe";
import { absoluteUrl } from "@/lib/utils";

export async function POST(req: Request) {
  try {
    const session = await auth();
    const user = session?.user;

    if (!user?.id || !user.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const plan = String(body?.plan || "").toLowerCase();

    const offer = pricingData.find(
      (item) => item.title.toLowerCase() === plan,
    );

    const priceId = offer?.stripeIds.monthly;

    if (!priceId || priceId.startsWith("price_placeholder_")) {
      return NextResponse.json(
        { error: "Invalid or unconfigured plan selected" },
        { status: 400 },
      );
    }

    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      customer_email: user.email,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: absoluteUrl("/payment-success"),
      cancel_url: absoluteUrl("/pricing?canceled=true"),
      metadata: {
        userId: user.id,
      },
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error("Stripe Error:", error);

    return NextResponse.json(
      { error: "Unable to create checkout session" },
      { status: 500 },
    );
  }
}
