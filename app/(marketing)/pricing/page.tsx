import Image from "next/image";
import Link from "next/link";

import { getCurrentUser } from "@/lib/session";
import { getUserSubscriptionPlan } from "@/lib/subscription";
import { constructMetadata } from "@/lib/utils";
import { ComparePlans } from "@/components/pricing/compare-plans";
import { PricingCards } from "@/components/pricing/pricing-cards";
import { PricingFaq } from "@/components/pricing/pricing-faq";

export const metadata = constructMetadata({
  title: "Pricing – Smart Cleaning Desk",
  description: "Choose the right AI employee plan for your cleaning business.",
});

export default async function PricingPage() {
  const user = await getCurrentUser();

  if (user?.role === "ADMIN") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#020617] text-white">
        <h1 className="text-5xl font-bold">Seriously?</h1>

        <Image
          src="/_static/illustrations/call-waiting.svg"
          alt="403"
          width={560}
          height={560}
          className="pointer-events-none -my-20"
        />

        <p className="text-balance px-4 text-center text-2xl font-medium text-slate-200">
          You are an {user.role}. Back to{" "}
          <Link
            href="/admin"
            className="text-slate-400 underline underline-offset-4 transition-colors hover:text-blue-400"
          >
            Dashboard
          </Link>
          .
        </p>
      </div>
    );
  }

  const subscriptionPlan =
    user && user.id
      ? await getUserSubscriptionPlan(user.id).catch(() => null)
      : null;

  return (
    <div className="flex w-full flex-col gap-16 bg-[#020617] py-8 text-white md:py-12">
      <PricingCards
        userId={user?.id}
        subscriptionPlan={subscriptionPlan ?? undefined}
      />

      <hr className="container border-slate-800" />

      <ComparePlans />

      <PricingFaq />
    </div>
  );
}
