import OpenAI from "openai";

import { env } from "@/env.mjs";

let client: OpenAI | undefined;

function getClient(): OpenAI {
  if (!client) {
    client = new OpenAI({
      apiKey: env.OPENAI_API_KEY,
    });
  }

  return client;
}

// Initialize the SDK only when a request actually uses it.
// This prevents Next.js from requiring OpenAI credentials while collecting
// route data during the build.
export const openai = new Proxy({} as OpenAI, {
  get(_target, property) {
    const instance = getClient();
    const value = Reflect.get(instance, property, instance);

    return typeof value === "function" ? value.bind(instance) : value;
  },
});
