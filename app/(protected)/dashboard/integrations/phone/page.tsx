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

import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";

import { DashboardHeader } from "@/components/dashboard/header";
import PhoneNumberPage from "../../phone/page";

export const dynamic = "force-dynamic";

export default async function PhoneIntegrationPage() {
  const user = await getCurrentUser();

  if (user?.role !== "ADMIN") {
    redirect("/dashboard");
  }

  return (
    <div className="space-y-6">
      <DashboardHeader
        heading="AI Phone"
        text="Give your cleaning business an AI receptionist that answers calls, qualifies customers, and helps book appointments."
      />

      <PhoneNumberPage />

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
