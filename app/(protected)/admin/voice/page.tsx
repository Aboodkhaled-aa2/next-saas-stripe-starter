import { redirect } from "next/navigation";

import { prisma } from "@/lib/db";
import { stripe } from "@/lib/stripe";
import { getCurrentUser } from "@/lib/session";
import { constructMetadata } from "@/lib/utils";
import { DashboardHeader } from "@/components/dashboard/header";

export const metadata = constructMetadata({
  title: "Voice Usage – Smart Cleaning Desk Admin",
  description: "Monitor customer voice minutes, extra credits, call usage, and purchases.",
});

const includedMinutesForPlan = (plan: string) =>
  plan === "PRO" ? 500 : plan === "BUSINESS" ? 200 : 0;

const formatMinutes = (value: number) =>
  `${value.toLocaleString("en-US", { maximumFractionDigits: 2 })} min`;

const formatDate = (value: Date | null) =>
  value
    ? new Intl.DateTimeFormat("en-US", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(value)
    : "—";

const formatMoney = (cents: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);

export default async function AdminVoiceUsagePage() {
  const admin = await getCurrentUser();
  if (!admin || admin.role !== "ADMIN") redirect("/login");

  const now = new Date();
  const customers = await prisma.user.findMany({
    where: {
      stripeSubscriptionId: { not: null },
    },
    select: {
      id: true,
      role: true,
      name: true,
      email: true,
      plan: true,
      stripePriceId: true,
      stripeSubscriptionId: true,
      stripeCurrentPeriodEnd: true,
      extraVoiceMinutes: true,
      voiceUsage: {
        orderBy: { createdAt: "desc" },
        take: 100,
        select: {
          id: true,
          callId: true,
          source: true,
          durationSeconds: true,
          billedMinutes: true,
          includedMinutesUsed: true,
          extraMinutesUsed: true,
          startedAt: true,
          endedAt: true,
          createdAt: true,
        },
      },
      voiceCreditPurchases: {
        orderBy: { createdAt: "desc" },
        take: 50,
        select: {
          id: true,
          stripeSessionId: true,
          minutes: true,
          amountCents: true,
          status: true,
          createdAt: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const activeCustomers = customers.filter(
    (customer) =>
      customer.role === "USER" &&
      Boolean(customer.stripeSubscriptionId) &&
      Boolean(customer.stripeCurrentPeriodEnd && customer.stripeCurrentPeriodEnd > now),
  );

  const customersWithPeriodUsage = await Promise.all(
    activeCustomers.map(async (customer) => {
      let includedUsedThisPeriod = 0;
      try {
        const subscription = await stripe.subscriptions.retrieve(
          customer.stripeSubscriptionId!,
        );
        if (["active", "trialing"].includes(subscription.status)) {
          const periodStart = new Date(subscription.current_period_start * 1000);
          const periodEnd = new Date(subscription.current_period_end * 1000);
          const usage = await prisma.voiceUsage.aggregate({
            where: {
              userId: customer.id,
              source: "VAPI_CALL",
              startedAt: { gte: periodStart, lt: periodEnd },
            },
            _sum: { includedMinutesUsed: true },
          });
          includedUsedThisPeriod = usage._sum.includedMinutesUsed ?? 0;
        }
      } catch (error) {
        console.error("Unable to load current voice billing period:", error);
      }
      return { ...customer, includedUsedThisPeriod };
    }),
  );

  const totalExtraBalance = activeCustomers.reduce(
    (sum, customer) => sum + Math.max(customer.extraVoiceMinutes, 0),
    0,
  );
  const totalCalls = activeCustomers.reduce(
    (sum, customer) => sum + customer.voiceUsage.length,
    0,
  );
  const totalUsedMinutes = activeCustomers.reduce(
    (sum, customer) =>
      sum +
      customer.voiceUsage.reduce((usage, call) => usage + call.billedMinutes, 0),
    0,
  );
  const totalPurchasedMinutes = activeCustomers.reduce(
    (sum, customer) =>
      sum +
      customer.voiceCreditPurchases
        .filter((purchase) => purchase.status === "PAID")
        .reduce((minutes, purchase) => minutes + purchase.minutes, 0),
    0,
  );
  const allCalls = activeCustomers.flatMap((customer) =>
    customer.voiceUsage.map((call) => ({
      ...call,
      customerName: customer.name || customer.email || customer.id,
      customerEmail: customer.email,
    })),
  ).sort((a, b) => (b.startedAt?.getTime() ?? b.createdAt.getTime()) - (a.startedAt?.getTime() ?? a.createdAt.getTime())).slice(0, 100);
  const allPurchases = activeCustomers.flatMap((customer) =>
    customer.voiceCreditPurchases.map((purchase) => ({
      ...purchase,
      customerName: customer.name || customer.email || customer.id,
      customerEmail: customer.email,
    })),
  ).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).slice(0, 100);

  return (
    <div className="space-y-8">
      <DashboardHeader
        heading="AI Phone – Voice Usage"
        text="Paid customers, included minutes, extra balances, call consumption, and extra-minute purchases."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Active paid customers", value: activeCustomers.length.toLocaleString() },
          { label: "Minutes consumed", value: formatMinutes(totalUsedMinutes) },
          { label: "Extra minutes remaining", value: formatMinutes(totalExtraBalance) },
          { label: "Extra minutes purchased", value: formatMinutes(totalPurchasedMinutes) },
        ].map((item) => (
          <div key={item.label} className="rounded-2xl border border-slate-800 bg-slate-950 p-5">
            <p className="text-sm text-slate-400">{item.label}</p>
            <p className="mt-2 text-2xl font-semibold text-white">{item.value}</p>
          </div>
        ))}
      </div>

      <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950">
        <div className="border-b border-slate-800 px-5 py-4">
          <h2 className="text-lg font-semibold text-white">Customer voice balances</h2>
          <p className="mt-1 text-sm text-slate-400">Business includes 200 minutes per billing period; Pro includes 500. Extra balance is carried separately.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-900 text-slate-400">
              <tr>
                <th className="px-5 py-3 font-medium">Customer</th>
                <th className="px-5 py-3 font-medium">Plan</th>
                <th className="px-5 py-3 font-medium">Included / period</th>
                <th className="px-5 py-3 font-medium">Included used*</th>
                <th className="px-5 py-3 font-medium">Extra balance</th>
                <th className="px-5 py-3 font-medium">Total calls</th>
                <th className="px-5 py-3 font-medium">Subscription ends</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-200">
              {activeCustomers.map((customer) => {
                const included = includedMinutesForPlan(customer.plan);
                const includedUsed = customer.voiceUsage.reduce(
                  (sum, call) => sum + call.includedMinutesUsed, 0,
                );
                return (
                  <tr key={customer.id}>
                    <td className="px-5 py-4">
                      <p className="font-medium text-white">{customer.name || "Unnamed customer"}</p>
                      <p className="text-xs text-slate-500">{customer.email || customer.id}</p>
                    </td>
                    <td className="px-5 py-4">{customer.plan}</td>
                    <td className="px-5 py-4">{formatMinutes(included)}</td>
                    <td className="px-5 py-4">{formatMinutes(includedUsed)}</td>
                    <td className="px-5 py-4 font-semibold text-blue-300">{formatMinutes(customer.extraVoiceMinutes)}</td>
                    <td className="px-5 py-4">{customer.voiceUsage.length}</td>
                    <td className="px-5 py-4">{formatDate(customer.stripeCurrentPeriodEnd)}</td>
                  </tr>
                );
              })}
              {activeCustomers.length === 0 && (
                <tr><td colSpan={7} className="px-5 py-8 text-center text-slate-500">No active paid customers found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <p className="px-5 py-3 text-xs text-slate-500">* Included-used value is calculated from the current Stripe billing period.</p>
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950">
        <div className="border-b border-slate-800 px-5 py-4">
          <h2 className="text-lg font-semibold text-white">Call consumption</h2>
          <p className="mt-1 text-sm text-slate-400">Latest recorded calls across active paid customers (up to 100 per customer, 100 displayed).</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-900 text-slate-400"><tr>
              <th className="px-5 py-3 font-medium">Customer</th><th className="px-5 py-3 font-medium">Call ID</th><th className="px-5 py-3 font-medium">Started</th><th className="px-5 py-3 font-medium">Duration</th><th className="px-5 py-3 font-medium">Billed</th><th className="px-5 py-3 font-medium">Included used</th><th className="px-5 py-3 font-medium">Extra used</th><th className="px-5 py-3 font-medium">Source</th>
            </tr></thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {allCalls.map((call) => (
                <tr key={call.id}>
                  <td className="px-5 py-3"><p className="text-white">{call.customerName}</p><p className="text-xs text-slate-500">{call.customerEmail}</p></td>
                  <td className="px-5 py-3 font-mono text-xs">{call.callId || "—"}</td>
                  <td className="px-5 py-3">{formatDate(call.startedAt || call.createdAt)}</td>
                  <td className="px-5 py-3">{Math.floor(call.durationSeconds / 60)}m {call.durationSeconds % 60}s</td>
                  <td className="px-5 py-3">{formatMinutes(call.billedMinutes)}</td>
                  <td className="px-5 py-3">{formatMinutes(call.includedMinutesUsed)}</td>
                  <td className="px-5 py-3">{formatMinutes(call.extraMinutesUsed)}</td>
                  <td className="px-5 py-3">{call.source}</td>
                </tr>
              ))}
              {allCalls.length === 0 && <tr><td colSpan={8} className="px-5 py-8 text-center text-slate-500">No calls recorded yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950">
        <div className="border-b border-slate-800 px-5 py-4">
          <h2 className="text-lg font-semibold text-white">Extra-minute purchase history</h2>
          <p className="mt-1 text-sm text-slate-400">Paid credit purchases recorded from completed Stripe checkouts.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-900 text-slate-400"><tr>
              <th className="px-5 py-3 font-medium">Customer</th><th className="px-5 py-3 font-medium">Purchase date</th><th className="px-5 py-3 font-medium">Minutes</th><th className="px-5 py-3 font-medium">Amount</th><th className="px-5 py-3 font-medium">Status</th><th className="px-5 py-3 font-medium">Stripe session</th>
            </tr></thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {allPurchases.map((purchase) => (
                <tr key={purchase.id}>
                  <td className="px-5 py-3"><p className="text-white">{purchase.customerName}</p><p className="text-xs text-slate-500">{purchase.customerEmail}</p></td>
                  <td className="px-5 py-3">{formatDate(purchase.createdAt)}</td>
                  <td className="px-5 py-3">{formatMinutes(purchase.minutes)}</td>
                  <td className="px-5 py-3">{formatMoney(purchase.amountCents)}</td>
                  <td className="px-5 py-3">{purchase.status}</td>
                  <td className="px-5 py-3 font-mono text-xs">{purchase.stripeSessionId}</td>
                </tr>
              ))}
              {allPurchases.length === 0 && <tr><td colSpan={6} className="px-5 py-8 text-center text-slate-500">No extra-minute purchases recorded yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
      <p className="text-xs text-slate-500">Only customers with a paid subscription and a current billing-period end date are included. Trial accounts are excluded. No customer balances or usage records are changed by this page.</p>
    </div>
  );
}
