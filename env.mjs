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
  },

  client: {
    NEXT_PUBLIC_APP_URL: z.string().optional(),

    NEXT_PUBLIC_STRIPE_STARTER_MONTHLY_PLAN_ID: z.string().min(1),
    NEXT_PUBLIC_STRIPE_STARTER_YEARLY_PLAN_ID: z.string().min(1),

    NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PLAN_ID: z.string().min(1),
    NEXT_PUBLIC_STRIPE_PRO_YEARLY_PLAN_ID: z.string().min(1),

    NEXT_PUBLIC_STRIPE_BUSINESS_MONTHLY_PLAN_ID: z.string().min(1),
    NEXT_PUBLIC_STRIPE_BUSINESS_YEARLY_PLAN_ID: z.string().min(1),
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
