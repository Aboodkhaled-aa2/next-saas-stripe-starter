import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { pricingData } from "@/config/subscriptions";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/db";
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

    const account = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        stripeCustomerId: true,
        stripeSubscriptionId: true,
        trialStartedAt: true,
        trialEndsAt: true,
      },
    });

    if (!account) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 });
    }

    const now = new Date();
    const trialIsActive =
      !account.stripeSubscriptionId &&
      Boolean(account.trialStartedAt && account.trialEndsAt && account.trialEndsAt > now);

    if (trialIsActive) {
      return NextResponse.json(
        {
          error: "Your free trial is still active. You can subscribe after it ends.",
          code: "TRIAL_ACTIVE",
          trialEndsAt: account.trialEndsAt,
        },
        { status: 409 },
      );
    }

    if (account.stripeSubscriptionId) {
      try {
        const existingSubscription = await stripe.subscriptions.retrieve(
          account.stripeSubscriptionId,
        );

        if (["active", "trialing", "past_due", "unpaid"].includes(existingSubscription.status)) {
          return NextResponse.json(
            {
              error: "You already have a subscription. Manage or update it from billing.",
              code: "SUBSCRIPTION_EXISTS",
            },
            { status: 409 },
          );
        }
      } catch (error) {
        console.error("Failed to verify existing Stripe subscription:", error);
        return NextResponse.json(
          { error: "We could not verify your current subscription. Please try again later." },
          { status: 503 },
        );
      }
    }

    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      ...(account.stripeCustomerId
        ? { customer: account.stripeCustomerId }
        : { customer_email: user.email }),
      line_items: [{ price: priceId, quantity: 1 }],
      mode: "subscription",
      success_url: absoluteUrl("/payment-success"),
      cancel_url: absoluteUrl("/pricing?canceled=true"),
      metadata: { userId: user.id },
      subscription_data: {
        metadata: { userId: user.id, plan },
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
