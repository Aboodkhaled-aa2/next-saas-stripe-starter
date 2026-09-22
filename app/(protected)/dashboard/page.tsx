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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

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
    <div className="space-y-8">
      <DashboardHeader
        heading="Good to see you again."
        text={`Welcome back${
          user?.name ? `, ${user.name}` : ""
        }. Here's what's happening with your cleaning business.`}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <Card key={stat.title}>
              <CardContent className="flex items-center justify-between p-6">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </p>

                  <p className="text-3xl font-bold tracking-tight">
                    {stat.value}
                  </p>

                  <p className="text-xs text-muted-foreground">
                    {stat.description}
                  </p>
                </div>

                <div className="rounded-lg border bg-muted/50 p-3">
                  <Icon className="h-5 w-5 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div>
              <CardTitle>AI Employee</CardTitle>

              <CardDescription>
                Your AI receptionist is ready to help manage customer
                conversations.
              </CardDescription>
            </div>

            <div className="flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium">
              <span className="h-2 w-2 rounded-full bg-green-500" />
              Ready
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-lg border p-4">
              <div className="mb-3 flex items-center gap-2">
                <Bot className="h-4 w-4" />

                <span className="text-sm font-medium">
                  AI Receptionist
                </span>
              </div>

              <p className="text-sm text-muted-foreground">
                Answer questions, qualify leads, and help customers book
                cleaning services.
              </p>
            </div>

            <div className="rounded-lg border p-4">
              <div className="mb-3 flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />

                <span className="text-sm font-medium">
                  Messaging
                </span>
              </div>

              <p className="text-sm text-muted-foreground">
                Connect your customer messaging channels and never miss a
                potential lead.
              </p>
            </div>

            <div className="rounded-lg border p-4">
              <div className="mb-3 flex items-center gap-2">
                <Phone className="h-4 w-4" />

                <span className="text-sm font-medium">
                  Voice
                </span>
              </div>

              <p className="text-sm text-muted-foreground">
                Let your AI answer incoming calls and handle customer
                conversations.
              </p>
            </div>
          </div>

          <div className="mt-6">
            <Link
              href="/dashboard/ai"
              className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Configure AI Employee
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Jobs</CardTitle>

            <CardDescription>
              Your next scheduled cleaning appointments.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div className="flex min-h-[180px] flex-col items-center justify-center text-center">
              <div className="mb-4 rounded-full border bg-muted/50 p-4">
                <Clock3 className="h-6 w-6 text-muted-foreground" />
              </div>

              <h3 className="font-semibold">
                No upcoming jobs
              </h3>

              <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                Your scheduled cleaning appointments will appear here.
              </p>

              <Link
                href="/dashboard/calendar"
                className="mt-4 inline-flex h-10 items-center justify-center rounded-md border bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
              >
                Open Calendar
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Leads</CardTitle>

            <CardDescription>
              Customers who recently contacted your business.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div className="flex min-h-[180px] flex-col items-center justify-center text-center">
              <div className="mb-4 rounded-full border bg-muted/50 p-4">
                <Users className="h-6 w-6 text-muted-foreground" />
              </div>

              <h3 className="font-semibold">
                No leads yet
              </h3>

              <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                New leads from your AI employee will appear here.
              </p>

              <Link
                href="/dashboard/leads"
                className="mt-4 inline-flex h-10 items-center justify-center rounded-md border bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
              >
                View Leads
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>

          <CardDescription>
            Manage the most important parts of your AI cleaning assistant.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="grid gap-3 md:grid-cols-3">
            {quickActions.map((action) => {
              const Icon = action.icon;

              return (
                <Link
                  key={action.title}
                  href={action.href}
                  className="group rounded-lg border p-4 transition-colors hover:bg-muted/50"
                >
                  <div className="mb-4 flex items-center justify-between">
                    <div className="rounded-lg border bg-muted/50 p-2">
                      <Icon className="h-4 w-4" />
                    </div>

                    <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
                  </div>

                  <h3 className="font-semibold">
                    {action.title}
                  </h3>

                  <p className="mt-1 text-sm text-muted-foreground">
                    {action.description}
                  </p>
                </Link>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex items-center gap-4 p-6">
          <div className="rounded-full border p-2">
            <CheckCircle2 className="h-5 w-5" />
          </div>

          <div>
            <p className="font-medium">
              Your account is active
            </p>

            <p className="text-sm text-muted-foreground">
              Complete your business setup to start using your AI employee.
            </p>
          </div>

          <Link
            href="/dashboard/settings"
            className="ml-auto inline-flex h-10 items-center justify-center rounded-md border bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
          >
            Business Settings
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
