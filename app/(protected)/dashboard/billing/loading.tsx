import { Skeleton } from "@/components/ui/skeleton";
import { DashboardHeader } from "@/components/dashboard/header";
import { CardSkeleton } from "@/components/shared/card-skeleton";

export default function DashboardBillingLoading() {
  return (
    <div className="min-h-screen bg-[#020617] text-white">
      <div className="space-y-8">
        <DashboardHeader
          heading="Billing"
          text="Manage your subscription and billing."
        />

        <div className="grid gap-8">
          <Skeleton className="h-24 w-full rounded-xl border border-slate-800 bg-slate-900/60" />
          <CardSkeleton />
        </div>
      </div>
    </div>
  );
}
