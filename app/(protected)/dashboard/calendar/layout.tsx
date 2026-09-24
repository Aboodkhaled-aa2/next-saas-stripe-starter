import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/session";
import { getUserSubscriptionPlan } from "@/lib/subscription";

export default async function CalendarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "ADMIN") {
    if (!user.id) {
      redirect("/login");
    }

    const subscriptionPlan = await getUserSubscriptionPlan(user.id);

    if (
      !subscriptionPlan.isPaid ||
      (subscriptionPlan.title !== "Business" &&
        subscriptionPlan.title !== "Pro")
    ) {
      redirect("/dashboard");
    }
  }

  return children;
}
