import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/session";

import PhoneNumberClient from "./page-client";

export const dynamic = "force-dynamic";

export default async function PhoneNumberPage() {
  const user = await getCurrentUser();

  if (!user?.id) {
    redirect("/login");
  }

  if (user.role !== "ADMIN") {
    redirect("/dashboard/integrations/phone");
  }

  return <PhoneNumberClient />;
}
