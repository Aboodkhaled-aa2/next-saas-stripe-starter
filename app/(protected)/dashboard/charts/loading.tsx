import { Skeleton } from "@/components/ui/skeleton";
import { DashboardHeader } from "@/components/dashboard/header";

export default function ChartsLoading() {
  return (
    <div className="min-h-screen bg-[#020617] text-white">
      <div className="space-y-8">
        <DashboardHeader
          heading="Analytics"
          text="Track your cleaning business performance and activity."
        />

        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 2xl:grid-cols-4">
            <Skeleton className="h-80 w-full rounded-xl border border-slate-800 bg-slate-900/60 md:max-xl:h-[390px] xl:max-2xl:h-[420px]" />
            <Skeleton className="h-80 w-full rounded-xl border border-slate-800 bg-slate-900/60 md:max-xl:h-[390px] xl:max-2xl:h-[420px]" />
            <Skeleton className="h-80 w-full rounded-xl border border-slate-800 bg-slate-900/60 md:max-xl:h-[390px] xl:max-2xl:h-[420px]" />
            <Skeleton className="h-80 w-full rounded-xl border border-slate-800 bg-slate-900/60 md:max-xl:h-[390px] xl:max-2xl:h-[420px]" />
          </div>

          <Skeleton className="h-[500px] w-full rounded-xl border border-slate-800 bg-slate-900/60" />

          <Skeleton className="h-[500px] w-full rounded-xl border border-slate-800 bg-slate-900/60" />
        </div>
      </div>
    </div>
  );
}
