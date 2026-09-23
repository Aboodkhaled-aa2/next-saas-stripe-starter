import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  DollarSign,
  Mail,
  Phone,
  Plus,
  UserRound,
  Users,
} from "lucide-react";

import { DashboardHeader } from "@/components/dashboard/header";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

export const dynamic = "force-dynamic";

const statusStyles = {
  NEW: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  CONTACTED: "bg-slate-500/10 text-slate-300 border-slate-500/20",
  QUALIFIED: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  BOOKED: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  LOST: "bg-red-500/10 text-red-400 border-red-500/20",
} as const;

const statusLabels = {
  NEW: "New",
  CONTACTED: "Contacted",
  QUALIFIED: "Qualified",
  BOOKED: "Booked",
  LOST: "Lost",
} as const;

export default async function LeadsPage() {
  const user = await getCurrentUser();

  if (!user?.id) {
    return null;
  }

  const leads = await prisma.lead.findMany({
    where: {
      userId: user.id,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const stats = {
    total: leads.length,
    new: leads.filter((lead) => lead.status === "NEW").length,
    qualified: leads.filter((lead) => lead.status === "QUALIFIED").length,
    booked: leads.filter((lead) => lead.status === "BOOKED").length,
  };

  return (
    <div className="space-y-6">
      <DashboardHeader
        heading="Leads"
        text="Track, qualify, and manage potential customers captured by your AI employee."
      >
        <Link
          href="/dashboard/ai"
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-blue-500"
        >
          <Plus className="h-4 w-4" />
          Add Lead
        </Link>
      </DashboardHeader>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Leads"
          value={stats.total}
          icon={<Users className="h-5 w-5" />}
        />

        <StatCard
          label="New"
          value={stats.new}
          icon={<UserRound className="h-5 w-5" />}
        />

        <StatCard
          label="Qualified"
          value={stats.qualified}
          icon={<ArrowRight className="h-5 w-5" />}
        />

        <StatCard
          label="Booked"
          value={stats.booked}
          icon={<CalendarDays className="h-5 w-5" />}
        />
      </div>

      <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/70 shadow-xl">
        <div className="border-b border-slate-800 px-6 py-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="font-semibold text-white">Recent Leads</h2>
              <p className="mt-1 text-sm text-slate-500">
                Customers captured from your conversations and channels.
              </p>
            </div>

            <span className="rounded-full border border-slate-800 bg-slate-900 px-3 py-1 text-xs font-medium text-slate-400">
              {stats.total} total
            </span>
          </div>
        </div>

        {leads.length === 0 ? (
          <div className="flex min-h-[360px] flex-col items-center justify-center px-6 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-800 bg-slate-900">
              <Users className="h-6 w-6 text-slate-500" />
            </div>

            <h3 className="mt-5 text-base font-semibold text-white">
              No leads yet
            </h3>

            <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
              Your AI employee will automatically capture leads when customers
              start contacting your business.
            </p>

            <Link
              href="/dashboard/ai"
              className="mt-5 inline-flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900 px-4 py-2.5 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-800 hover:text-white"
            >
              Configure AI Employee
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <>
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[900px]">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-900/30 text-left">
                    <th className="px-6 py-4 text-xs font-medium uppercase tracking-wide text-slate-500">
                      Lead
                    </th>
                    <th className="px-6 py-4 text-xs font-medium uppercase tracking-wide text-slate-500">
                      Service
                    </th>
                    <th className="px-6 py-4 text-xs font-medium uppercase tracking-wide text-slate-500">
                      Source
                    </th>
                    <th className="px-6 py-4 text-xs font-medium uppercase tracking-wide text-slate-500">
                      Status
                    </th>
                    <th className="px-6 py-4 text-xs font-medium uppercase tracking-wide text-slate-500">
                      Quote
                    </th>
                    <th className="px-6 py-4 text-xs font-medium uppercase tracking-wide text-slate-500">
                      Created
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {leads.map((lead) => (
                    <tr
                      key={lead.id}
                      className="border-b border-slate-800/70 transition-colors last:border-0 hover:bg-slate-900/30"
                    >
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-white">
                            {lead.name || "Unnamed lead"}
                          </p>

                          <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                            {lead.email && (
                              <span className="inline-flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                {lead.email}
                              </span>
                            )}

                            {lead.phone && (
                              <span className="inline-flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                {lead.phone}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-sm text-slate-300">
                        {lead.service || "—"}
                      </td>

                      <td className="px-6 py-4 text-sm capitalize text-slate-400">
                        {lead.source || "—"}
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${
                            statusStyles[lead.status]
                          }`}
                        >
                          {statusLabels[lead.status]}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        {lead.quoteAmount !== null ? (
                          <span className="inline-flex items-center gap-1 text-sm font-medium text-slate-200">
                            <DollarSign className="h-3.5 w-3.5 text-slate-500" />
                            {lead.quoteAmount.toFixed(2)}
                          </span>
                        ) : (
                          <span className="text-sm text-slate-600">—</span>
                        )}
                      </td>

                      <td className="px-6 py-4 text-sm text-slate-500">
                        {formatDate(lead.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="divide-y divide-slate-800 md:hidden">
              {leads.map((lead) => (
                <div key={lead.id} className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-medium text-white">
                        {lead.name || "Unnamed lead"}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        {lead.service || "Service not specified"}
                      </p>
                    </div>

                    <span
                      className={`shrink-0 rounded-full border px-2.5 py-1 text-xs font-medium ${
                        statusStyles[lead.status]
                      }`}
                    >
                      {statusLabels[lead.status]}
                    </span>
                  </div>

                  <div className="mt-4 grid gap-2 text-xs text-slate-500">
                    {lead.phone && (
                      <span className="inline-flex items-center gap-2">
                        <Phone className="h-3.5 w-3.5" />
                        {lead.phone}
                      </span>
                    )}

                    {lead.email && (
                      <span className="inline-flex items-center gap-2 break-all">
                        <Mail className="h-3.5 w-3.5" />
                        {lead.email}
                      </span>
                    )}

                    {lead.location && (
                      <span className="inline-flex items-center gap-2">
                        <ArrowRight className="h-3.5 w-3.5" />
                        {lead.location}
                      </span>
                    )}
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-slate-800 pt-4">
                    <span className="text-xs text-slate-600">
                      {formatDate(lead.createdAt)}
                    </span>

                    {lead.quoteAmount !== null && (
                      <span className="inline-flex items-center gap-1 text-sm font-medium text-slate-200">
                        <DollarSign className="h-3.5 w-3.5 text-slate-500" />
                        {lead.quoteAmount.toFixed(2)}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </section>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-5 shadow-xl">
      <div className="flex items-center justify-between">
        <span className="text-sm text-slate-500">{label}</span>

        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 text-slate-400">
          {icon}
        </div>
      </div>

      <p className="mt-4 text-2xl font-semibold text-white">{value}</p>
    </div>
  );
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}
