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
