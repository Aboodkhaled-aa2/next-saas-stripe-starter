import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/db";
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
  let extraMessageCredits = 0;

  if (user && user.id) {
    userSubscriptionPlan = await getUserSubscriptionPlan(user.id);
    if (user.role === "ADMIN") {
      const billingUser = await prisma.user.findUnique({ where: { id: user.id }, select: { extraMessageCredits: true } });
      extraMessageCredits = billingUser?.extraMessageCredits ?? 0;
    }
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
          <BillingInfo userSubscriptionPlan={userSubscriptionPlan} isAdmin={user.role === "ADMIN"} extraMessageCredits={extraMessageCredits} />
        </div>
      </div>
    </div>
  );
}
