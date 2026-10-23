import OpenAI from "openai";

let client: OpenAI | undefined;

export function getOpenAIClient(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey?.trim()) {
    throw new Error(
      "OPENAI_API_KEY is missing in the active runtime environment.",
    );
  }

  if (!client) {
    client = new OpenAI({ apiKey });
  }

  return client;
}
