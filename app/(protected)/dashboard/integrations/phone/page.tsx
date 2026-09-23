import {
  Bot,
  CheckCircle2,
  Clock3,
  Phone,
  PhoneCall,
  ShieldCheck,
  Sparkles,
  UserRound,
  Zap,
} from "lucide-react";

import { DashboardHeader } from "@/components/dashboard/header";

export const dynamic = "force-dynamic";

export default function PhoneIntegrationPage() {
  return (
    <div className="space-y-6">
      <DashboardHeader
        heading="AI Phone"
        text="Give your cleaning business an AI receptionist that answers calls, qualifies customers, and helps book appointments."
      />

      <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/70 shadow-xl">
        <div className="border-b border-slate-800 p-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-blue-500/20 bg-blue-500/10">
              <Phone className="h-7 w-7 text-blue-400" />
            </div>

            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg font-semibold text-white">
                  AI Voice Receptionist
                </h2>

                <span className="rounded-full border border-slate-800 bg-slate-900 px-2.5 py-1 text-[11px] font-medium text-slate-500">
                  Not connected
                </span>
              </div>

              <p className="mt-1 text-sm leading-6 text-slate-500">
                Let your AI employee answer incoming calls, understand what
                customers need, provide quotes, and help schedule appointments.
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-4 p-6 sm:grid-cols-2 lg:grid-cols-3">
          <FeatureCard
            icon={<PhoneCall className="h-4 w-4" />}
            title="Answer Every Call"
            text="Your AI receptionist can answer calls while your team is working."
          />

          <FeatureCard
            icon={<Bot className="h-4 w-4" />}
            title="AI Conversations"
            text="Have natural conversations based on your business information and rules."
          />

          <FeatureCard
            icon={<Sparkles className="h-4 w-4" />}
            title="Lead Qualification"
            text="Collect customer details and understand their cleaning needs."
          />

          <FeatureCard
            icon={<Clock3 className="h-4 w-4" />}
            title="24/7 Availability"
            text="Keep your phone line available outside normal business hours."
          />

          <FeatureCard
            icon={<Zap className="h-4 w-4" />}
            title="Appointment Booking"
            text="Help customers find available times and request appointments."
          />

          <FeatureCard
            icon={<UserRound className="h-4 w-4" />}
            title="Human Handoff"
            text="Escalate conversations to your team when human help is needed."
          />
        </div>

        <div className="border-t border-slate-800 bg-slate-900/20 p-6">
          <button
            type="button"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 text-sm font-semibold text-white transition-colors hover:bg-blue-500"
          >
            <Phone className="h-4 w-4" />
            Set Up AI Phone
          </button>

          <p className="mt-3 text-xs leading-5 text-slate-600">
            Phone setup will connect your business number to the AI voice
            system and configure your receptionist behavior.
          </p>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <InfoCard
          icon={<ShieldCheck className="h-5 w-5" />}
          title="Business-Aware AI"
          text="Your AI receptionist can use your services, pricing, business hours, service areas, policies, and custom AI instructions."
        />

        <InfoCard
          icon={<CheckCircle2 className="h-5 w-5" />}
          title="Built for Cleaning Businesses"
          text="The voice experience is designed around cleaning inquiries, quotes, lead qualification, and appointment requests."
        />
      </section>

      <section className="rounded-2xl border border-slate-800 bg-slate-950/70 p-6 shadow-xl">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-800 bg-slate-900 text-blue-400">
            <Phone className="h-5 w-5" />
          </div>

          <div>
            <h3 className="font-semibold text-white">
              Your AI Employee on the Phone
            </h3>

            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
              Once configured, customers can call your business and speak with
              your AI receptionist. The AI can answer common questions, collect
              lead information, explain services, provide approved pricing
              information, and guide customers toward booking.
            </p>
          </div>
        </div>
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
