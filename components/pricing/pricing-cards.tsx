"use client";

import { useContext, useEffect, useRef } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { pricingData } from "@/config/subscriptions";
import { UserSubscriptionPlan } from "@/types";
import { cn } from "@/lib/utils";

import { BillingFormButton } from "@/components/forms/billing-form-button";
import { generateUserStripe } from "@/actions/generate-user-stripe";
import { ModalContext } from "@/components/modals/providers";
import { HeaderSection } from "@/components/shared/header-section";
import { Icons } from "@/components/shared/icons";
import MaxWidthWrapper from "@/components/shared/max-width-wrapper";

interface PricingCardsProps {
  userId?: string;
  subscriptionPlan?: UserSubscriptionPlan;
}

export function PricingCards({
  userId,
  subscriptionPlan,
}: PricingCardsProps) {
  const { setShowSignInModal } = useContext(ModalContext);
  const searchParams = useSearchParams();
  const checkoutStarted = useRef(false);

  useEffect(() => {
    if (!userId || !subscriptionPlan || checkoutStarted.current) return;

    const planParam = searchParams.get("plan")?.toLowerCase();
    if (!planParam) return;

    const selectedOffer = pricingData.find(
      (offer) => offer.title.toLowerCase() === planParam,
    );

    if (!selectedOffer?.stripeIds.monthly) return;

    checkoutStarted.current = true;

    generateUserStripe(selectedOffer.stripeIds.monthly).catch(() => {
      checkoutStarted.current = false;
    });
  }, [searchParams, subscriptionPlan, userId]);

  const PricingCard = ({
    offer,
  }: {
    offer: (typeof pricingData)[number];
  }) => {
    const isBusiness = offer.title.toLowerCase() === "business";

    return (
      <div
        className={cn(
          "relative flex flex-col overflow-hidden rounded-3xl border p-8 text-left transition-all",
          "border-gray-800 bg-[#0a0f1d] hover:border-gray-700",
          isBusiness &&
            "border-2 border-blue-600 shadow-2xl shadow-blue-900/20",
        )}
        key={offer.title}
      >
        <div className="mb-6">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-lg font-bold uppercase tracking-wider text-white">
              {offer.title}
            </span>
          </div>

          <p className="min-h-[40px] text-sm text-gray-400">
            {offer.description}
          </p>
        </div>

        <div className="mb-6 flex items-baseline">
          <span className="text-5xl font-extrabold text-white">
            ${offer.prices.monthly}
          </span>

          <span className="ml-2 text-sm text-gray-400">
            /month
          </span>
        </div>

        <div className="mb-8">
          {userId && subscriptionPlan ? (
            <BillingFormButton
              year={false}
              offer={offer}
              subscriptionPlan={subscriptionPlan}
            />
          ) : (
            <Link
              href={`/signup?plan=${offer.title.toLowerCase()}`}
              className="inline-block w-full rounded-xl bg-blue-600 px-4 py-3 text-center font-medium text-white shadow-lg shadow-blue-600/30 transition-colors hover:bg-blue-500"
            >
              Choose {offer.title} →
            </Link>
          )}
        </div>

        <div className="mt-auto border-t border-gray-800/80 pt-6">
          <p className="mb-4 text-xs font-bold uppercase tracking-wider text-gray-400">
            INCLUDES
          </p>

          <ul className="space-y-3 text-sm text-gray-300">
            {offer.benefits.slice(0, 5).map((feature) => (
              <li
                className="flex items-start gap-x-3"
                key={feature}
              >
                <div className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border border-blue-800 bg-blue-950">
                  <Icons.check className="size-3.5 text-blue-400" />
                </div>
                <span>{feature}</span>
              </li>
            ))}
          </ul>

          {offer.benefits.length > 5 && (
            <details className="mt-5 border-t border-gray-800/80 pt-4">
              <summary className="cursor-pointer list-none text-center text-sm font-semibold text-blue-400 transition hover:text-blue-300">
                View all features
              </summary>
              <ul className="mt-4 space-y-3 text-sm text-gray-300">
                {offer.benefits.slice(5).map((feature) => (
                  <li className="flex items-start gap-x-3" key={feature}>
                    <div className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border border-blue-800 bg-blue-950">
                      <Icons.check className="size-3.5 text-blue-400" />
                    </div>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </details>
          )}
        </div>
      </div>
    );
  };

  return (
    <MaxWidthWrapper>
      <section className="flex flex-col items-center py-10 text-center">
        <HeaderSection
          label="Pricing"
          title="Start at full speed!"
        />

        <div className="grid w-full max-w-7xl items-stretch gap-8 bg-inherit py-10 lg:grid-cols-3">
          {pricingData.map((offer) => (
            <PricingCard
              offer={offer}
              key={offer.title}
            />
          ))}
        </div>

        <p className="mt-6 text-center text-base text-gray-400">
          Email{" "}
          <a
            className="font-medium text-blue-400 hover:underline"
            href="mailto:support@smartcleaningdesk.com"
          >
            support@smartcleaningdesk.com
          </a>{" "}
          to contact our support team.
        </p>
      </section>
    </MaxWidthWrapper>
  );
}
