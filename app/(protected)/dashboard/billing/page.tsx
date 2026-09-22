import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/session";
import { getUserSubscriptionPlan } from "@/lib/subscription";
import { constructMetadata } from "@/lib/utils";
import { DashboardHeader } from "@/components/dashboard/header";
import { BillingInfo } from "@/components/pricing/billing-info";

export const metadata = constructMetadata({
  title: "Billing – Smart Cleaning Desk",
  description: "Manage your subscription and billing.",
});

export default async function BillingPage() {
  const user = await getCurrentUser();

  let userSubscriptionPlan;

  if (user && user.id && user.role === "USER") {
    userSubscriptionPlan = await getUserSubscriptionPlan(user.id);
  } else {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-[#020617] text-white">
      <div className="space-y-8">
        <DashboardHeader
          heading="Billing"
          text="Manage your subscription and billing."
        />

        <div className="grid gap-8">
          <BillingInfo userSubscriptionPlan={userSubscriptionPlan} />
        </div>
      </div>
    </div>
  );
}
