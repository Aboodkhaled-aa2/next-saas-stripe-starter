import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/session";
import { getUserSubscriptionPlan } from "@/lib/subscription";

import PhoneNumberClient from "./page-client";

export const dynamic = "force-dynamic";

export default async function PhoneNumberPage() {
  const user = await getCurrentUser();

  if (!user?.id) {
    redirect("/login");
  }

  if (user.role !== "ADMIN") {
    const plan = await getUserSubscriptionPlan(user.id);
    const eligible =
      plan.isPaid &&
      (plan.title === "Business" || plan.title === "Pro");

    if (!eligible) {
      redirect("/dashboard/integrations/phone");
    }
  }

  return <PhoneNumberClient />;
}
