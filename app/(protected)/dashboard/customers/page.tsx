import Link from "next/link";
import {
  ArrowRight,
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

export default async function CustomersPage() {
  const user = await getCurrentUser();

  if (!user?.id) {
    return null;
  }

  const customers = await prisma.customer.findMany({
    where: {
      userId: user.id,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className="space-y-6">
      <DashboardHeader
        heading="Customers"
        text="Manage your customers and keep track of their relationship with your cleaning business."
      >
        <Link
          href="/dashboard/ai"
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-blue-500"
        >
          <Plus className="h-4 w-4" />
          Add Customer
        </Link>
      </DashboardHeader>

      <div className="grid gap-4 sm:grid-cols-2">
        <StatCard
          label="Total Customers"
          value={customers.length}
          icon={<Users className="h-5 w-5" />}
        />

        <StatCard
          label="Total Bookings"
          value={customers.reduce(
            (total, customer) => total + customer.totalBookings,
            0,
          )}
          icon={<UserRound className="h-5 w-5" />}
        />
      </div>

      <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/70 shadow-xl">
        <div className="border-b border-slate-800 px-6 py-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="font-semibold text-white">
                Customer Directory
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Customers captured and managed by your AI employee.
              </p>
            </div>

            <span className="rounded-full border border-slate-800 bg-slate-900 px-3 py-1 text-xs font-medium text-slate-400">
              {customers.length} total
            </span>
          </div>
        </div>

        {customers.length === 0 ? (
          <div className="flex min-h-[360px] flex-col items-center justify-center px-6 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-800 bg-slate-900">
              <Users className="h-6 w-6 text-slate-500" />
            </div>

            <h3 className="mt-5 text-base font-semibold text-white">
              No customers yet
            </h3>

            <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
              Your customer list will appear here as your AI employee captures
              and converts leads into customers.
            </p>

            <Link
              href="/dashboard/leads"
              className="mt-5 inline-flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900 px-4 py-2.5 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-800 hover:text-white"
            >
              View Leads
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <>
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[800px]">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-900/30 text-left">
                    <th className="px-6 py-4 text-xs font-medium uppercase tracking-wide text-slate-500">
                      Customer
                    </th>

                    <th className="px-6 py-4 text-xs font-medium uppercase tracking-wide text-slate-500">
                      Contact
                    </th>

                    <th className="px-6 py-4 text-xs font-medium uppercase tracking-wide text-slate-500">
                      Bookings
                    </th>

                    <th className="px-6 py-4 text-xs font-medium uppercase tracking-wide text-slate-500">
                      Source
                    </th>

                    <th className="px-6 py-4 text-xs font-medium uppercase tracking-wide text-slate-500">
                      Last Contact
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {customers.map((customer) => (
                    <tr
                      key={customer.id}
                      className="border-b border-slate-800/70 transition-colors last:border-0 hover:bg-slate-900/30"
                    >
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-white">
                            {customer.name}
                          </p>

                          {customer.address && (
                            <p className="mt-1 max-w-xs truncate text-xs text-slate-500">
                              {customer.address}
                            </p>
                          )}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="space-y-1 text-xs text-slate-500">
                          {customer.phone && (
                            <span className="flex items-center gap-2">
                              <Phone className="h-3.5 w-3.5" />
                              {customer.phone}
                            </span>
                          )}

                          {customer.email && (
                            <span className="flex items-center gap-2">
                              <Mail className="h-3.5 w-3.5" />
                              {customer.email}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="px-6 py-4 text-sm font-medium text-slate-200">
                        {customer.totalBookings}
                      </td>

                      <td className="px-6 py-4 text-sm capitalize text-slate-400">
                        {customer.source || "—"}
                      </td>

                      <td className="px-6 py-4 text-sm text-slate-500">
                        {customer.lastContactAt
                          ? formatDate(customer.lastContactAt)
                          : "No contact yet"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="divide-y divide-slate-800 md:hidden">
              {customers.map((customer) => (
                <div key={customer.id} className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-medium text-white">
                        {customer.name}
                      </p>

                      {customer.address && (
                        <p className="mt-1 text-xs text-slate-500">
                          {customer.address}
                        </p>
                      )}
                    </div>

                    <span className="rounded-full border border-slate-800 bg-slate-900 px-2.5 py-1 text-xs font-medium text-slate-400">
                      {customer.totalBookings} bookings
                    </span>
                  </div>

                  <div className="mt-4 space-y-2 text-xs text-slate-500">
                    {customer.phone && (
                      <span className="flex items-center gap-2">
                        <Phone className="h-3.5 w-3.5" />
                        {customer.phone}
                      </span>
                    )}

                    {customer.email && (
                      <span className="flex items-center gap-2 break-all">
                        <Mail className="h-3.5 w-3.5" />
                        {customer.email}
                      </span>
                    )}
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-slate-800 pt-4">
                    <span className="text-xs text-slate-600">
                      {customer.source || "Direct"}
                    </span>

                    <span className="text-xs text-slate-600">
                      {customer.lastContactAt
                        ? formatDate(customer.lastContactAt)
                        : "No contact yet"}
                    </span>
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
