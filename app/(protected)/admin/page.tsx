import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/session";
import { constructMetadata } from "@/lib/utils";
import { DashboardHeader } from "@/components/dashboard/header";
import InfoCard from "@/components/dashboard/info-card";
import TransactionsList from "@/components/dashboard/transactions-list";

export const metadata = constructMetadata({
  title: "Admin Panel – Smart Cleaning Desk",
  description: "Manage Smart Cleaning Desk from the admin panel.",
});

export default async function AdminPage() {
  const user = await getCurrentUser();

  if (!user || user.role !== "ADMIN") {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-[#020617] text-white">
      <div className="space-y-8">
        <DashboardHeader
          heading="Admin Panel"
          text="Manage your platform and monitor business activity."
        />

        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <InfoCard />
            <InfoCard />
            <InfoCard />
            <InfoCard />
          </div>

          <TransactionsList />
          <TransactionsList />
        </div>
      </div>
    </div>
  );
}
