"use client";

import { useState, useTransition } from "react";
import { generateUserStripe } from "@/actions/generate-user-stripe";
import { SubscriptionPlan, UserSubscriptionPlan } from "@/types";

import { Button } from "@/components/ui/button";
import { Icons } from "@/components/shared/icons";

interface BillingFormButtonProps {
  offer: SubscriptionPlan;
  subscriptionPlan: UserSubscriptionPlan;
  year: boolean;
}

export function BillingFormButton({
  year,
  offer,
  subscriptionPlan,
}: BillingFormButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const priceId = offer.stripeIds[year ? "yearly" : "monthly"];

  const stripeSessionAction = () => {
    setError("");

    if (!priceId) {
      setError("This plan is not configured for the selected billing period. Please choose another option.");
      return;
    }

    startTransition(async () => {
      try {
        const result = await generateUserStripe(priceId);
        if (result?.status === "error") {
          setError(result.message || "Checkout could not be started. Please try again.");
        }
      } catch (actionError) {
        console.error("Billing button action failed:", actionError);
        setError("Checkout could not be started. Please try again.");
      }
    });
  };

  const userOffer = subscriptionPlan.stripePriceId === priceId;

  return (
    <div className="w-full">
      <Button
        variant={userOffer ? "default" : "outline"}
        rounded="full"
        className="w-full"
        disabled={isPending}
        onClick={stripeSessionAction}
      >
        {isPending ? (
          <>
            <Icons.spinner className="mr-2 size-4 animate-spin" /> Loading...
          </>
        ) : (
          <>{userOffer ? "Manage Subscription" : "Upgrade"}</>
        )}
      </Button>
      {error && (
        <p role="alert" className="mt-3 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-left text-sm text-red-300">
          {error}
        </p>
      )}
    </div>
  );
}
