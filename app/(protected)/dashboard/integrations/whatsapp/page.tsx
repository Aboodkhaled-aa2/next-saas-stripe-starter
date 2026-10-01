import { CheckCircle2, MessageCircle, ShieldCheck, Sparkles, Zap } from "lucide-react";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { DashboardHeader } from "@/components/dashboard/header";

export const dynamic = "force-dynamic";

export default async function WhatsAppIntegrationPage() {
  const session = await auth();
  const workspace = session?.user?.id
    ? await prisma.dmlyWorkspace.findUnique({
        where: { userId: session.user.id },
      })
    : null;

  return (
    <div className="space-y-6">
      <DashboardHeader
        heading="WhatsApp"
        text="Connect WhatsApp messaging through your Smart Cleaning Desk messaging workspace."
      />

      <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/70 shadow-xl">
        <div className="border-b border-slate-800 p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-800 bg-slate-900">
              <MessageCircle className="h-7 w-7 text-slate-200" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg font-semibold text-white">WhatsApp Messaging</h2>
                <span className={workspace ? "rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-medium text-emerald-400" : "rounded-full border border-slate-800 bg-slate-900 px-2.5 py-1 text-[11px] font-medium text-slate-500"}>
                  {workspace ? "Workspace Ready" : "Workspace Not Set Up"}
                </span>
              </div>
              <p className="mt-1 text-sm leading-6 text-slate-500">
                {workspace
                  ? "Your isolated DMly workspace is ready for channel connection."
                  : "Create your isolated messaging workspace first. Channel authorization will be added after the workspace is provisioned."}
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-4 p-6 sm:grid-cols-3">
          <FeatureCard icon={<MessageCircle className="h-4 w-4" />} title="AI Replies" text="Handle eligible customer conversations with your Smart Cleaning Desk AI." />
          <FeatureCard icon={<Sparkles className="h-4 w-4" />} title="Lead Capture" text="Keep customer conversations connected to your business workflow." />
          <FeatureCard icon={<Zap className="h-4 w-4" />} title="Unified Infrastructure" text="Use the same messaging workspace across supported channels." />
        </div>

        <div className="border-t border-slate-800 bg-slate-900/20 p-6">
          {workspace ? (
            <div className="inline-flex h-11 items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-5 text-sm font-semibold text-emerald-400">
              <CheckCircle2 className="h-4 w-4" />
              DMly workspace ready
            </div>
          ) : (
            <p className="text-sm text-slate-400">
              Go to Integrations and provision your messaging workspace first.
            </p>
          )}
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <InfoCard icon={<ShieldCheck className="h-5 w-5" />} title="Isolated Workspace" text="Each Smart Cleaning Desk customer gets a separate messaging workspace." />
        <InfoCard icon={<CheckCircle2 className="h-5 w-5" />} title="Secure Server-Side Connection" text="Provider credentials stay on the server and are never exposed in the browser." />
      </section>
    </div>
  );
}

function FeatureCard({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 text-slate-400">{icon}</div>
      <h3 className="mt-4 text-sm font-semibold text-white">{title}</h3>
      <p className="mt-1 text-sm leading-6 text-slate-500">{text}</p>
    </div>
  );
}

function InfoCard({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-5 shadow-xl">
      <div className="flex items-start gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-800 bg-slate-900 text-slate-400">{icon}</div>
        <div>
          <h3 className="font-medium text-white">{title}</h3>
          <p className="mt-1 text-sm leading-6 text-slate-500">{text}</p>
        </div>
      </div>
    </div>
  );
}
