import {
  CheckCircle2,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";

import { DashboardHeader } from "@/components/dashboard/header";
import { MetaWhatsAppConnect } from "@/components/dashboard/meta-whatsapp-connect";
import { WhatsAppDisconnectButton } from "@/components/dashboard/whatsapp-disconnect-button";
import { WhatsAppConnectionNotesModal } from "@/components/dashboard/whatsapp-connection-notes-modal";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/db";
import { getUserSubscriptionPlan } from "@/lib/subscription";

export const dynamic = "force-dynamic";

export default async function WhatsAppIntegrationPage() {
  const user = await getCurrentUser();

  const subscription = user?.id && user.role !== "ADMIN"
    ? await getUserSubscriptionPlan(user.id)
    : null;
  const canUseWhatsApp = user?.role === "ADMIN" || Boolean(subscription?.isPaid);

  const connection = user?.id
    ? await prisma.metaIntegration.findFirst({
        where: { userId: user.id, platform: "WHATSAPP" },
        select: {
          externalAccountName: true,
          phoneNumber: true,
          whatsappBusinessId: true,
        },
      })
    : null;

  return (
    <div className="space-y-6">
      <WhatsAppConnectionNotesModal initialOpen={true} />
      <DashboardHeader
        heading="WhatsApp"
        text="Connect your business WhatsApp to Smart Cleaning Desk and manage customer conversations with AI."
      />

      {!canUseWhatsApp && (
        <section className="rounded-2xl border border-blue-500/30 bg-blue-500/10 p-5">
          <h2 className="text-base font-semibold text-blue-200">
            WhatsApp is available with an active paid subscription
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-300">
            WhatsApp connection is disabled during the free trial and while a subscription is inactive. Your existing connection and saved data are retained.
          </p>
          <a href="/pricing" className="mt-4 inline-flex rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500">
            View plans
          </a>
        </section>
      )}

      <section
        className="rounded-2xl border border-amber-700/40 bg-amber-950/20 p-4 sm:p-5"
        aria-label="WhatsApp Business account information"
      >
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" />
          <div>
            <h2 className="text-sm font-semibold text-amber-200">
              A WhatsApp Business Account Is Required
            </h2>
            <p className="mt-1 text-sm leading-6 text-slate-300">
              Connect the WhatsApp Business number used by your company. If
              your number is eligible, Meta may offer a setup that keeps it
              available in the WhatsApp Business app while connecting it to
              Smart Cleaning Desk.
            </p>
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/70 shadow-xl">
        <div className="border-b border-slate-800 p-6">
          <div className="flex flex-col items-stretch justify-between gap-4 sm:flex-row sm:items-center">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
                <MessageCircle className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <h2 className="text-lg font-semibold text-white">
                  WhatsApp Business
                </h2>
                <p className="mt-1 text-sm leading-6 text-slate-500">
                  Connect your business number to receive customer messages
                  through Smart Cleaning Desk.
                </p>
              </div>
            </div>

            {!canUseWhatsApp ? (
              <div className="rounded-xl border border-slate-700 bg-slate-900 px-5 py-3 text-sm font-semibold text-slate-400">
                Connection locked
              </div>
            ) : connection ? (
              <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
                <div className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-700/40 bg-emerald-950/40 px-5 py-3 text-sm font-semibold text-emerald-400">
                  <CheckCircle2 className="h-4 w-4" />
                  Connected
                </div>
                <WhatsAppDisconnectButton />
              </div>
            ) : (
              <MetaWhatsAppConnect />
            )}
          </div>
        </div>

        <div className="grid gap-4 p-6 sm:grid-cols-3">
          <FeatureCard
            icon={<MessageCircle className="h-4 w-4" />}
            title="AI Replies"
            text="Help handle eligible incoming WhatsApp conversations with your AI employee."
          />
          <FeatureCard
            icon={<Sparkles className="h-4 w-4" />}
            title="Lead Capture"
            text="Keep customer enquiries and service requests connected to your business workflow."
          />
          <FeatureCard
            icon={<Zap className="h-4 w-4" />}
            title="WhatsApp Business App"
            text="Eligible numbers may be able to stay available in the WhatsApp Business app through Meta's supported coexistence flow."
          />
        </div>

        <div className="border-t border-slate-800 bg-slate-900/20 p-6">
          <p className="text-sm text-slate-400">
            {connection
              ? `WhatsApp is connected${connection.phoneNumber ? `: ${connection.phoneNumber}` : connection.externalAccountName ? `: ${connection.externalAccountName}` : " and ready for the Smart Cleaning Desk messaging workflow."}`
              : "You will sign in through Meta and approve the requested business access before returning here."}
          </p>
          {connection?.whatsappBusinessId && (
            <p className="mt-2 break-all text-xs text-slate-500">
              WhatsApp Business ID: {connection.whatsappBusinessId}
            </p>
          )}
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <InfoCard
          icon={<ShieldCheck className="h-5 w-5" />}
          title="Secure Connection"
          text="Meta handles its sign-in and authorization window. Smart Cleaning Desk does not ask for your Meta password."
        />
        <InfoCard
          icon={<CheckCircle2 className="h-5 w-5" />}
          title="Business Messaging"
          text="Connect your WhatsApp Business number to the Smart Cleaning Desk customer messaging workflow."
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
