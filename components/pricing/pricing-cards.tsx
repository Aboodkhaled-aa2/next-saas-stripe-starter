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

// الخطط الشهرية بتصميم الداكن المخصص لمنصة Smart Cleaning Desk
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
  },
];

export function PricingCards({ userId, subscriptionPlan }: PricingCardsProps) {
  const { setShowSignInModal } = useContext(ModalContext);

  const PricingCard = ({ offer }: { offer: typeof cleaningPricingData[0] }) => {
    const isBusiness = offer.title.toLocaleLowerCase() === "business";

    return (
      <div
        className={cn(
          "relative flex flex-col overflow-hidden rounded-3xl p-8 text-left transition-all",
          "bg-[#0a0f1d] border", // لون خلفية غامق جداً متناسق مع التصميم
          isBusiness
            ? "border-2 border-blue-600 shadow-2xl shadow-blue-900/20"
            : "border-gray-800 hover:border-gray-700"
        )}
        key={offer.title}
      >
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-lg font-bold text-white uppercase tracking-wider">
              {offer.title}
            </span>
          </div>
          <p className="text-sm text-gray-400 min-h-[40px]">{offer.description}</p>
        </div>

        <div className="flex items-baseline mb-6">
          <span className="text-5xl font-extrabold text-white">${offer.price}</span>
          <span className="ml-2 text-sm text-gray-400">/month</span>
        </div>

        {/* زر الاختيار بنفس لون وتصميم الصورة */}
        <div className="mb-8">
          {userId && subscriptionPlan ? (
            offer.title === "Starter" ? (
              <Link
                href="/dashboard"
                className="w-full inline-block py-3 px-4 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-xl text-center transition-colors shadow-lg shadow-blue-600/30"
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
            <button
              onClick={() => setShowSignInModal(true)}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-xl text-center transition-colors shadow-lg shadow-blue-600/30"
            >
              Choose {offer.title} →
            </button>
          )}
        </div>

        <div className="border-t border-gray-800/80 pt-6 mt-auto">
          <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4">
            INCLUDES
          </p>
          <ul className="space-y-3 text-sm text-gray-300">
            {offer.benefits.map((feature) => (
              <li className="flex items-start gap-x-3" key={feature}>
                <div className="size-5 shrink-0 rounded-full bg-blue-950 flex items-center justify-center mt-0.5 border border-blue-800">
                  <Icons.check className="size-3.5 text-blue-400" />
                </div>
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  };

  return (
    <MaxWidthWrapper>
      <section className="flex flex-col items-center text-center py-10">
        <HeaderSection label="Pricing" title="Start at full speed !" />

        <div className="grid gap-8 bg-inherit py-10 lg:grid-cols-3 w-full max-w-7xl items-stretch">
          {cleaningPricingData.map((offer) => (
            <PricingCard offer={offer} key={offer.title} />
          ))}
        </div>

        <p className="mt-6 text-balance text-center text-base text-gray-400">
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
