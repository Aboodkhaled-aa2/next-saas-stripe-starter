import "server-only";

import { openai } from "@/lib/openai";
import { prisma } from "@/lib/db";
import {
  buildCustomerAgentSystemPrompt,
  type CustomerAgentBusinessProfile,
} from "@/lib/ai/customer-agent";

export type CustomerAgentRunOptions = {
  userId: string;
  message: string;
  previousResponseId?: string;
};

export type CustomerAgentRunResult = {
  responseId: string;
  text: string;
};

export async function runCustomerAgent(
  options: CustomerAgentRunOptions,
): Promise<CustomerAgentRunResult> {
  const businessProfile = await prisma.businessProfile.findUnique({
    where: {
      userId: options.userId,
    },
  });

  if (!businessProfile) {
    throw new Error("Business profile not found.");
  }

  const knowledge: CustomerAgentBusinessProfile = {
    businessName: businessProfile.businessName,
    businessPhone: businessProfile.businessPhone,
    businessEmail: businessProfile.businessEmail,
    websiteUrl: businessProfile.websiteUrl,
    services: businessProfile.services,
    serviceAreas: businessProfile.serviceAreas,
    pricing: businessProfile.pricing,
    businessHours: businessProfile.businessHours,
    paymentMethods: businessProfile.paymentMethods,
    bookingRules: businessProfile.bookingRules,
    cancellationPolicy: businessProfile.cancellationPolicy,
    reschedulingPolicy: businessProfile.reschedulingPolicy,
    aiInstructions: businessProfile.aiInstructions,
    aiTone: businessProfile.aiTone,
    humanHandoffInstructions: businessProfile.humanHandoffInstructions,
    additionalNotes: businessProfile.additionalNotes,
  };

  const response = await openai.responses.create({
    model: "gpt-5.6-terra",
    reasoning: {
      effort: "low",
    },
    instructions: buildCustomerAgentSystemPrompt(knowledge),
    input: options.message,
    ...(options.previousResponseId
      ? { previous_response_id: options.previousResponseId }
      : {}),
  });

  return {
    responseId: response.id,
    text: response.output_text,
  };
}
