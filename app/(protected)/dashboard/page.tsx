import { redirect } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight,
  Bot,
  CalendarDays,
  CheckCircle2,
  Clock3,
  MessageSquare,
  Phone,
  Settings2,
  Users,
} from "lucide-react";

import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/db";
import { stripe } from "@/lib/stripe";
import { constructMetadata } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

export const metadata = constructMetadata({
  title: "Dashboard – Smart Cleaning Desk",
  description: "Manage your cleaning business with your AI employee.",
});

const buildStats = ({
  newLeads,
  bookings,
  customers,
  employees,
}: {
  newLeads: number;
  bookings: number;
  customers: number;
  employees: number;
}) => [
  {
    title: "New Leads",
    value: String(newLeads),
    description: newLeads === 1 ? "1 new lead" : `${newLeads} new leads`,
    icon: Users,
  },
  {
    title: "Bookings",
    value: String(bookings),
    description:
      bookings === 1 ? "1 booking in your workspace" : `${bookings} bookings in your workspace`,
    icon: CalendarDays,
  },
  {
    title: "Customers",
    value: String(customers),
    description:
      customers === 1 ? "1 customer in your workspace" : `${customers} customers in your workspace`,
    icon: MessageSquare,
  },
  {
    title: "Employees",
    value: String(employees),
    description:
      employees === 1 ? "1 active employee" : `${employees} active employees`,
    icon: Phone,
  },
];

const setupSteps = [
  {
    number: "01",
    title: "Complete business setup",
    description:
      "Tell your AI employee about your services, pricing, service area, and business rules.",
    href: "/onboarding",
    action: "Complete setup",
  },
  {
    number: "02",
    title: "Configure your AI employee",
    description:
      "Define how your AI should communicate with customers and handle incoming leads.",
    href: "/dashboard/ai",
    action: "Configure AI",
  },
  {
    number: "03",
    title: "Start receiving leads",
    description:
      "Connect your customer channels and let your AI employee handle incoming conversations.",
    href: "/dashboard/integrations",
    action: "View integrations",
  },
];

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (user?.id && user.role !== "ADMIN") {
    const businessProfile = await prisma.businessProfile.findUnique({
      where: { userId: user.id },
      select: { onboardingCompleted: true },
    });

    if (!businessProfile?.onboardingCompleted) {
      redirect("/onboarding");
    }
  }

  const [newLeads, bookings, customers, employees] = await Promise.all([
    prisma.lead.count({
      where: {
        userId: user?.id ?? "",
        status: "NEW",
      },
    }),
    prisma.booking.count({
      where: {
        userId: user?.id ?? "",
      },
    }),
    prisma.customer.count({
      where: {
        userId: user?.id ?? "",
      },
    }),
    prisma.employee.count({
      where: {
        userId: user?.id ?? "",
        active: true,
      },
    }),
  ]);

  const stats = buildStats({
    newLeads,
    bookings,
    customers,
    employees,
  });

  let currentPeriodStart: Date | null = null;
  let currentPeriodEnd: Date | null = null;

  const billingUser = user?.id
    ? await prisma.user.findUnique({
        where: { id: user.id },
        select: {
          stripeSubscriptionId: true,
          extraVoiceMinutes: true,
          plan: true,
          trialStartedAt: true,
          trialEndsAt: true,
        },
      })
    : null;

  const trialActive =
    Boolean(
      billingUser?.trialEndsAt &&
        billingUser.trialEndsAt.getTime() > Date.now(),
    ) && !billingUser?.stripeSubscriptionId;

  if (
    billingUser &&
    !billingUser.stripeSubscriptionId &&
    billingUser.trialEndsAt &&
    billingUser.trialEndsAt.getTime() <= Date.now()
  ) {
    redirect(`/pricing?plan=${billingUser.plan.toLowerCase()}`);
  }

  if (billingUser?.stripeSubscriptionId) {
    try {
      const subscription = await stripe.subscriptions.retrieve(
        billingUser.stripeSubscriptionId,
      );

      currentPeriodStart = new Date(subscription.current_period_start * 1000);
      currentPeriodEnd = new Date(subscription.current_period_end * 1000);
    } catch (error) {
      console.error(
        "Failed to retrieve Stripe subscription for voice usage:",
        error,
      );
    }
  }

  if (trialActive) {
    currentPeriodStart = billingUser?.trialStartedAt ?? new Date();
    currentPeriodEnd = billingUser?.trialEndsAt ?? new Date();
  }

  const voiceUsage = await prisma.voiceUsage.aggregate({
    where: {
      userId: user?.id ?? "",
      source: "VAPI_CALL",
      ...(currentPeriodStart && currentPeriodEnd
        ? {
            startedAt: {
              gte: currentPeriodStart,
              lt: currentPeriodEnd,
            },
          }
        : {
            id: "__NO_CURRENT_BILLING_PERIOD__",
          }),
    },
    _sum: {
      durationSeconds: true,
      includedMinutesUsed: true,
      extraMinutesUsed: true,
    },
  });

  const voicePlanEnabled = user?.plan === "BUSINESS" || user?.plan === "PRO";

  const includedVoiceMinutes = !voicePlanEnabled
    ? 0
    : trialActive
      ? user?.plan === "PRO"
        ? 30
        : 15
      : user?.plan === "PRO"
        ? 500
        : 200;

  const usedVoiceSeconds = voicePlanEnabled
    ? voiceUsage._sum.durationSeconds ?? 0
    : 0;
  const usedVoiceMinutes = usedVoiceSeconds / 60;
  const usedIncludedMinutes = trialActive
    ? usedVoiceMinutes
    : voiceUsage._sum.includedMinutesUsed ?? 0;
  const usedExtraMinutes = voiceUsage._sum.extraMinutesUsed ?? 0;
  const remainingVoiceMinutes = Math.max(
    includedVoiceMinutes - usedIncludedMinutes,
    0,
  );
  const extraVoiceMinutes = voicePlanEnabled
    ? Math.max(billingUser?.extraVoiceMinutes ?? 0, 0)
    : 0;
  const totalRemainingVoiceMinutes = remainingVoiceMinutes + extraVoiceMinutes;
  const voiceUsagePercent =
    includedVoiceMinutes > 0
      ? Math.min((usedIncludedMinutes / includedVoiceMinutes) * 100, 100)
      : 0;

  const voiceBalanceBaseline =
    includedVoiceMinutes + usedExtraMinutes + extraVoiceMinutes;
  const voiceLowBalanceThreshold = trialActive
    ? includedVoiceMinutes * 0.2
    : Math.max(voiceBalanceBaseline * 0.2, 20);
  const isVoiceLowBalance =
    includedVoiceMinutes > 0 &&
    totalRemainingVoiceMinutes > 0 &&
    totalRemainingVoiceMinutes <= voiceLowBalanceThreshold;

  const extraVoicePackages = [
    { minutes: 100, price: 15 },
    { minutes: 500, price: 75 },
    { minutes: 1000, price: 120 },
  ];

  const [upcomingJobs, recentLeads] = await Promise.all([
    prisma.booking.findMany({
      where: {
        userId: user?.id ?? "",
        startAt: {
          gte: new Date(),
        },
        status: {
          not: "CANCELLED",
        },
      },
      orderBy: {
        startAt: "asc",
      },
      take: 3,
      select: {
        id: true,
        customerName: true,
        service: true,
        startAt: true,
        endAt: true,
        status: true,
      },
    }),
    prisma.lead.findMany({
      where: {
        userId: user?.id ?? "",
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 3,
      select: {
        id: true,
        name: true,
        phone: true,
        service: true,
        status: true,
        createdAt: true,
      },
    }),
  ]);

  return (
    <div className="min-h-screen bg-[#020617] text-white">
      <div className="space-y-8 p-4 sm:p-6 lg:p-8">
        <div>
          <p className="mb-2 text-sm font-medium text-blue-400">
            SMART CLEANING DESK
          </p>

          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Welcome back{user?.name ? `, ${user.name}` : ""}
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400 sm:text-base">
            Your AI employee is ready to help manage customer conversations,
            leads, bookings, and follow-ups.
          </p>
        </div>

        <Card className="overflow-hidden border-blue-500/20 bg-gradient-to-br from-blue-950/50 via-slate-950 to-slate-950 text-white shadow-2xl shadow-blue-950/20">
          <CardContent className="p-6 sm:p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-3xl">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-500/10 px-3 py-1.5 text-xs font-medium text-blue-300">
                  <Bot className="h-3.5 w-3.5" />
                  AI EMPLOYEE
                </div>

                <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                  Your AI employee is ready to work.
                </h2>

                <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400 sm:text-base">
                  Let your AI handle customer questions, qualify leads,
                  collect job details, follow up with prospects, and help
                  manage your cleaning business.
                </p>

                <div className="mt-6 flex flex-wrap gap-3">
                  <Link
                    href="/dashboard/ai"
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 text-sm font-semibold text-white transition-colors hover:bg-blue-500"
                  >
                    Configure AI Employee
                    <ArrowRight className="h-4 w-4" />
                  </Link>

                  <Link
                    href="/onboarding"
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-slate-700 bg-slate-900/70 px-5 text-sm font-semibold text-white transition-colors hover:border-slate-600 hover:bg-slate-800"
                  >
                    Business Setup
                    <Settings2 className="h-4 w-4" />
                  </Link>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-5 py-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/10">
                  <span className="h-3 w-3 rounded-full bg-emerald-400 shadow-lg shadow-emerald-400/40" />
                </div>

                <div>
                  <p className="text-sm font-semibold text-emerald-300">
                    AI Employee
                  </p>

                  <p className="text-xs text-emerald-400/70">
                    Ready to configure
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {trialActive && billingUser?.trialEndsAt && (
          <div className="rounded-xl border border-blue-500/20 bg-blue-500/10 p-4">
            <p className="text-sm font-semibold text-blue-200">
              Free trial active
            </p>
            <p className="mt-1 text-xs leading-5 text-blue-200/70">
              Your trial ends on{" "}
              {billingUser.trialEndsAt.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}. AI Phone trial allowance:{" "}
              {includedVoiceMinutes} minutes total.
            </p>
          </div>
        )}

        {voicePlanEnabled && includedVoiceMinutes > 0 && (
          <section>
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-white">
                Voice Usage
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Track your AI receptionist minutes for the current plan.
              </p>
            </div>

            {isVoiceLowBalance && (
              <Link
                href="/dashboard/billing/voice"
                className="mb-4 flex items-center justify-between gap-4 rounded-xl border border-red-500/30 bg-red-500/10 p-4 transition-colors hover:border-red-400/50 hover:bg-red-500/15"
              >
                <div>
                  <p className="text-sm font-semibold text-red-300">
                    Your AI Phone minutes are running low
                  </p>
                  <p className="mt-1 text-xs leading-5 text-red-200/70">
                    Only {totalRemainingVoiceMinutes.toFixed(1)} minutes remain.
                    Would you like to add more minutes?
                  </p>
                </div>
                <span className="shrink-0 rounded-lg bg-red-500 px-3 py-2 text-xs font-semibold text-white">
                  Add Minutes
                </span>
              </Link>
            )}

            <Card className="border-slate-800 bg-slate-950/70 text-white shadow-lg">
              <CardContent className="p-6">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-400">
                      Included Voice Minutes
                    </p>

                    <div className="mt-2 flex items-baseline gap-2">
                      <span className="text-3xl font-bold tracking-tight text-white">
                        {usedVoiceMinutes.toFixed(1)}
                      </span>

                      <span className="text-sm text-slate-500">
                        / {includedVoiceMinutes} min used
                      </span>
                    </div>

                    <p className="mt-2 text-xs text-slate-500">
                      {remainingVoiceMinutes.toFixed(1)} minutes remaining
                    </p>
                  </div>

                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-blue-500/20 bg-blue-500/10">
                    <Phone className="h-5 w-5 text-blue-400" />
                  </div>
                </div>

                <div className="mt-6 rounded-xl border border-slate-800 bg-slate-900/50 p-4">
                  <div className="flex items-end justify-between gap-4">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                        Minutes Remaining
                      </p>
                      <p
                        className={
                          "mt-1 text-3xl font-bold tracking-tight " +
                          (isVoiceLowBalance ? "text-red-400" : "text-emerald-400")
                        }
                      >
                        {totalRemainingVoiceMinutes.toFixed(1)}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {usedVoiceMinutes.toFixed(1)} min used this billing period
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-xs text-slate-500">Included</p>
                      <p className="mt-1 text-sm font-semibold text-white">
                        {remainingVoiceMinutes.toFixed(1)} / {includedVoiceMinutes} min
                      </p>
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>Voice usage</span>
                      <span>{voiceUsagePercent.toFixed(0)}%</span>
                    </div>
                    <div className="mt-2 h-3 overflow-hidden rounded-full bg-slate-800">
                      <div
                        className="h-full rounded-full bg-blue-500 transition-all duration-500"
                        style={{ width: voiceUsagePercent + "%" }}
                      />
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div className="rounded-lg border border-slate-800 bg-slate-950/70 p-3">
                      <p className="text-xs text-slate-500">Included Remaining</p>
                      <p className="mt-1 text-base font-semibold text-white">
                        {remainingVoiceMinutes.toFixed(1)} min
                      </p>
                      <p className="mt-1 text-[11px] text-slate-600">
                        {usedIncludedMinutes.toFixed(1)} min used
                      </p>
                    </div>

                    <div className="rounded-lg border border-slate-800 bg-slate-950/70 p-3">
                      <p className="text-xs text-slate-500">Extra Balance</p>
                      <p className="mt-1 text-base font-semibold text-blue-400">
                        {extraVoiceMinutes.toFixed(1)} min
                      </p>
                      <p className="mt-1 text-[11px] text-slate-600">
                        {usedExtraMinutes.toFixed(1)} min used
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {!trialActive && (
              <details className="group mt-4 overflow-hidden rounded-xl border border-slate-800 bg-slate-900/50">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-4 transition-colors hover:bg-slate-900 [&::-webkit-details-marker]:hidden">
                  <div>
                    <p className="text-sm font-semibold text-white">
                      Extra Minutes
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      Purchase additional AI Phone minutes
                    </p>
                  </div>

                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-700 bg-slate-950 text-slate-400 transition-transform group-open:rotate-180">
                    <svg
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className="h-4 w-4"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </span>
                </summary>

                <div className="grid gap-3 border-t border-slate-800 p-3 sm:grid-cols-3">
                  {extraVoicePackages.map((pack) => (
                    <Link
                      key={pack.minutes}
                      href={`/dashboard/billing/voice?minutes=${pack.minutes}`}
                      className="rounded-lg border border-slate-800 bg-slate-950/70 p-4 transition-colors hover:border-blue-500/40 hover:bg-slate-900"
                    >
                      <p className="text-sm font-semibold text-white">
                        {pack.minutes.toLocaleString()} Minutes
                      </p>
                      <p className="mt-1 text-lg font-bold text-blue-400">
                        ${pack.price}
                      </p>
                      <p className="mt-2 text-xs text-slate-500">
                        Add to your AI Phone minutes
                      </p>
                    </Link>
                  ))}
                </div>
              </details>
            )}
          </section>
        )}

        <section>
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-white">
              Business Overview
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              A quick look at your customer activity.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat) => {
              const Icon = stat.icon;

              return (
                <Card
                  key={stat.title}
                  className="border-slate-800 bg-slate-950/70 text-white shadow-lg"
                >
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-400">
                          {stat.title}
                        </p>

                        <p className="mt-3 text-3xl font-bold tracking-tight text-white">
                          {stat.value}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          {stat.description}
                        </p>
                      </div>

                      <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-blue-500/20 bg-blue-500/10">
                        <Icon className="h-5 w-5 text-blue-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        <section>
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-white">
              Get Your AI Employee Working
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Complete these steps to start automating your cleaning business.
            </p>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            {setupSteps.map((step) => (
              <Link
                key={step.number}
                href={step.href}
                className="group rounded-2xl border border-slate-800 bg-slate-950/70 p-6 transition-all hover:border-blue-500/30 hover:bg-slate-900/80"
              >
                <div className="flex items-start justify-between">
                  <span className="text-xs font-bold tracking-widest text-blue-400">
                    {step.number}
                  </span>

                  <ArrowRight className="h-4 w-4 text-slate-600 transition-transform group-hover:translate-x-1 group-hover:text-blue-400" />
                </div>

                <h3 className="mt-6 font-semibold text-white">
                  {step.title}
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  {step.description}
                </p>

                <div className="mt-5 text-sm font-medium text-blue-400">
                  {step.action}
                </div>
              </Link>
            ))}
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="border-slate-800 bg-slate-950/70 text-white shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold">
                    Upcoming Jobs
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Your next scheduled cleaning appointments.
                  </p>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-blue-500/20 bg-blue-500/10">
                  <CalendarDays className="h-5 w-5 text-blue-400" />
                </div>
              </div>

              <div className="mt-6 space-y-3">
                {upcomingJobs.length > 0 ? (
                  upcomingJobs.map((job) => (
                    <div
                      key={job.id}
                      className="rounded-xl border border-slate-800 bg-slate-900/50 p-4"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-medium text-white">
                            {job.customerName}
                          </p>
                          <p className="mt-1 text-sm text-slate-400">
                            {job.service}
                          </p>
                        </div>
                        <span className="rounded-full border border-blue-500/20 bg-blue-500/10 px-2.5 py-1 text-xs font-medium text-blue-300">
                          {job.status}
                        </span>
                      </div>
                      <p className="mt-3 text-xs text-slate-500">
                        {job.startAt.toLocaleString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                        })}{" "}
                        –{" "}
                        {job.endAt.toLocaleTimeString("en-US", {
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="flex min-h-[190px] flex-col items-center justify-center text-center">
                    <div className="mb-4 rounded-full border border-slate-800 bg-slate-900/70 p-4">
                      <Clock3 className="h-6 w-6 text-slate-500" />
                    </div>
                    <h3 className="font-semibold">No upcoming jobs</h3>
                    <p className="mt-1 max-w-sm text-sm text-slate-500">
                      Your scheduled cleaning appointments will appear here.
                    </p>
                  </div>
                )}
                <Link
                  href="/dashboard/calendar"
                  className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-800 bg-slate-900/70 px-4 text-sm font-medium text-white transition-colors hover:border-slate-700 hover:bg-slate-800"
                >
                  Open Calendar
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-800 bg-slate-950/70 text-white shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold">
                    Recent Leads
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Customers who recently contacted your business.
                  </p>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-blue-500/20 bg-blue-500/10">
                  <Users className="h-5 w-5 text-blue-400" />
                </div>
              </div>

              <div className="mt-6 space-y-3">
                {recentLeads.length > 0 ? (
                  recentLeads.map((lead) => (
                    <div
                      key={lead.id}
                      className="rounded-xl border border-slate-800 bg-slate-900/50 p-4"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-medium text-white">
                            {lead.name || "Unnamed lead"}
                          </p>
                          <p className="mt-1 text-sm text-slate-400">
                            {lead.service || "Service not specified"}
                          </p>
                        </div>
                        <span className="rounded-full border border-slate-700 bg-slate-800 px-2.5 py-1 text-xs font-medium text-slate-300">
                          {lead.status}
                        </span>
                      </div>
                      <p className="mt-3 text-xs text-slate-500">
                        {lead.createdAt.toLocaleString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                        {lead.phone ? ` · ${lead.phone}` : ""}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="flex min-h-[190px] flex-col items-center justify-center text-center">
                    <div className="mb-4 rounded-full border border-slate-800 bg-slate-900/70 p-4">
                      <Users className="h-6 w-6 text-slate-500" />
                    </div>
                    <h3 className="font-semibold">No leads yet</h3>
                    <p className="mt-1 max-w-sm text-sm text-slate-500">
                      New leads from your AI employee will appear here.
                    </p>
                  </div>
                )}
                <Link
                  href="/dashboard/leads"
                  className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-800 bg-slate-900/70 px-4 text-sm font-medium text-white transition-colors hover:border-slate-700 hover:bg-slate-800"
                >
                  View Leads
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex items-center gap-4 rounded-2xl border border-slate-800 bg-slate-950/70 p-5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500/10">
            <CheckCircle2 className="h-5 w-5 text-emerald-400" />
          </div>

          <div>
            <p className="font-medium text-white">
              Smart Cleaning Desk is ready
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Your workspace is ready. Complete your setup to start training
              your AI employee.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
