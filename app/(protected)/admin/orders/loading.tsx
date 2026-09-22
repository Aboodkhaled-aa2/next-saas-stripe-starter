import { Skeleton } from "@/components/ui/skeleton";
import { DashboardHeader } from "@/components/dashboard/header";

export default function OrdersLoading() {
  return (
    <div className="min-h-screen bg-[#020617] text-white">
      <div className="space-y-8">
        <DashboardHeader
          heading="Orders"
          text="Check and manage your latest orders."
        />

        <Skeleton className="min-h-[420px] w-full rounded-xl border border-slate-800 bg-slate-900/60" />
      </div>
    </div>
  );
}
