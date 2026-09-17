"use client";

import { useContext } from "react";
import Link from "next/link";
import { UserSubscriptionPlan } from "@/types";
import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";
import { BillingFormButton } from "@/components/forms/billing-form-button";
import { ModalContext } from "@/components/modals/providers";
import { HeaderSection } from "@/components/shared/header-section";
import { Icons } from "@/components/shared/icons";
import MaxWidthWrapper from "@/components/shared/max-width-wrapper";

interface PricingCardsProps {
  userId?: string;
  subscriptionPlan?: UserSubscriptionPlan;
}

// الخطط الشهرية المباشرة لمنصة Smart Cleaning Desk
const cleaningPricingData = [
  {
    title: "Starter",
    description: "Essential messaging and lead capture for growing cleaning teams.",
    price: 49,
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
    price: 99,
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
    price: 249,
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
  const { setShowSignInModal } = useContext(ModalContext);

  const PricingCard = ({ offer }: { offer: typeof cleaningPricingData[0] }) => {
    return (
      <div
        className={cn(
          "relative flex flex-col overflow-hidden rounded-3xl border shadow-sm bg-card text-card-foreground text-left",
          offer.title.toLocaleLowerCase() === "business"
            ? "-m-0.5 border-2 border-purple-500 shadow-lg"
            : "border-border",
        )}
        key={offer.title}
      >
        <div className="min-h-[170px] items-start space-y-3 bg-muted/40 p-6">
          <p className="flex font-urban text-sm font-bold uppercase tracking-wider text-purple-400">
            {offer.title}
          </p>
          <p className="text-xs text-muted-foreground">{offer.description}</p>

          <div className="flex items-baseline pt-2">
            <span className="text-4xl font-extrabold text-foreground">
              ${offer.price}
            </span>
            <span className="ml-2 text-sm font-medium text-muted-foreground">
              /month
            </span>
          </div>

          <div className="text-xs text-muted-foreground font-medium">
            Billed monthly, cancel anytime
          </div>
        </div>

        <div className="flex h-full flex-col justify-between gap-8 p-6">
          <ul className="space-y-3 text-left text-sm font-medium leading-normal">
            {offer.benefits.map((feature) => (
              <li className="flex items-start gap-x-3" key={feature}>
                <Icons.check className="size-5 shrink-0 text-purple-500 mt-0.5" />
                <span className="text-muted-foreground">{feature}</span>
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
                  year={false}
                  offer={{ ...offer, prices: { monthly: offer.price, yearly: 0 } } as any}
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
        <HeaderSection label="Pricing" title="Simple, transparent pricing" />

        <p className="mt-2 text-muted-foreground text-sm">
          Choose the perfect plan for your cleaning business. No hidden fees.
        </p>

        <div className="grid gap-6 bg-inherit py-10 lg:grid-cols-3 w-full max-w-7xl">
          {cleaningPricingData.map((offer) => (
            <PricingCard offer={offer} key={offer.title} />
          ))}
        </div>

        <p className="mt-4 text-balance text-center text-base text-muted-foreground">
          Email{" "}
          <a
            className="font-medium text-primary hover:underline"
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
