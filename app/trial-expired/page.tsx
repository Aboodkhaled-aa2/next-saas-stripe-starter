import Link from "next/link";
import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/session";
import { getUserSubscriptionPlan } from "@/lib/subscription";
import { BillingFormButton } from "@/components/forms/billing-form-button";

export default async function TrialExpiredPage() {
  const user = await getCurrentUser();

  if (!user?.id) {
    redirect("/login");
  }

  if (user.role === "ADMIN") {
    redirect("/admin");
  }

  const subscriptionPlan = await getUserSubscriptionPlan(user.id);

  if (subscriptionPlan.isPaid || subscriptionPlan.isTrial) {
    redirect("/dashboard");
  }

  if (!subscriptionPlan.trialEndsAt) {
    redirect("/pricing");
  }

  const selectedPlan = {
    ...subscriptionPlan,
    title: subscriptionPlan.title,
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#020617] px-4 py-12 text-white">
      <section className="w-full max-w-lg rounded-3xl border border-slate-800 bg-slate-900/80 p-8 text-center shadow-2xl">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600/15 text-2xl">
          ⏳
        </div>
        <h1 className="text-3xl font-black">Your free trial has ended</h1>
        <p className="mt-4 text-slate-300">
          Your account and selected plan are saved, but paid features are paused.
          Subscribe to continue with the plan you chose.
        </p>
        <div className="my-7 rounded-2xl border border-slate-800 bg-slate-950 p-5">
          <p className="text-sm uppercase tracking-wider text-slate-400">Your selected plan</p>
          <p className="mt-2 text-2xl font-bold">{selectedPlan.title}</p>
          <p className="mt-1 text-slate-300">
            ${selectedPlan.prices.monthly}/month
          </p>
        </div>
        <BillingFormButton
          year={false}
          offer={selectedPlan}
          subscriptionPlan={subscriptionPlan}
        />
        <p className="mt-5 text-sm text-slate-400">
          No payment is taken unless you complete checkout.
        </p>
        <Link
          href="/logout"
          className="mt-6 inline-block text-sm text-slate-500 underline hover:text-slate-300"
        >
          Sign out
        </Link>
      </section>
    </main>
  );
}
