import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/session";
import { getUserSubscriptionPlan } from "@/lib/subscription";
import MessageCreditPurchase from "@/components/dashboard/message-credit-purchase";

export const metadata = {
  title: "Extra Customer Conversations – Smart Cleaning Desk",
  description: "Purchase additional AI-powered customer conversations.",
};

export default async function MessageCreditPurchasePage() {
  const user = await getCurrentUser();

  if (!user?.id || user.role !== "USER") {
    redirect("/login");
  }

  const subscriptionPlan = await getUserSubscriptionPlan(user.id);

  if (!subscriptionPlan.isPaid) {
    redirect("/dashboard/billing");
  }

  return <MessageCreditPurchase />;
}
