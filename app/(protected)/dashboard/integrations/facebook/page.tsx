import { CheckCircle2, Facebook, MessageCircle, ShieldCheck, Sparkles, Zap } from "lucide-react";

import { DashboardHeader } from "@/components/dashboard/header";

export const dynamic = "force-dynamic";

export default async function FacebookIntegrationPage() {
  return (
    <div className="space-y-6">
      <DashboardHeader
        heading="Facebook"
        text="Connect this channel through your Smart Cleaning Desk messaging provider."
      />

      <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/70 shadow-xl">
        <div className="border-b border-slate-800 p-6">
          <div>
            <h2 className="text-lg font-semibold text-white">Channel Messaging</h2>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              Connect this channel through your configured messaging provider.
            </p>
          </div>
        </div>

        <div className="grid gap-4 p-6 sm:grid-cols-3">
          <FeatureCard icon={<MessageCircle className="h-4 w-4" />} title="AI Replies" text="Handle eligible customer conversations with your Smart Cleaning Desk AI." />
          <FeatureCard icon={<Sparkles className="h-4 w-4" />} title="Lead Capture" text="Keep customer conversations connected to your business workflow." />
          <FeatureCard icon={<Zap className="h-4 w-4" />} title="Unified Infrastructure" text="Use the same messaging workspace across supported channels." />
        </div>

        <div className="border-t border-slate-800 bg-slate-900/20 p-6">
          <p className="text-sm text-slate-400">
            Provider connection will be available after the new messaging provider is configured.
          </p>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <InfoCard icon={<ShieldCheck className="h-5 w-5" />} title="Messaging Infrastructure" text="Your connected messaging channels will be managed through Smart Cleaning Desk." />
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
