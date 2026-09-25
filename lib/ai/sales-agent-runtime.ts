import "server-only";

import { openai } from "@/lib/openai";
import {
  buildSalesAgentSystemPrompt,
  type SalesAgentKnowledge,
} from "@/lib/ai/sales-agent";

export type SalesAgentRunOptions = {
  knowledge: SalesAgentKnowledge;
  message: string;
  previousResponseId?: string;
};

export type SalesAgentRunResult = {
  responseId: string;
  text: string;
};

export async function runSalesAgent(
  options: SalesAgentRunOptions,
): Promise<SalesAgentRunResult> {
  const response = await openai.responses.create({
    model: "gpt-5.6-terra",
    reasoning: {
      effort: "low",
    },
    instructions: buildSalesAgentSystemPrompt(options.knowledge),
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
