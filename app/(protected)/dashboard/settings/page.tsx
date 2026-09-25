import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/session";
import { constructMetadata } from "@/lib/utils";
import { DeleteAccountSection } from "@/components/dashboard/delete-account";
import { DashboardHeader } from "@/components/dashboard/header";
import { UserNameForm } from "@/components/forms/user-name-form";

export const metadata = constructMetadata({
  title: "Settings – Smart Cleaning Desk",
  description: "Manage your account and business settings.",
});

export default async function SettingsPage() {
  const user = await getCurrentUser();

  if (!user?.id) redirect("/login");

  return (
    <div className="min-h-screen bg-[#020617] text-white">
      <div className="space-y-2">
        <DashboardHeader
          heading="Settings"
          text="Manage your account and business settings."
        />

        <div className="divide-y divide-slate-800/80 pb-10">
          <UserNameForm
            user={{
              id: user.id,
              name: user.name || "",
            }}
          />

          <DeleteAccountSection />
        </div>
      </div>
    </div>
  );
}
