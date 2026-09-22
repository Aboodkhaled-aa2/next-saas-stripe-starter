import { redirect } from "next/navigation";

import { sidebarLinks } from "@/config/dashboard";
import { getCurrentUser } from "@/lib/session";
import { getUserSubscriptionPlan } from "@/lib/subscription";
import { SearchCommand } from "@/components/dashboard/search-command";
import {
  DashboardSidebar,
  MobileSheetSidebar,
} from "@/components/layout/dashboard-sidebar";
import { ModeToggle } from "@/components/layout/mode-toggle";
import { UserAccountNav } from "@/components/layout/user-account-nav";
import MaxWidthWrapper from "@/components/shared/max-width-wrapper";

interface ProtectedLayoutProps {
  children: React.ReactNode;
}

export default async function Dashboard({
  children,
}: ProtectedLayoutProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "ADMIN") {
    if (!user.id) {
      redirect("/login");
    }

    const subscriptionPlan = await getUserSubscriptionPlan(user.id);

    if (!subscriptionPlan.isPaid) {
      redirect("/pricing");
    }
  }

  const filteredLinks = sidebarLinks.map((section) => ({
    ...section,
    items: section.items.filter(
      ({ authorizeOnly }) =>
        !authorizeOnly || authorizeOnly === user.role,
    ),
  }));

  return (
    <div className="relative flex min-h-screen w-full bg-[#020617] text-white">
      <DashboardSidebar links={filteredLinks} />

      <div className="flex min-w-0 flex-1 flex-col bg-[#020617]">
        <header className="sticky top-0 z-50 flex h-14 border-b border-slate-800/80 bg-[#020617]/95 px-4 text-white backdrop-blur-xl lg:h-[60px] xl:px-8">
          <MaxWidthWrapper className="flex max-w-7xl items-center gap-3 px-0">
            <MobileSheetSidebar links={filteredLinks} />

            <div className="min-w-0 flex-1">
              <SearchCommand links={filteredLinks} />
            </div>

            <div className="flex shrink-0 items-center gap-1.5">
              <ModeToggle />
              <UserAccountNav />
            </div>
          </MaxWidthWrapper>
        </header>

        <main className="min-w-0 flex-1 bg-[#020617] p-4 sm:p-6 xl:px-8">
          <MaxWidthWrapper className="flex h-full max-w-7xl flex-col gap-6 px-0">
            {children}
          </MaxWidthWrapper>
        </main>
      </div>
    </div>
  );
}
