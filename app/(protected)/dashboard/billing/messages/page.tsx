import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/session";
import { getUserSubscriptionPlan } from "@/lib/subscription";
import MessageCreditPurchase from "@/components/dashboard/message-credit-purchase";

export const metadata = {
  title: "Extra AI Messages – Smart Cleaning Desk",
  description: "Purchase additional AI-generated replies for your customers.",
};

export default async function MessageCreditPurchasePage({
  searchParams,
}: {
  searchParams?: { messages?: string };
}) {
  const user = await getCurrentUser();

  if (!user?.id || user.role !== "USER") {
    redirect("/login");
  }

  const subscriptionPlan = await getUserSubscriptionPlan(user.id);

  if (!subscriptionPlan.isPaid) {
    redirect("/dashboard/billing");
  }

  return <MessageCreditPurchase searchParams={searchParams} />;
}
