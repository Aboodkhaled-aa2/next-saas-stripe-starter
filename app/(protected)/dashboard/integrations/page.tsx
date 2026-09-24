import Link from "next/link";
import {
  ArrowRight,
  Facebook,
  Instagram,
  MessageCircle,
  Phone,
  Sparkles,
} from "lucide-react";

import { DashboardHeader } from "@/components/dashboard/header";

const integrations = [
  {
    href: "/dashboard/integrations/instagram",
    title: "Instagram",
    description: "Connect Instagram messaging and let your AI employee handle customer DMs.",
    icon: Instagram,
  },
  {
    href: "/dashboard/integrations/facebook",
    title: "Facebook",
    description: "Connect your Facebook Page and manage customer messages with AI.",
    icon: Facebook,
  },
  {
    href: "/dashboard/integrations/whatsapp",
    title: "WhatsApp",
    description: "Connect WhatsApp Business for automated customer conversations.",
    icon: MessageCircle,
  },
  {
    href: "/dashboard/integrations/phone",
    title: "AI Phone",
    description: "Set up your AI receptionist for incoming business calls.",
    icon: Phone,
    restricted: true,
  },
];

export default function IntegrationsPage() {
  return (
    <div className="space-y-6">
      <DashboardHeader
        heading="Integrations"
        text="Connect the channels your AI employee will use to communicate with customers."
      />

      <section className="rounded-2xl border border-slate-800 bg-slate-950/70 p-6 shadow-xl sm:p-8">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
            <Sparkles className="h-5 w-5" />
          </div>

          <div>
            <h2 className="font-semibold text-white">AI Communication Channels</h2>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              Choose the channels you want to connect. Availability depends on your subscription plan.
            </p>
          </div>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2">
        {integrations.map((integration) => {
          const Icon = integration.icon;

          return (
            <Link
              key={integration.href}
              href={integration.href}
              className="group rounded-2xl border border-slate-800 bg-slate-950/70 p-6 shadow-xl transition-colors hover:border-blue-500/30 hover:bg-slate-900/70"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 text-slate-300">
                  <Icon className="h-5 w-5" />
                </div>

                <ArrowRight className="h-4 w-4 text-slate-600 transition-transform group-hover:translate-x-1 group-hover:text-blue-400" />
              </div>

              <h3 className="mt-5 font-semibold text-white">
                {integration.title}
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                {integration.description}
              </p>

              {integration.restricted && (
                <p className="mt-4 text-xs font-medium text-amber-400">
                  Available on Business and Pro plans
                </p>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
