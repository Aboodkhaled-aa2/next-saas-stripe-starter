import { PlansRow, SubscriptionPlan } from "types";
import { env } from "@/env.mjs";

export const pricingData: SubscriptionPlan[] = [
  {
    title: "Starter",
    description: "Essential messaging and lead capture for growing cleaning teams.",
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
    prices: {
      monthly: 49,
      yearly: 490,
    },
    stripeIds: {
      monthly: env.NEXT_PUBLIC_STRIPE_STARTER_MONTHLY_PLAN_ID || "price_placeholder_starter",
      yearly: env.NEXT_PUBLIC_STRIPE_STARTER_YEARLY_PLAN_ID || "price_placeholder_starter_yearly",
    },
  },
  {
    title: "Business",
    description: "Full automation with voice AI and advanced booking workflows.",
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
    prices: {
      monthly: 99,
      yearly: 990,
    },
    stripeIds: {
      monthly: env.NEXT_PUBLIC_STRIPE_BUSINESS_MONTHLY_PLAN_ID || "price_placeholder_business",
      yearly: env.NEXT_PUBLIC_STRIPE_BUSINESS_YEARLY_PLAN_ID || "price_placeholder_business_yearly",
    },
  },
  {
    title: "Pro",
    description: "Maximum power, custom phone numbers, and advanced AI behavior.",
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
    prices: {
      monthly: 249,
      yearly: 2490,
    },
    stripeIds: {
      monthly: env.NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PLAN_ID || "price_placeholder_pro",
      yearly: env.NEXT_PUBLIC_STRIPE_PRO_YEARLY_PLAN_ID || "price_placeholder_pro_yearly",
    },
  },
];

export const plansColumns = [
  "starter",
  "business",
  "pro",
  "enterprise",
] as const;

export const comparePlans: PlansRow[] = [
  {
    feature: "AI Customer Messaging",
    starter: true,
    business: true,
    pro: true,
    enterprise: "Custom",
    tooltip: "All plans include AI messaging channels.",
  },
  {
    feature: "AI Voice Receptionist",
    starter: false,
    business: "100 Mins/mo",
    pro: "500 Mins/mo",
    enterprise: "Unlimited",
    tooltip: "Voice AI features are available from the Business plan onwards.",
  },
  {
    feature: "Dedicated Phone Number",
    starter: false,
    business: false,
    pro: true,
    enterprise: true,
  },
];
