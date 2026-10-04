import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),

    AUTH_SECRET: z.string().min(1),
    GOOGLE_CLIENT_ID: z.string().min(1),
    GOOGLE_CLIENT_SECRET: z.string().min(1),
    RESEND_API_KEY: z.string().min(1),
    EMAIL_FROM: z.string().min(1),
    STRIPE_API_KEY: z.string().min(1),
    STRIPE_WEBHOOK_SECRET: z.string().min(1),
    OPENAI_API_KEY: z.string().min(1),
    VAPI_PRIVATE_API_KEY: z.string().optional(),
    VAPI_API_BASE_URL: z.string().url().optional(),
    SIGNALWIRE_SPACE_URL: z.string().url().optional(),
    SIGNALWIRE_PROJECT_ID: z.string().optional(),
    SIGNALWIRE_API_TOKEN: z.string().optional(),
    SIGNALWIRE_SIP_DOMAIN: z.string().optional(),
    SIGNALWIRE_SIP_USERNAME: z.string().optional(),
    SIGNALWIRE_SIP_PASSWORD: z.string().optional(),
    STRIPE_VOICE_100_PRICE_ID: z.string().optional(),
    STRIPE_VOICE_500_PRICE_ID: z.string().optional(),
    STRIPE_VOICE_1000_PRICE_ID: z.string().optional(),
  },

  client: {
    NEXT_PUBLIC_APP_URL: z.string().optional(),
    NEXT_PUBLIC_STRIPE_STARTER_MONTHLY_PLAN_ID: z.string().optional(),
    NEXT_PUBLIC_STRIPE_STARTER_YEARLY_PLAN_ID: z.string().optional(),
    NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PLAN_ID: z.string().optional(),
    NEXT_PUBLIC_STRIPE_PRO_YEARLY_PLAN_ID: z.string().optional(),
    NEXT_PUBLIC_STRIPE_BUSINESS_MONTHLY_PLAN_ID: z.string().optional(),
    NEXT_PUBLIC_STRIPE_BUSINESS_YEARLY_PLAN_ID: z.string().optional(),
  },

  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    AUTH_SECRET: process.env.AUTH_SECRET,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    EMAIL_FROM: process.env.EMAIL_FROM,
    STRIPE_API_KEY: process.env.STRIPE_API_KEY,
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    VAPI_PRIVATE_API_KEY: process.env.VAPI_PRIVATE_API_KEY,
    VAPI_API_BASE_URL: process.env.VAPI_API_BASE_URL,
    SIGNALWIRE_SPACE_URL: process.env.SIGNALWIRE_SPACE_URL,
    SIGNALWIRE_PROJECT_ID: process.env.SIGNALWIRE_PROJECT_ID,
    SIGNALWIRE_API_TOKEN: process.env.SIGNALWIRE_API_TOKEN,
    SIGNALWIRE_SIP_DOMAIN: process.env.SIGNALWIRE_SIP_DOMAIN,
    SIGNALWIRE_SIP_USERNAME: process.env.SIGNALWIRE_SIP_USERNAME,
    SIGNALWIRE_SIP_PASSWORD: process.env.SIGNALWIRE_SIP_PASSWORD,
    STRIPE_VOICE_100_PRICE_ID: process.env.STRIPE_VOICE_100_PRICE_ID,
    STRIPE_VOICE_500_PRICE_ID: process.env.STRIPE_VOICE_500_PRICE_ID,
    STRIPE_VOICE_1000_PRICE_ID: process.env.STRIPE_VOICE_1000_PRICE_ID,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_STRIPE_STARTER_MONTHLY_PLAN_ID:
      process.env.NEXT_PUBLIC_STRIPE_STARTER_MONTHLY_PLAN_ID,
    NEXT_PUBLIC_STRIPE_STARTER_YEARLY_PLAN_ID:
      process.env.NEXT_PUBLIC_STRIPE_STARTER_YEARLY_PLAN_ID,
    NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PLAN_ID:
      process.env.NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PLAN_ID,
    NEXT_PUBLIC_STRIPE_PRO_YEARLY_PLAN_ID:
      process.env.NEXT_PUBLIC_STRIPE_PRO_YEARLY_PLAN_ID,
    NEXT_PUBLIC_STRIPE_BUSINESS_MONTHLY_PLAN_ID:
      process.env.NEXT_PUBLIC_STRIPE_BUSINESS_MONTHLY_PLAN_ID,
    NEXT_PUBLIC_STRIPE_BUSINESS_YEARLY_PLAN_ID:
      process.env.NEXT_PUBLIC_STRIPE_BUSINESS_YEARLY_PLAN_ID,
  },

  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
});
