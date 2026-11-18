import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Mail, MapPin, Phone } from "lucide-react";

import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { DashboardHeader } from "@/components/dashboard/header";

export const dynamic = "force-dynamic";

const statusStyles: Record<string, string> = {
  NEW: "border-blue-500/20 bg-blue-500/10 text-blue-400",
  CONTACTED: "border-slate-500/20 bg-slate-500/10 text-slate-300",
  QUALIFIED: "border-purple-500/20 bg-purple-500/10 text-purple-400",
  BOOKED: "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
  LOST: "border-red-500/20 bg-red-500/10 text-red-400",
};

export default async function LeadDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();
  if (!user?.id) return null;

  const { id } = await params;
  const lead = await prisma.lead.findFirst({
    where: { id, userId: user.id },
  });

  if (!lead) notFound();

  const details = [
    { label: "Service", value: lead.service },
    { label: "Source", value: lead.source },
    { label: "Phone", value: lead.phone },
    { label: "Email", value: lead.email },
    { label: "Service address", value: lead.location },
    { label: "Quote", value: lead.quoteAmount !== null ? `$${lead.quoteAmount.toFixed(2)}` : null },
    { label: "Follow-up", value: lead.followUpAt?.toLocaleString("en-US") ?? null },
  ];

  return (
    <div className="space-y-6">
      <DashboardHeader
        heading={lead.name || "Lead details"}
        text="Review the customer information captured by your AI employee."
      >
        <Link href="/dashboard/leads" className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-800 bg-slate-900 px-4 text-sm font-medium text-white hover:bg-slate-800">
          <ArrowLeft className="h-4 w-4" />
          Back to Leads
        </Link>
      </DashboardHeader>

      <section className="rounded-2xl border border-slate-800 bg-slate-950/70 p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-white">Customer information</h2>
          <span className={`rounded-full border px-3 py-1 text-xs font-medium ${statusStyles[lead.status] ?? statusStyles.NEW}`}>
            {lead.status}
          </span>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {details.map((item) => (
            <div key={item.label} className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
              <p className="text-xs text-slate-500">{item.label}</p>
              <p className="mt-1 break-words text-sm font-medium text-white">{item.value || "Not provided"}</p>
            </div>
          ))}
        </div>

        <div className="mt-5 space-y-4">
          {lead.lastMessage && (
            <div className="rounded-xl border border-slate-800 p-4">
              <h3 className="text-sm font-semibold text-white">Latest customer message</h3>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-300">{lead.lastMessage}</p>
            </div>
          )}
          {lead.notes && (
            <div className="rounded-xl border border-slate-800 p-4">
              <h3 className="text-sm font-semibold text-white">Notes</h3>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-300">{lead.notes}</p>
            </div>
          )}
        </div>

        <p className="mt-5 text-xs text-slate-500">Created {lead.createdAt.toLocaleString("en-US")}</p>
      </section>
    </div>
  );
}
