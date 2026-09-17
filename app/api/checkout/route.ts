import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2025-02-27.acacia" as any,
});

// الـ Price IDs الحقيقية الخاصة بخططك على Stripe
const PRICE_MAP: Record<string, string> = {
  starter: "price_1UGfnw2M5bpEgchA0Unbwzg2",
  business: "price_1UGfqo2M5bpEgchAc37UEGLh",
  pro: "price_1UGfrS2M5bpEgchA5lBSFEPr",
};

export async function POST(req: Request) {
  try {
    const { email, plan } = await req.json();
    const priceId = PRICE_MAP[plan];

    if (!priceId) {
      return NextResponse.json({ error: "Invalid plan selected" }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      customer_email: email,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://smartcleaningdesk.com'}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://smartcleaningdesk.com'}/signup?canceled=true`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error("Stripe Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
