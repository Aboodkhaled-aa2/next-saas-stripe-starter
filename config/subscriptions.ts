import { PlansRow, SubscriptionPlan } from "types";
import { env } from "@/env.mjs";

export const pricingData: SubscriptionPlan[] = [
  {
    title: "Starter",
    description:
      "Essential AI messaging and lead management for growing cleaning teams.",
    benefits: [
      "AI Customer Messaging",
      "3,000 AI Replies / Month",
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
    },
    stripeIds: {
      monthly:
        env.NEXT_PUBLIC_STRIPE_STARTER_MONTHLY_PLAN_ID ||
        "price_placeholder_starter",
    },
  },
  {
    title: "Business",
    description:
      "Full AI automation with a dedicated business phone number, voice reception, and advanced booking workflows.",
    benefits: [
      "Everything in Starter",
      "AI Voice Receptionist",
      "Dedicated Business Phone Number Included",
      "6,000 AI Replies / Month",
      "200 Voice Minutes / Month — Additional minutes available as add-ons",
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
    },
    stripeIds: {
      monthly:
        env.NEXT_PUBLIC_STRIPE_BUSINESS_MONTHLY_PLAN_ID ||
        "price_placeholder_business",
    },
  },
  {
    title: "Pro",
    description:
      "Advanced AI automation with a dedicated business phone number, higher voice usage, and advanced controls.",
    benefits: [
      "Everything in Business",
      "Dedicated Business Phone Number Included at No Extra Cost",
      "15,000 AI Replies / Month",
      "500 Voice Minutes / Month — Additional minutes available as add-ons",
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
    },
    stripeIds: {
      monthly:
        env.NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PLAN_ID ||
        "price_placeholder_pro",
    },
  },
];

export const plansColumns = ["starter", "business", "pro"] as const;

export const comparePlans: PlansRow[] = [
  {
    feature: "AI Replies / Month",
    starter: "3,000",
    business: "6,000",
    pro: "15,000",
  },
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
    business: "200 Mins/mo",
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
    business: "Included",
    pro: "Included",
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
