import Stripe from "stripe";
import { isDemoMode } from "@/lib/demo-mode";

// Demo never uses Stripe. The placeholder key only prevents module initialization
// from requiring a live credential; every payment entry point is blocked separately.
export const stripe = new Stripe(
  isDemoMode ? "sk_test_demo_disabled" : process.env.STRIPE_API_KEY!,
  {
    apiVersion: "2024-04-10",
    typescript: true,
  },
);
