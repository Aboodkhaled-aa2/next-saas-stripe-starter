import { PlansRow, SubscriptionPlan } from "types";
import { env } from "@/env.mjs";

export const pricingData: SubscriptionPlan[] = [
  {
    title: "Starter",
    description:
      "Essential AI messaging and lead management for growing cleaning teams.",
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
      monthly:
        env.NEXT_PUBLIC_STRIPE_STARTER_MONTHLY_PLAN_ID ||
        "price_placeholder_starter",
      yearly:
        env.NEXT_PUBLIC_STRIPE_STARTER_YEARLY_PLAN_ID ||
        "price_placeholder_starter_yearly",
    },
  },
  {
    title: "Business",
    description:
      "Full AI automation with voice reception and advanced booking workflows.",
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
      monthly:
        env.NEXT_PUBLIC_STRIPE_BUSINESS_MONTHLY_PLAN_ID ||
        "price_placeholder_business",
      yearly:
        env.NEXT_PUBLIC_STRIPE_BUSINESS_YEARLY_PLAN_ID ||
        "price_placeholder_business_yearly",
    },
  },
  {
    title: "Pro",
    description:
      "Advanced AI automation with higher voice usage, dedicated phone service, and advanced controls.",
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
      monthly:
        env.NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PLAN_ID ||
        "price_placeholder_pro",
      yearly:
        env.NEXT_PUBLIC_STRIPE_PRO_YEARLY_PLAN_ID ||
        "price_placeholder_pro_yearly",
    },
  },
];

export const plansColumns = ["starter", "business", "pro"] as const;

export const comparePlans: PlansRow[] = [
  {
    feature: "AI Customer Messaging",
    starter: true,
    business: true,
    pro: true,
    tooltip: "AI customer messaging is included across all plans.",
  },
  {
    feature: "Lead Capture & Customer Inbox",
    starter: true,
    business: true,
    pro: true,
  },
  {
    feature: "Business Knowledge & FAQ Responses",
    starter: true,
    business: true,
    pro: true,
  },
  {
    feature: "AI Voice Receptionist",
    starter: false,
    business: "100 Mins/mo",
    pro: "500 Mins/mo",
    tooltip: "Voice AI is available from the Business plan onwards.",
  },
  {
    feature: "Appointment Booking",
    starter: false,
    business: true,
    pro: true,
  },
  {
    feature: "Automated Lead Follow-Ups",
    starter: false,
    business: true,
    pro: true,
  },
  {
    feature: "Custom Booking Rules",
    starter: false,
    business: false,
    pro: true,
  },
  {
    feature: "Custom AI Knowledge & Behavior",
    starter: false,
    business: "Custom Instructions",
    pro: "Advanced",
  },
  {
    feature: "Dedicated Business Phone Number",
    starter: false,
    business: false,
    pro: true,
  },
  {
    feature: "Advanced Call Handling & Transfer",
    starter: false,
    business: false,
    pro: true,
  },
  {
    feature: "Customer & Conversation History",
    starter: true,
    business: true,
    pro: true,
  },
];
