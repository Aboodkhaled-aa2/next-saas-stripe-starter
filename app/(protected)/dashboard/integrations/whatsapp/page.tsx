import { CheckCircle2, MessageCircle, ShieldCheck } from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/header";
import { MetaWhatsAppConnect } from "@/components/dashboard/meta-whatsapp-connect";
import { WhatsAppDisconnectButton } from "@/components/dashboard/whatsapp-disconnect-button";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function WhatsAppIntegrationPage() {
  const user = await getCurrentUser();
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

  const businessProfile = user?.id
    ? await prisma.businessProfile.findUnique({
        where: { userId: user.id },
        select: {
          businessName: true,
          businessEmail: true,
          websiteUrl: true,
        },
      })
    : null;

  return (
    <div className="space-y-6">
      <DashboardHeader
        heading="WhatsApp"
        text="Enter your existing WhatsApp Business number first, then continue through Meta's secure connection flow."
      />

      <section className="mx-auto w-full max-w-3xl overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/80 shadow-xl">
        <div className="flex items-start gap-4 border-b border-slate-800 p-5 sm:p-7">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-400">
            <MessageCircle className="h-6 w-6" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-semibold text-white">
              WhatsApp Business
            </h2>
            <p className="mt-1 text-sm leading-6 text-slate-400">
              Start with the number your company already uses in WhatsApp Business.
              Meta will confirm eligibility and may ask you to approve the
              connection on your phone. Required Meta consent and business
              verification screens cannot be skipped by Smart Cleaning Desk.
            </p>
          </div>
        </div>

        <div className="space-y-4 p-5 sm:p-7">
          {connection ? (
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" />
                <div className="min-w-0">
                  <p className="font-medium text-emerald-300">
                    WhatsApp connected
                  </p>
                  <p className="mt-1 break-words text-sm text-slate-400">
                    {connection.phoneNumber || connection.externalAccountName || "Your WhatsApp Business account is connected."}
                  </p>
                </div>
              </div>
              <WhatsAppDisconnectButton />
            </div>
          ) : (
            <>
              <div className="flex items-start gap-3 rounded-xl border border-slate-800 bg-slate-900/40 p-4">
                <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-slate-400" />
                <p className="text-sm leading-6 text-slate-400">
                  Meta will open its secure authorization window so you can
                  sign in and approve access to your business account. Smart
                  Cleaning Desk never asks for your Meta password.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <MetaWhatsAppConnect
                  initialBusinessName={businessProfile?.businessName ?? ""}
                  initialBusinessEmail={businessProfile?.businessEmail ?? ""}
                  initialWebsiteUrl={businessProfile?.websiteUrl ?? ""}
                />
                <p className="text-xs leading-5 text-slate-500">
                  You will return here after completing Meta's required steps.
                </p>
              </div>
            </>
          )}
        </div>

        {connection?.whatsappBusinessId && (
          <div className="border-t border-slate-800 px-5 py-3 text-xs text-slate-500 sm:px-7">
            WhatsApp Business ID: {connection.whatsappBusinessId}
          </div>
        )}
      </section>
    </div>
  );
}
