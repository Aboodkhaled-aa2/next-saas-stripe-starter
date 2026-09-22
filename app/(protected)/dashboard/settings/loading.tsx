import { DashboardHeader } from "@/components/dashboard/header";
import { SkeletonSection } from "@/components/shared/section-skeleton";

export default function DashboardSettingsLoading() {
  return (
    <div className="min-h-screen bg-[#020617] text-white">
      <div>
        <DashboardHeader
          heading="Settings"
          text="Manage your account and business settings."
        />

        <div className="divide-y divide-slate-800/80 pb-10">
          <SkeletonSection />
          <SkeletonSection />
          <SkeletonSection card />
        </div>
      </div>
    </div>
  );
}
