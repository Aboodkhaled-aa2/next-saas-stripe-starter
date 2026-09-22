import Link from "next/link";
import {
  ArrowRight,
  Bot,
  CalendarDays,
  CheckCircle2,
  Clock3,
  MessageSquare,
  Phone,
  Users,
} from "lucide-react";

import { getCurrentUser } from "@/lib/session";
import { constructMetadata } from "@/lib/utils";
import { DashboardHeader } from "@/components/dashboard/header";
import { Card, CardContent } from "@/components/ui/card";

export const metadata = constructMetadata({
  title: "Dashboard – Smart Cleaning Desk",
  description: "Manage your cleaning business with your AI employee.",
});

const stats = [
  {
    title: "Total Leads",
    value: "0",
    description: "No new leads yet",
    icon: Users,
  },
  {
    title: "Booked Jobs",
    value: "0",
    description: "No bookings yet",
    icon: CalendarDays,
  },
  {
    title: "AI Conversations",
    value: "0",
    description: "No conversations yet",
    icon: MessageSquare,
  },
  {
    title: "Calls Handled",
    value: "0",
    description: "No calls yet",
    icon: Phone,
  },
];

const quickActions = [
  {
    title: "AI Employee",
    description: "Configure how your AI handles customers.",
    href: "/dashboard/ai",
    icon: Bot,
  },
  {
    title: "Calendar",
    description: "View and manage upcoming cleaning jobs.",
    href: "/dashboard/calendar",
    icon: CalendarDays,
  },
  {
    title: "Leads",
    description: "Review customers and potential bookings.",
    href: "/dashboard/leads",
    icon: Users,
  },
];

export default async function DashboardPage() {
  const user = await getCurrentUser();

  return (
    <div className="min-h-screen bg-[#020617] text-white">
      <div className="space-y-8 p-4 sm:p-6 lg:p-8">
        <DashboardHeader
          heading="Dashboard"
          text={`Welcome back${
            user?.name ? `, ${user.name}` : ""
          }. Here's what's happening with your cleaning business.`}
        />

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;

            return (
              <Card
                key={stat.title}
                className="border-slate-800 bg-slate-950/70 text-white shadow-lg"
              >
                <CardContent className="flex items-center justify-between p-5">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-slate-400">
                      {stat.title}
                    </p>

                    <p className="text-3xl font-bold tracking-tight text-white">
                      {stat.value}
                    </p>

                    <p className="text-xs text-slate-500">
                      {stat.description}
                    </p>
                  </div>

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-blue-500/20 bg-blue-500/10">
                    <Icon className="h-5 w-5 text-blue-400" />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card className="border-slate-800 bg-slate-950/70 text-white shadow-lg">
          <CardContent className="p-6 sm:p-7">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1.5 text-xs font-medium text-blue-400">
                  <Bot className="h-3.5 w-3.5" />
                  AI Employee
                </div>

                <h2 className="text-2xl font-bold tracking-tight text-white">
                  Your AI Employee is ready
                </h2>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
                  Your AI receptionist can answer customer questions,
                  qualify leads, follow up, and help book cleaning jobs.
                </p>
              </div>

              <div className="flex w-fit items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-400">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                Ready
              </div>
            </div>

            <div className="mt-7 grid gap-4 md:grid-cols-3">
              <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5 transition-colors hover:border-slate-700">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10">
                  <Bot className="h-5 w-5 text-blue-400" />
                </div>

                <h3 className="font-semibold text-white">
                  AI Receptionist
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-400">
                  Answer questions, qualify leads, and help customers book
                  cleaning services.
                </p>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5 transition-colors hover:border-slate-700">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10">
                  <MessageSquare className="h-5 w-5 text-blue-400" />
                </div>

                <h3 className="font-semibold text-white">
                  Customer Messaging
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-400">
                  Keep customer conversations organized across your connected
                  messaging channels.
                </p>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5 transition-colors hover:border-slate-700">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10">
                  <Phone className="h-5 w-5 text-blue-400" />
                </div>

                <h3 className="font-semibold text-white">
                  Voice AI
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-400">
                  Let your AI answer incoming calls and handle customer
                  conversations.
                </p>
              </div>
            </div>

            <div className="mt-6">
              <Link
                href="/dashboard/ai"
                className="inline-flex h-11 items-center justify-center rounded-lg bg-blue-600 px-5 text-sm font-semibold text-white shadow-lg shadow-blue-500/10 transition-all hover:bg-blue-500"
              >
                Configure AI Employee
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="border-slate-800 bg-slate-950/70 text-white shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-white">
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

              <div className="flex min-h-[190px] flex-col items-center justify-center text-center">
                <div className="mb-4 rounded-full border border-slate-800 bg-slate-900/70 p-4">
                  <Clock3 className="h-6 w-6 text-slate-500" />
                </div>

                <h3 className="font-semibold text-white">
                  No upcoming jobs
                </h3>

                <p className="mt-1 max-w-sm text-sm text-slate-500">
                  Your scheduled cleaning appointments will appear here.
                </p>

                <Link
                  href="/dashboard/calendar"
                  className="mt-5 inline-flex h-10 items-center justify-center rounded-lg border border-slate-800 bg-slate-900/70 px-4 text-sm font-medium text-white transition-colors hover:border-slate-700 hover:bg-slate-800"
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
                  <h2 className="text-lg font-semibold text-white">
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

              <div className="flex min-h-[190px] flex-col items-center justify-center text-center">
                <div className="mb-4 rounded-full border border-slate-800 bg-slate-900/70 p-4">
                  <Users className="h-6 w-6 text-slate-500" />
                </div>

                <h3 className="font-semibold text-white">
                  No leads yet
                </h3>

                <p className="mt-1 max-w-sm text-sm text-slate-500">
                  New leads from your AI employee will appear here.
                </p>

                <Link
                  href="/dashboard/leads"
                  className="mt-5 inline-flex h-10 items-center justify-center rounded-lg border border-slate-800 bg-slate-900/70 px-4 text-sm font-medium text-white transition-colors hover:border-slate-700 hover:bg-slate-800"
                >
                  View Leads
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-slate-800 bg-slate-950/70 text-white shadow-lg">
          <CardContent className="p-6">
            <div className="mb-5">
              <h2 className="text-lg font-semibold text-white">
                Quick Actions
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Manage the most important parts of your AI cleaning assistant.
              </p>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              {quickActions.map((action) => {
                const Icon = action.icon;

                return (
                  <Link
                    key={action.title}
                    href={action.href}
                    className="group rounded-xl border border-slate-800 bg-slate-900/40 p-5 transition-all hover:border-blue-500/30 hover:bg-slate-900/70"
                  >
                    <div className="mb-5 flex items-center justify-between">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10">
                        <Icon className="h-5 w-5 text-blue-400" />
                      </div>

                      <ArrowRight className="h-4 w-4 text-slate-600 transition-transform group-hover:translate-x-1 group-hover:text-blue-400" />
                    </div>

                    <h3 className="font-semibold text-white">
                      {action.title}
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-slate-500">
                      {action.description}
                    </p>
                  </Link>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center gap-4 rounded-xl border border-slate-800 bg-slate-950/70 p-5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500/10">
            <CheckCircle2 className="h-5 w-5 text-emerald-400" />
          </div>

          <div>
            <p className="font-medium text-white">
              Your account is active
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Complete your business setup to start using your AI employee.
            </p>
          </div>

          <Link
            href="/dashboard/settings"
            className="ml-auto hidden h-10 items-center justify-center rounded-lg border border-slate-800 bg-slate-900/70 px-4 text-sm font-medium text-white transition-colors hover:border-slate-700 hover:bg-slate-800 sm:inline-flex"
          >
            Business Settings
          </Link>
        </div>
      </div>
    </div>
  );
}
