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

        <a href="/admin/voice" className="block rounded-2xl border border-blue-500/30 bg-blue-500/10 p-5 transition hover:border-blue-400/60 hover:bg-blue-500/15">\n          <p className="text-lg font-semibold text-white">AI Phone – Voice Usage</p>\n          <p className="mt-1 text-sm text-slate-300">View paid customer minutes, call consumption, extra balances, and purchase history.</p>\n          <span className="mt-3 inline-flex text-sm font-semibold text-blue-300">Open voice management →</span>\n        </a>\n\n        <div className="flex flex-col gap-6">
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
