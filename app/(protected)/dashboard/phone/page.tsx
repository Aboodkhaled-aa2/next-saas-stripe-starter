import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/session";
import { isAIPhoneTrialTester } from "@/lib/ai-phone-access";

import PhoneNumberClient from "./page-client";

export const dynamic = "force-dynamic";

export default async function PhoneNumberPage() {
  const user = await getCurrentUser();

  if (!user?.id) {
    redirect("/login");
  }

  const isAdmin = user.role === "ADMIN" && user.email?.toLowerCase() === "tawilabood8@gmail.com";
  const isTrialTester = isAIPhoneTrialTester(user.email);

  if (!isAdmin && !isTrialTester) {
    redirect("/dashboard/integrations/phone");
  }

  return <PhoneNumberClient />;
}
