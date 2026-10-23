import { DashboardHeader } from "@/components/dashboard/header";
import { IntegrationsGrid } from "@/components/dashboard/integrations-grid";

export default function IntegrationsPage() {
  return (
    <div className="space-y-6">
      <DashboardHeader
        heading="Integrations"
        text="Connect the channels your AI employee will use to communicate with customers."
      />

      <IntegrationsGrid />
    </div>
  );
}
