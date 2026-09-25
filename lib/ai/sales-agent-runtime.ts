import "server-only";

import { openai } from "@/lib/openai";
import {
  buildSalesAgentSystemPrompt,
  type SalesAgentKnowledge,
} from "@/lib/ai/sales-agent";
import {
  executeSalesAgentTool,
  salesAgentTools,
} from "@/lib/ai/sales-agent-tools";

export type SalesAgentRunOptions = {
  knowledge: SalesAgentKnowledge;
  message: string;
  ownerUserId: string;
  websiteUrl: string;
  previousResponseId?: string;
};

export type SalesAgentRunResult = {
  responseId: string;
  text: string;
};

const MAX_TOOL_ROUNDS = 5;

export async function runSalesAgent(
  options: SalesAgentRunOptions,
): Promise<SalesAgentRunResult> {
  let response = await openai.responses.create({
    model: "gpt-5.6-terra",
    reasoning: {
      effort: "low",
    },
    instructions: buildSalesAgentSystemPrompt(options.knowledge),
    input: options.message,
    tools: salesAgentTools,
    ...(options.previousResponseId
      ? { previous_response_id: options.previousResponseId }
      : {}),
  });

  for (let round = 0; round < MAX_TOOL_ROUNDS; round += 1) {
    const functionCalls = response.output.filter(
      (item) => item.type === "function_call",
    );

    if (functionCalls.length === 0) {
      return {
        responseId: response.id,
        text: response.output_text,
      };
    }

    const toolOutputs = await Promise.all(
      functionCalls.map(async (call) => ({
        type: "function_call_output" as const,
        call_id: call.call_id,
        output: JSON.stringify(
          await executeSalesAgentTool(
            call.name,
            call.arguments,
            {
              ownerUserId: options.ownerUserId,
              websiteUrl: options.websiteUrl,
            },
          ),
        ),
      })),
    );

    response = await openai.responses.create({
      model: "gpt-5.6-terra",
      reasoning: {
        effort: "low",
      },
      previous_response_id: response.id,
      input: toolOutputs,
      tools: salesAgentTools,
    });
  }

  return {
    responseId: response.id,
    text: response.output_text,
  };
}
