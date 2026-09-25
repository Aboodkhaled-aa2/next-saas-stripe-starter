import { auth } from "@/auth";

import { prisma } from "@/lib/db";
import { stripe } from "@/lib/stripe";

export const DELETE = auth(async (req) => {
  if (!req.auth) {
    return new Response("Not authenticated", { status: 401 });
  }

  const currentUser = req.auth.user;
  if (!currentUser) {
    return new Response("Invalid user", { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: {
        id: currentUser.id,
      },
      select: {
        stripeSubscriptionId: true,
        stripeCustomerId: true,
      },
    });

    if (!user) {
      return new Response("User not found", { status: 404 });
    }

    if (user.stripeSubscriptionId) {
      try {
        const subscription = await stripe.subscriptions.retrieve(
          user.stripeSubscriptionId,
        );

        if (
          subscription.status !== "canceled" &&
          subscription.status !== "incomplete_expired"
        ) {
          await stripe.subscriptions.cancel(subscription.id);
        }
      } catch (error) {
        if (
          !(
            error &&
            typeof error === "object" &&
            "code" in error &&
            error.code === "resource_missing"
          )
        ) {
          console.error("Stripe subscription cancellation error:", error);
          return new Response("Unable to cancel subscription", { status: 500 });
        }
      }
    } else if (user.stripeCustomerId) {
      const subscriptions = await stripe.subscriptions.list({
        customer: user.stripeCustomerId,
        status: "all",
        limit: 100,
      });

      for (const subscription of subscriptions.data) {
        if (
          subscription.status !== "canceled" &&
          subscription.status !== "incomplete_expired"
        ) {
          await stripe.subscriptions.cancel(subscription.id);
        }
      }
    }

    await prisma.user.delete({
      where: {
        id: currentUser.id,
      },
    });
  } catch (error) {
    console.error("Account deletion error:", error);
    return new Response("Internal server error", { status: 500 });
  }

  return new Response("User deleted successfully!", { status: 200 });
});
