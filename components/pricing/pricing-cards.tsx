"use client";

import { useContext, useState } from "react";
import Link from "next/link";
import { UserSubscriptionPlan } from "@/types";
import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { BillingFormButton } from "@/components/forms/billing-form-button";
import { ModalContext } from "@/components/modals/providers";
import { HeaderSection } from "@/components/shared/header-section";
import { Icons } from "@/components/shared/icons";
import MaxWidthWrapper from "@/components/shared/max-width-wrapper";

interface PricingCardsProps {
  userId?: string;
  subscriptionPlan?: UserSubscriptionPlan;
}

// الخطط الحقيقية الخاصة بمنصة Smart Cleaning Desk
const cleaningPricingData = [
  {
    title: "Starter",
    description: "Essential messaging and lead capture for growing cleaning teams.",
    prices: { monthly: 49, yearly: 470 }, // 470 سنويّاً كمثال أو حسب رغبتك
    benefits: [
      "AI Customer Messaging",
      "Instagram",
      "Facebook",
      "WhatsApp",
      "Lead Capture",
      "Customer Inbox",
      "Customer Information Collection",
      "Business Hours & FAQ Responses",
      "Conversation History",
      "Basic Automations",
      "Customer Management",
      "Email Support",
    ],
    limitations: [],
  },
  {
    title: "Business",
    description: "Full automation with voice AI and advanced booking workflows.",
    prices: { monthly: 99, yearly: 950 },
    benefits: [
      "Everything in Starter",
      "AI Voice Receptionist",
      "100 Voice Minutes / Month",
      "Appointment Booking",
      "Calendar Integration",
      "Automated Lead Follow-Ups",
      "Lead Qualification",
      "Quote & Service Information",
      "Booking Reminders",
      "Review Request Automation",
      "Lead Status Management",
      "Custom AI Instructions",
      "Conversation & Lead Tracking",
    ],
    limitations: [],
  },
  {
    title: "Pro",
    description: "Maximum power, custom phone numbers, and advanced AI behavior.",
    prices: { monthly: 249, yearly: 2390 },
    benefits: [
      "Everything in Business",
      "Dedicated Business Phone Number",
      "500 Voice Minutes / Month",
      "Advanced Call Handling",
      "Call Transfer",
      "Advanced Lead Qualification",
      "Advanced Follow-Ups",
      "Custom Booking Rules",
      "Multiple Service Types",
      "Custom AI Knowledge Base",
      "Advanced Customer Management",
      "Detailed Call & Conversation History",
      "Custom AI Behavior",
      "Priority Support",
    ],
    limitations: [],
  },
];

export function PricingCards({ userId, subscriptionPlan }: PricingCardsProps) {
  const isYearlyDefault =
    !subscriptionPlan?.stripeCustomerId || subscriptionPlan.interval === "year"
      ? true
      : false;
  const [isYearly, setIsYearly] = useState<boolean>(!!isYearlyDefault);
  const { setShowSignInModal } = useContext(ModalContext);

  const toggleBilling = () => {
    setIsYearly(!isYearly);
  };

  const PricingCard = ({ offer }: { offer: typeof cleaningPricingData[0] }) => {
    return (
      <div
        className={cn(
          "relative flex flex-col overflow-hidden rounded-3xl border shadow-sm bg-background text-left",
          offer.title.toLocaleLowerCase() === "business"
            ? "-m-0.5 border-2 border-purple-400"
            : "",
        )}
        key={offer.title}
      >
        <div className="min-h-[170px] items-start space-y-3 bg-muted/50 p-6">
          <p className="flex font-urban text-sm font-bold uppercase tracking-wider text-purple-400">
            {offer.title}
          </p>
          <p className="text-xs text-muted-foreground">{offer.description}</p>

          <div className="flex flex-row">
            <div className="flex items-end">
              <div className="flex text-left text-3xl font-semibold leading-6">
                {isYearly && offer.prices.monthly > 0 ? (
                  <>
                    <span className="mr-2 text-muted-foreground/80 line-through text-xl">
                      ${offer.prices.monthly}
                    </span>
                    <span>${Math.round(offer.prices.yearly / 12)}</span>
                  </>
                ) : (
                  `$${offer.prices.monthly}`
                )}
              </div>
              <div className="-mb-1 ml-2 text-left text-sm font-medium text-muted-foreground">
                <div>/month</div>
              </div>
            </div>
          </div>
          {offer.prices.monthly > 0 ? (
            <div className="text-left text-xs text-muted-foreground">
              {isYearly
                ? `$${offer.prices.yearly} will be charged when annual`
                : "when charged monthly"}
            </div>
          ) : null}
        </div>

        <div className="flex h-full flex-col justify-between gap-8 p-6">
          <ul className="space-y-3 text-left text-sm font-medium leading-normal">
            {offer.benefits.map((feature) => (
              <li className="flex items-start gap-x-3" key={feature}>
                <Icons.check className="size-5 shrink-0 text-purple-500" />
                <p className="text-muted-foreground">{feature}</p>
              </li>
            ))}
          </ul>

          <div className="pt-4">
            {userId && subscriptionPlan ? (
              offer.title === "Starter" ? (
                <Link
                  href="/dashboard"
                  className={cn(
                    buttonVariants({
                      variant: "outline",
                      rounded: "full",
                    }),
                    "w-full",
                  )}
                >
                  Go to dashboard
                </Link>
              ) : (
                <BillingFormButton
                  year={isYearly}
                  offer={offer as any}
                  subscriptionPlan={subscriptionPlan}
                />
              )
            ) : (
              <Button
                variant={
                  offer.title.toLocaleLowerCase() === "business"
                    ? "default"
                    : "outline"
                }
                rounded="full"
                className="w-full"
                onClick={() => setShowSignInModal(true)}
              >
                Choose {offer.title} →
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <MaxWidthWrapper>
      <section className="flex flex-col items-center text-center">
        <HeaderSection label="Pricing" title="Start at full speed !" />

        <div className="mb-4 mt-10 flex items-center gap-5">
          <ToggleGroup
            type="single"
            size="sm"
            defaultValue={isYearly ? "yearly" : "monthly"}
            onValueChange={toggleBilling}
            aria-label="toggle-year"
            className="h-9 overflow-hidden rounded-full border bg-background p-1 *:h-7 *:text-muted-foreground"
          >
            <ToggleGroupItem
              value="yearly"
              className="rounded-full px-5 data-[state=on]:!bg-primary data-[state=on]:!text-primary-foreground"
              aria-label="Toggle yearly billing"
            >
              Yearly (-20%)
            </ToggleGroupItem>
            <ToggleGroupItem
              value="monthly"
              className="rounded-full px-5 data-[state=on]:!bg-primary data-[state=on]:!text-primary-foreground"
              aria-label="Toggle monthly billing"
            >
              Monthly
            </ToggleGroupItem>
          </ToggleGroup>
        </div>

        <div className="grid gap-6 bg-inherit py-5 lg:grid-cols-3 w-full max-w-7xl">
          {cleaningPricingData.map((offer) => (
            <PricingCard offer={offer} key={offer.title} />
          ))}
        </div>

        <p className="mt-6 text-balance text-center text-base text-muted-foreground">
          Email{" "}
          <a
            className="font-medium text-primary hover:underline"
            href="mailto:support@smartcleaningdesk.com"
          >
            support@smartcleaningdesk.com
          </a>{" "}
          to contact our support team.
          <br />
          <strong>
            You can test the subscriptions and won&apos;t be charged.
          </strong>
        </p>
      </section>
    </MaxWidthWrapper>
  );
}
