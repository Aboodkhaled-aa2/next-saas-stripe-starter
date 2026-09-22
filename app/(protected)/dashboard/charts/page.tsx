import { constructMetadata } from "@/lib/utils";
import { AreaChartStacked } from "@/components/charts/area-chart-stacked";
import { BarChartMixed } from "@/components/charts/bar-chart-mixed";
import { InteractiveBarChart } from "@/components/charts/interactive-bar-chart";
import { LineChartMultiple } from "@/components/charts/line-chart-multiple";
import { RadarChartSimple } from "@/components/charts/radar-chart-simple";
import { RadialChartGrid } from "@/components/charts/radial-chart-grid";
import { RadialShapeChart } from "@/components/charts/radial-shape-chart";
import { RadialStackedChart } from "@/components/charts/radial-stacked-chart";
import { RadialTextChart } from "@/components/charts/radial-text-chart";
import { DashboardHeader } from "@/components/dashboard/header";

export const metadata = constructMetadata({
  title: "Analytics – Smart Cleaning Desk",
  description: "Business analytics and performance insights.",
});

export default function ChartsPage() {
  return (
    <div className="min-h-screen bg-[#020617] text-white">
      <div className="space-y-8">
        <DashboardHeader
          heading="Analytics"
          text="Track your cleaning business performance and activity."
        />

        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 2xl:grid-cols-4">
            <RadialTextChart />
            <AreaChartStacked />
            <BarChartMixed />
            <RadarChartSimple />
          </div>

          <InteractiveBarChart />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 2xl:grid-cols-4">
            <RadialChartGrid />
            <RadialShapeChart />
            <LineChartMultiple />
            <RadialStackedChart />
          </div>
        </div>
      </div>
    </div>
  );
}
