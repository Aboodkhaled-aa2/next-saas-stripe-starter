"use server";

import { redirect } from "next/navigation";
import { auth } from "@/auth";

import { prisma } from "@/lib/db";
import { stripe } from "@/lib/stripe";
import { absoluteUrl } from "@/lib/utils";

export type responseAction = {
  status: "success" | "error";
  stripeUrl?: string;
};

const billingUrl = absoluteUrl("/dashboard/billing");

export async function openCustomerPortal(
  _userStripeId?: string,
): Promise<responseAction> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      throw new Error("Unauthorized");
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { stripeCustomerId: true },
    });

    if (!user?.stripeCustomerId) {
      throw new Error("No Stripe customer is linked to this account");
    }

    const stripeSession = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: billingUrl,
    });

    redirect(stripeSession.url);
  } catch (error) {
    // Next.js redirect() throws a control-flow error; allow it to propagate.
    if (
      error &&
      typeof error === "object" &&
      "digest" in error &&
      typeof error.digest === "string" &&
      error.digest.startsWith("NEXT_REDIRECT")
    ) {
      throw error;
    }

    console.error("Failed to generate Stripe customer portal session", error);
    throw new Error("Failed to generate user stripe session");
  }
}
