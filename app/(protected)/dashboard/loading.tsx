import { Skeleton } from "@/components/ui/skeleton";
import { DashboardHeader } from "@/components/dashboard/header";

export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-[#020617] text-white">
      <div className="space-y-8">
        <DashboardHeader
          heading="Dashboard"
          text="Manage your cleaning business with your AI employee."
        />

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton
              key={index}
              className="h-32 rounded-xl border border-slate-800 bg-slate-900/60"
            />
          ))}
        </div>

        <Skeleton className="h-[360px] rounded-xl border border-slate-800 bg-slate-900/60" />

        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-[300px] rounded-xl border border-slate-800 bg-slate-900/60" />
          <Skeleton className="h-[300px] rounded-xl border border-slate-800 bg-slate-900/60" />
        </div>

        <Skeleton className="h-56 rounded-xl border border-slate-800 bg-slate-900/60" />
      </div>
    </div>
  );
}
