import {
  CheckCircle2,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  Smartphone,
  Zap,
} from "lucide-react";

import { DashboardHeader } from "@/components/dashboard/header";

export const dynamic = "force-dynamic";

export default function WhatsAppIntegrationPage() {
  return (
    <div className="space-y-6">
      <DashboardHeader
        heading="WhatsApp"
        text="Connect your WhatsApp Business account so your AI employee can respond to customers and capture new leads."
      />

      <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/70 shadow-xl">
        <div className="border-b border-slate-800 p-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-emerald-500/20 bg-emerald-500/10">
              <MessageCircle className="h-7 w-7 text-emerald-400" />
            </div>

            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg font-semibold text-white">
                  WhatsApp Business
                </h2>

                <span className="rounded-full border border-slate-800 bg-slate-900 px-2.5 py-1 text-[11px] font-medium text-slate-500">
                  Not connected
                </span>
              </div>

              <p className="mt-1 text-sm leading-6 text-slate-500">
                Let your AI employee handle WhatsApp conversations, answer
                questions, qualify leads, and help customers book services.
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-4 p-6 sm:grid-cols-2 lg:grid-cols-3">
          <FeatureCard
            icon={<MessageCircle className="h-4 w-4" />}
            title="AI Conversations"
            text="Respond to WhatsApp customer messages automatically."
          />

          <FeatureCard
            icon={<Sparkles className="h-4 w-4" />}
            title="Lead Capture"
            text="Collect customer details and understand their service needs."
          />

          <FeatureCard
            icon={<Zap className="h-4 w-4" />}
            title="Automated Follow-Ups"
            text="Follow up with leads and customers without manual work."
          />
        </div>

        <div className="border-t border-slate-800 bg-slate-900/20 p-6">
          <button
            type="button"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-emerald-600 px-5 text-sm font-semibold text-white transition-colors hover:bg-emerald-500"
          >
            <MessageCircle className="h-4 w-4" />
            Connect WhatsApp
          </button>

          <p className="mt-3 text-xs leading-5 text-slate-600">
            WhatsApp Business connection will use Meta&apos;s secure
            authorization and messaging infrastructure.
          </p>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <InfoCard
          icon={<ShieldCheck className="h-5 w-5" />}
          title="Secure Connection"
          text="Your WhatsApp Business account will be connected through the official Meta infrastructure."
        />

        <InfoCard
          icon={<Smartphone className="h-5 w-5" />}
          title="Built for Business"
          text="Your AI employee can use your business profile, pricing, hours, and booking rules when responding to customers."
        />

        <InfoCard
          icon={<CheckCircle2 className="h-5 w-5" />}
          title="Automated Customer Support"
          text="Once connected, eligible WhatsApp conversations can be handled automatically according to your AI instructions."
        />

        <InfoCard
          icon={<Zap className="h-5 w-5" />}
          title="24/7 Availability"
          text="Keep responding to customer requests even when your cleaning team is busy or offline."
        />
      </section>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 text-slate-400">
        {icon}
      </div>

      <h3 className="mt-4 text-sm font-semibold text-white">{title}</h3>

      <p className="mt-1 text-sm leading-6 text-slate-500">{text}</p>
    </div>
  );
}

function InfoCard({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-5 shadow-xl">
      <div className="flex items-start gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-800 bg-slate-900 text-slate-400">
          {icon}
        </div>

        <div>
          <h3 className="font-medium text-white">{title}</h3>

          <p className="mt-1 text-sm leading-6 text-slate-500">{text}</p>
        </div>
      </div>
    </div>
  );
}
