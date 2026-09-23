import {
  CheckCircle2,
  Facebook,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";

import { DashboardHeader } from "@/components/dashboard/header";

export const dynamic = "force-dynamic";

export default function FacebookIntegrationPage() {
  return (
    <div className="space-y-6">
      <DashboardHeader
        heading="Facebook"
        text="Connect your Facebook Page so your AI employee can respond to customer messages and capture new leads."
      />

      <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/70 shadow-xl">
        <div className="border-b border-slate-800 p-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-blue-500/20 bg-blue-500/10">
              <Facebook className="h-7 w-7 text-blue-400" />
            </div>

            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg font-semibold text-white">
                  Facebook Messaging
                </h2>

                <span className="rounded-full border border-slate-800 bg-slate-900 px-2.5 py-1 text-[11px] font-medium text-slate-500">
                  Not connected
                </span>
              </div>

              <p className="mt-1 text-sm leading-6 text-slate-500">
                Let your AI employee answer Facebook Page messages, qualify
                leads, provide service information, and help customers book.
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-4 p-6 sm:grid-cols-2 lg:grid-cols-3">
          <FeatureCard
            icon={<MessageCircle className="h-4 w-4" />}
            title="AI Replies"
            text="Respond to Facebook customer messages automatically."
          />

          <FeatureCard
            icon={<Sparkles className="h-4 w-4" />}
            title="Lead Capture"
            text="Collect customer details and understand their cleaning needs."
          />

          <FeatureCard
            icon={<Zap className="h-4 w-4" />}
            title="24/7 Response"
            text="Keep responding to customers even when your team is offline."
          />
        </div>

        <div className="border-t border-slate-800 bg-slate-900/20 p-6">
          <button
            type="button"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 text-sm font-semibold text-white transition-colors hover:bg-blue-500"
          >
            <Facebook className="h-4 w-4" />
            Connect Facebook
          </button>

          <p className="mt-3 text-xs leading-5 text-slate-600">
            Facebook connection will be completed through Meta&apos;s secure
            authorization flow.
          </p>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <InfoCard
          icon={<ShieldCheck className="h-5 w-5" />}
          title="Secure Connection"
          text="Your Facebook Page will use Meta's authorization system. Your password is never shared with Smart Cleaning Desk."
        />

        <InfoCard
          icon={<CheckCircle2 className="h-5 w-5" />}
          title="What Happens After Connecting"
          text="Your AI employee can handle eligible Facebook conversations according to your business profile and AI instructions."
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
