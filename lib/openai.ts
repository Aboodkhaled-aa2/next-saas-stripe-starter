import OpenAI from "openai";

import { env } from "@/env.mjs";

let openAIClient: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY ?? env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is required to use OpenAI features.");
  }

  if (!openAIClient) {
    openAIClient = new OpenAI({ apiKey });
  }

  return openAIClient;
}

// Delay client initialization until an AI feature is actually invoked.
// This lets Next.js collect route data during Preview builds without an
// OpenAI secret configured, while still requiring a valid key at runtime.
export const openai = new Proxy({} as OpenAI, {
  get(_target, property) {
    const client = getOpenAIClient();
    const value = Reflect.get(client, property, client);

    return typeof value === "function" ? value.bind(client) : value;
  },
});
