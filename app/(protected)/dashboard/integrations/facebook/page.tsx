import {
  CheckCircle2,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";

import { DashboardHeader } from "@/components/dashboard/header";
import { FacebookConnect } from "@/components/dashboard/facebook-connect";

export const dynamic = "force-dynamic";

export default async function FacebookIntegrationPage() {
  return (
    <div className="space-y-6">
      <DashboardHeader
        heading="Facebook"
        text="Connect your Facebook Page to Smart Cleaning Desk."
      />

      <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/70 shadow-xl">
        <div className="border-b border-slate-800 p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-white">
                Facebook Page
              </h2>

              <p className="mt-1 text-sm leading-6 text-slate-500">
                Connect your Facebook Page to receive and manage customer
                messages through Smart Cleaning Desk.
              </p>
            </div>

            <FacebookConnect />
          </div>
        </div>

        <div className="grid gap-4 p-6 sm:grid-cols-3">
          <FeatureCard
            icon={<MessageCircle className="h-4 w-4" />}
            title="AI Replies"
            text="Handle eligible customer conversations with your Smart Cleaning Desk AI."
          />

          <FeatureCard
            icon={<Sparkles className="h-4 w-4" />}
            title="Lead Capture"
            text="Keep customer conversations connected to your business workflow."
          />

          <FeatureCard
            icon={<Zap className="h-4 w-4" />}
            title="Unified Infrastructure"
            text="Use the same messaging workspace across supported channels."
          />
        </div>

        <div className="border-t border-slate-800 bg-slate-900/20 p-6">
          <p className="text-sm text-slate-400">
            You will choose the Facebook Page you want to connect after
            signing in with Meta.
          </p>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <InfoCard
          icon={<ShieldCheck className="h-5 w-5" />}
          title="Secure Connection"
          text="Facebook credentials are handled server-side and are not exposed in the browser."
        />

        <InfoCard
          icon={<CheckCircle2 className="h-5 w-5" />}
          title="Business Messaging"
          text="Connect your customer's Facebook Page to the Smart Cleaning Desk messaging workflow."
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

          <p className="mt-1 text-sm leading-6 text-slate-500">
            {text}
          </p>
        </div>
      </div>
    </div>
  );
}
