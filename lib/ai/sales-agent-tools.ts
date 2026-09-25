import "server-only";

import { prisma } from "@/lib/db";
import { pricingData } from "@/config/subscriptions";

export type SalesAgentToolContext = {
  ownerUserId: string;
  websiteUrl: string;
};

export const salesAgentTools = [
  {
    type: "function" as const,
    name: "get_product_info",
    description:
      "Get approved Smart Cleaning Desk plan, pricing, feature, or product information. Use this when the prospect asks for details that should come from current product data.",
    parameters: {
      type: "object",
      properties: {
        topic: {
          type: "string",
          enum: ["plans", "pricing", "features", "voice", "booking", "phone", "general"],
          description: "The product information topic the prospect is asking about.",
        },
      },
      required: ["topic"],
      additionalProperties: false,
    },
    strict: true,
  },
  {
    type: "function" as const,
    name: "save_lead",
    description:
      "Save or update a qualified Smart Cleaning Desk sales prospect in the CRM. Use only when the prospect has provided enough contact information or clearly wants a follow-up.",
    parameters: {
      type: "object",
      properties: {
        name: { type: ["string", "null"] },
        phone: { type: ["string", "null"] },
        email: { type: ["string", "null"] },
        companyName: { type: ["string", "null"] },
        notes: { type: ["string", "null"] },
      },
      required: ["name", "phone", "email", "companyName", "notes"],
      additionalProperties: false,
    },
    strict: true,
  },
  {
    type: "function" as const,
    name: "get_website_link",
    description:
      "Return the official Smart Cleaning Desk website link so it can be shared with a prospect.",
    parameters: {
      type: "object",
      properties: {},
      required: [],
      additionalProperties: false,
    },
    strict: true,
  },
];

export async function executeSalesAgentTool(
  name: string,
  argumentsJson: string,
  context: SalesAgentToolContext,
): Promise<Record<string, unknown>> {
  let args: Record<string, unknown>;

  try {
    args = JSON.parse(argumentsJson) as Record<string, unknown>;
  } catch {
    return { success: false, error: "Invalid tool arguments." };
  }

  if (name === "get_product_info") {
    const topic = typeof args.topic === "string" ? args.topic : "general";

    if (topic === "plans" || topic === "pricing") {
      return {
        success: true,
        plans: pricingData.map((plan) => ({
          name: plan.title,
          monthlyPrice: plan.prices.monthly,
          yearlyPrice: plan.prices.yearly,
          description: plan.description,
          benefits: plan.benefits,
        })),
      };
    }

    if (topic === "features" || topic === "general") {
      return {
        success: true,
        plans: pricingData.map((plan) => ({
          name: plan.title,
          description: plan.description,
          benefits: plan.benefits,
        })),
      };
    }

    return {
      success: true,
      information: pricingData
        .flatMap((plan) => plan.benefits)
        .filter((feature, index, features) => features.indexOf(feature) === index),
    };
  }

  if (name === "save_lead") {
    const nameValue = typeof args.name === "string" ? args.name : null;
    const phone = typeof args.phone === "string" ? args.phone : null;
    const email = typeof args.email === "string" ? args.email : null;
    const companyName =
      typeof args.companyName === "string" ? args.companyName : null;
    const notes = typeof args.notes === "string" ? args.notes : null;

    if (!nameValue && !phone && !email && !companyName) {
      return {
        success: false,
        error: "At least one lead identifier is required.",
      };
    }

    const existingLead = await prisma.lead.findFirst({
      where: {
        userId: context.ownerUserId,
        OR: [
          ...(email ? [{ email }] : []),
          ...(phone ? [{ phone }] : []),
        ],
      },
    });

    const lead = existingLead
      ? await prisma.lead.update({
          where: { id: existingLead.id },
          data: {
            name: nameValue ?? existingLead.name,
            phone: phone ?? existingLead.phone,
            email: email ?? existingLead.email,
            notes: notes ?? existingLead.notes,
            lastMessage: companyName
              ? `Sales prospect: ${companyName}`
              : existingLead.lastMessage,
          },
        })
      : await prisma.lead.create({
          data: {
            userId: context.ownerUserId,
            name: nameValue ?? companyName,
            phone,
            email,
            source: "sales_agent",
            lastMessage: companyName
              ? `Sales prospect: ${companyName}`
              : "Sales prospect",
            notes,
          },
        });

    return {
      success: true,
      leadId: lead.id,
      message: "Lead saved successfully.",
    };
  }

  if (name === "get_website_link") {
    return {
      success: true,
      websiteUrl: context.websiteUrl,
    };
  }

  return {
    success: false,
    error: `Unknown tool: ${name}`,
  };
}
