import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/session";
import { getUserSubscriptionPlan } from "@/lib/subscription";

export default async function PhoneLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const isTestAccount = user.email?.toLowerCase() === "tawilabood8@gmail.com";

  if (user.role !== "ADMIN" && !isTestAccount) {
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
