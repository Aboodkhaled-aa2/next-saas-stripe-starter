import Link from "next/link";
import {
  ArrowRight,
  Bot,
  CheckCircle2,
  CircleAlert,
  MessageSquare,
  Phone,
  Settings2,
  Sparkles,
  UserRound,
} from "lucide-react";

import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/db";
import { getUserSubscriptionPlan } from "@/lib/subscription";
import { constructMetadata } from "@/lib/utils";
import { DashboardHeader } from "@/components/dashboard/header";

export const metadata = constructMetadata({
  title: "AI Employee – Smart Cleaning Desk",
  description: "Configure and manage your AI employee.",
});

export default async function AIEmployeePage() {
  const user = await getCurrentUser();

  if (!user?.id) {
    return null;
  }

  const [businessProfile, subscriptionPlan] = await Promise.all([
    prisma.businessProfile.findUnique({
      where: {
        userId: user.id,
      },
    }),
    getUserSubscriptionPlan(user.id),
  ]);

  const isConfigured = Boolean(
    businessProfile?.onboardingCompleted &&
      businessProfile.businessName &&
      businessProfile.services &&
      businessProfile.pricing,
  );

  const hasVoice =
    subscriptionPlan.title === "Business" ||
    subscriptionPlan.title === "Pro";

  const planLabel = subscriptionPlan.title;

  return (
    <div className="space-y-6">
      <DashboardHeader
        heading="AI Employee"
        text="Your AI employee is ready to handle customer conversations, qualify leads, and help book cleaning jobs."
      >
        <Link
          href="/onboarding"
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-blue-500"
        >
          <Settings2 className="h-4 w-4" />
          Configure AI
        </Link>
      </DashboardHeader>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_0.6fr]">
        <section className="rounded-2xl border border-slate-800 bg-slate-950/70 p-6 shadow-xl sm:p-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-blue-500/20 bg-blue-500/10">
                <Bot className="h-7 w-7 text-blue-400" />
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-xl font-semibold text-white">
                    AI Employee
                  </h2>

                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
                      isConfigured
                        ? "bg-emerald-500/10 text-emerald-400"
                        : "bg-amber-500/10 text-amber-400"
                    }`}
                  >
                    {isConfigured ? (
                      <CheckCircle2 className="h-3.5 w-3.5" />
                    ) : (
                      <CircleAlert className="h-3.5 w-3.5" />
                    )}

                    {isConfigured ? "Ready" : "Setup required"}
                  </span>
                </div>

                <p className="mt-2 max-w-xl text-sm leading-6 text-slate-400">
                  {isConfigured
                    ? `Your AI employee is configured for ${businessProfile.businessName}.`
                    : "Complete your business setup so your AI employee knows your services, pricing, policies, and communication preferences."}
                </p>
              </div>
            </div>

            <div className="shrink-0 rounded-xl border border-slate-800 bg-slate-900/50 px-4 py-3">
              <p className="text-xs text-slate-500">Current plan</p>
              <p className="mt-1 text-sm font-semibold text-white">
                {planLabel}
              </p>
            </div>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            <Capability
              icon={<MessageSquare className="h-4 w-4" />}
              title="Customer Messaging"
              description="Handle customer conversations across connected messaging channels."
              enabled
            />

            <Capability
              icon={<Phone className="h-4 w-4" />}
              title="AI Voice"
              description={
                hasVoice
                  ? "Voice AI is available on your current plan."
                  : "Upgrade to Business to enable AI voice conversations."
              }
              enabled={hasVoice}
            />

            <Capability
              icon={<Sparkles className="h-4 w-4" />}
              title="Lead Qualification"
              description="Collect customer details and understand what they need."
              enabled
            />

            <Capability
              icon={<CheckCircle2 className="h-4 w-4" />}
              title="Booking Assistance"
              description={
                hasVoice
                  ? "Booking workflows are available on your current plan."
                  : "Available starting with the Business plan."
              }
              enabled={hasVoice}
            />
          </div>
        </section>

        <section className="rounded-2xl border border-slate-800 bg-slate-950/70 p-6 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-slate-300">
              <UserRound className="h-5 w-5" />
            </div>

            <div>
              <h2 className="font-semibold text-white">Business Profile</h2>
              <p className="text-xs text-slate-500">
                Information used by your AI
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <InfoRow
              label="Business"
              value={businessProfile?.businessName || "Not configured"}
            />

            <InfoRow
              label="Services"
              value={
                Array.isArray(businessProfile?.services)
                  ? `${businessProfile.services.length} configured`
                  : "Not configured"
              }
            />

            <InfoRow
              label="Pricing"
              value={businessProfile?.pricing ? "Configured" : "Not configured"}
            />

            <InfoRow
              label="AI tone"
              value={businessProfile?.aiTone || "Professional and friendly"}
            />
          </div>

          <Link
            href="/onboarding"
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-slate-800 bg-slate-900/60 px-4 py-2.5 text-sm font-medium text-slate-300 transition-colors hover:border-slate-700 hover:bg-slate-800 hover:text-white"
          >
            Edit Business Profile
            <ArrowRight className="h-4 w-4" />
          </Link>
        </section>
      </div>

      <section className="rounded-2xl border border-slate-800 bg-slate-950/70 p-6 shadow-xl sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">
              AI Instructions
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Rules and context your AI employee uses when speaking with
              customers.
            </p>
          </div>

          <Link
            href="/onboarding"
            className="inline-flex items-center gap-2 text-sm font-medium text-blue-400 transition-colors hover:text-blue-300"
          >
            Edit instructions
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-5 space-y-4">
          <InstructionBlock
            label="AI Instructions"
            value={businessProfile?.aiInstructions}
          />

          <InstructionBlock
            label="Human Handoff"
            value={businessProfile?.humanHandoffInstructions}
          />

          <InstructionBlock
            label="Additional Notes"
            value={businessProfile?.additionalNotes}
          />
        </div>
      </section>
    </div>
  );
}

function Capability({
  icon,
  title,
  description,
  enabled,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  enabled: boolean;
}) {
  return (
    <div
      className={`rounded-xl border p-4 ${
        enabled
          ? "border-slate-800 bg-slate-900/40"
          : "border-slate-900 bg-slate-950/40"
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
            enabled
              ? "bg-blue-500/10 text-blue-400"
              : "bg-slate-900 text-slate-600"
          }`}
        >
          {icon}
        </div>

        <div>
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-white">{title}</p>

            <span
              className={`h-1.5 w-1.5 rounded-full ${
                enabled ? "bg-emerald-400" : "bg-slate-700"
              }`}
            />
          </div>

          <p className="mt-1 text-xs leading-5 text-slate-500">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-slate-800/70 pb-3 last:border-0 last:pb-0">
      <span className="text-sm text-slate-500">{label}</span>
      <span className="max-w-[60%] truncate text-right text-sm font-medium text-slate-200">
        {value}
      </span>
    </div>
  );
}

function InstructionBlock({
  label,
  value,
}: {
  label: string;
  value?: string | null;
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/30 p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </p>

      <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-300">
        {value?.trim() || "No instructions added yet."}
      </p>
    </div>
  );
}
