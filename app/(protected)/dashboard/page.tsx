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
                className="border-[#17233d] bg-[#080f21] text-white shadow-none"
              >
                <CardContent className="flex items-center justify-between p-5">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-[#94a3b8]">
                      {stat.title}
                    </p>

                    <p className="text-3xl font-bold tracking-tight">
                      {stat.value}
                    </p>

                    <p className="text-xs text-[#64748b]">
                      {stat.description}
                    </p>
                  </div>

                  <div className="rounded-xl border border-[#1d3158] bg-[#0b1938] p-3">
                    <Icon className="h-5 w-5 text-[#60a5fa]" />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card className="border-[#1b2c4b] bg-[#080f21] text-white shadow-none">
          <CardContent className="p-6 sm:p-7">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#21427b] bg-[#0b1938] px-3 py-1.5 text-xs font-medium text-[#8dbfff]">
                  <Bot className="h-3.5 w-3.5" />
                  AI Employee
                </div>

                <h2 className="text-2xl font-bold tracking-tight">
                  Your AI Employee is ready
                </h2>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-[#94a3b8]">
                  Your AI receptionist can answer customer questions,
                  qualify leads, follow up, and help book cleaning jobs.
                </p>
              </div>

              <div className="flex w-fit items-center gap-2 rounded-full border border-[#164e36] bg-[#071c15] px-3 py-1.5 text-xs font-medium text-[#6ee7b7]">
                <span className="h-2 w-2 rounded-full bg-[#22c55e]" />
                Ready
              </div>
            </div>

            <div className="mt-7 grid gap-4 md:grid-cols-3">
              <div className="rounded-xl border border-[#172746] bg-[#070d1c] p-5">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-[#0b1938]">
                  <Bot className="h-5 w-5 text-[#60a5fa]" />
                </div>

                <h3 className="font-semibold">
                  AI Receptionist
                </h3>

                <p className="mt-2 text-sm leading-6 text-[#94a3b8]">
                  Answer questions, qualify leads, and help customers book
                  cleaning services.
                </p>
              </div>

              <div className="rounded-xl border border-[#172746] bg-[#070d1c] p-5">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-[#0b1938]">
                  <MessageSquare className="h-5 w-5 text-[#60a5fa]" />
                </div>

                <h3 className="font-semibold">
                  Customer Messaging
                </h3>

                <p className="mt-2 text-sm leading-6 text-[#94a3b8]">
                  Keep customer conversations organized across your connected
                  messaging channels.
                </p>
              </div>

              <div className="rounded-xl border border-[#172746] bg-[#070d1c] p-5">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-[#0b1938]">
                  <Phone className="h-5 w-5 text-[#60a5fa]" />
                </div>

                <h3 className="font-semibold">
                  Voice AI
                </h3>

                <p className="mt-2 text-sm leading-6 text-[#94a3b8]">
                  Let your AI answer incoming calls and handle customer
                  conversations.
                </p>
              </div>
            </div>

            <div className="mt-6">
              <Link
                href="/dashboard/ai"
                className="inline-flex h-11 items-center justify-center rounded-lg bg-[#2563eb] px-5 text-sm font-semibold text-white shadow-lg shadow-blue-500/10 transition-all hover:bg-[#3b82f6]"
              >
                Configure AI Employee
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="border-[#17233d] bg-[#080f21] text-white shadow-none">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold">
                    Upcoming Jobs
                  </h2>

                  <p className="mt-1 text-sm text-[#64748b]">
                    Your next scheduled cleaning appointments.
                  </p>
                </div>

                <div className="rounded-xl border border-[#1d3158] bg-[#0b1938] p-3">
                  <CalendarDays className="h-5 w-5 text-[#60a5fa]" />
                </div>
              </div>

              <div className="flex min-h-[190px] flex-col items-center justify-center text-center">
                <div className="mb-4 rounded-full border border-[#172746] bg-[#0b1325] p-4">
                  <Clock3 className="h-6 w-6 text-[#64748b]" />
                </div>

                <h3 className="font-semibold">
                  No upcoming jobs
                </h3>

                <p className="mt-1 max-w-sm text-sm text-[#64748b]">
                  Your scheduled cleaning appointments will appear here.
                </p>

                <Link
                  href="/dashboard/calendar"
                  className="mt-5 inline-flex h-10 items-center justify-center rounded-lg border border-[#243858] bg-[#0b1325] px-4 text-sm font-medium text-white transition-colors hover:bg-[#111d34]"
                >
                  Open Calendar
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card className="border-[#17233d] bg-[#080f21] text-white shadow-none">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold">
                    Recent Leads
                  </h2>

                  <p className="mt-1 text-sm text-[#64748b]">
                    Customers who recently contacted your business.
                  </p>
                </div>

                <div className="rounded-xl border border-[#1d3158] bg-[#0b1938] p-3">
                  <Users className="h-5 w-5 text-[#60a5fa]" />
                </div>
              </div>

              <div className="flex min-h-[190px] flex-col items-center justify-center text-center">
                <div className="mb-4 rounded-full border border-[#172746] bg-[#0b1325] p-4">
                  <Users className="h-6 w-6 text-[#64748b]" />
                </div>

                <h3 className="font-semibold">
                  No leads yet
                </h3>

                <p className="mt-1 max-w-sm text-sm text-[#64748b]">
                  New leads from your AI employee will appear here.
                </p>

                <Link
                  href="/dashboard/leads"
                  className="mt-5 inline-flex h-10 items-center justify-center rounded-lg border border-[#243858] bg-[#0b1325] px-4 text-sm font-medium text-white transition-colors hover:bg-[#111d34]"
                >
                  View Leads
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-[#17233d] bg-[#080f21] text-white shadow-none">
          <CardContent className="p-6">
            <div className="mb-5">
              <h2 className="text-lg font-semibold">
                Quick Actions
              </h2>

              <p className="mt-1 text-sm text-[#64748b]">
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
                    className="group rounded-xl border border-[#172746] bg-[#070d1c] p-5 transition-all hover:border-[#28549a] hover:bg-[#0a1224]"
                  >
                    <div className="mb-5 flex items-center justify-between">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0b1938]">
                        <Icon className="h-5 w-5 text-[#60a5fa]" />
                      </div>

                      <ArrowRight className="h-4 w-4 text-[#475569] transition-transform group-hover:translate-x-1 group-hover:text-[#60a5fa]" />
                    </div>

                    <h3 className="font-semibold">
                      {action.title}
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-[#64748b]">
                      {action.description}
                    </p>
                  </Link>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center gap-4 rounded-xl border border-[#17233d] bg-[#080f21] p-5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#071c15]">
            <CheckCircle2 className="h-5 w-5 text-[#4ade80]" />
          </div>

          <div>
            <p className="font-medium">
              Your account is active
            </p>

            <p className="mt-1 text-sm text-[#64748b]">
              Complete your business setup to start using your AI employee.
            </p>
          </div>

          <Link
            href="/dashboard/settings"
            className="ml-auto hidden h-10 items-center justify-center rounded-lg border border-[#243858] bg-[#0b1325] px-4 text-sm font-medium transition-colors hover:bg-[#111d34] sm:inline-flex"
          >
            Business Settings
          </Link>
        </div>
      </div>
    </div>
  );
}
