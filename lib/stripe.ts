import Stripe from "stripe";
import { env } from "@/env.mjs";

const isPreview = process.env.VERCEL_ENV === "preview";
const stripeSecretKey = isPreview
  ? env.STRIPE_SANDBOX_API_KEY
  : env.STRIPE_API_KEY;

if (!stripeSecretKey) {
  throw new Error(
    isPreview
      ? "STRIPE_SANDBOX_API_KEY is required for Preview deployments."
      : "STRIPE_API_KEY is required for Production deployments.",
  );
}

if (isPreview && !stripeSecretKey.startsWith("sk_test_")) {
  throw new Error("Preview deployments must use a Stripe test secret key.");
}

if (!isPreview && stripeSecretKey.startsWith("sk_test_")) {
  throw new Error("Production deployments must not use a Stripe test secret key.");
}

export const stripe = new Stripe(stripeSecretKey, {
  apiVersion: "2024-04-10",
  typescript: true,
});
