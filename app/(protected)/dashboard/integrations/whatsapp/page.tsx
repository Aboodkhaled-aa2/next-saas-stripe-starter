import { CheckCircle2, MessageCircle } from "lucide-react";

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

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      <DashboardHeader
        heading="Connect WhatsApp"
        text="Connect the WhatsApp Business number your customers already use."
      />

      <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/70 shadow-xl">
        <div className="space-y-4 p-5 sm:p-7">
          {connection ? (
            <>
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-300">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-base font-semibold text-white">
                    WhatsApp is connected
                  </h2>
                  <p className="mt-1 text-sm text-slate-400">
                    {connection.phoneNumber || connection.externalAccountName || "Your WhatsApp Business account"}
                  </p>
                </div>
                <WhatsAppDisconnectButton />
              </div>
              <div className="border-t border-slate-800 pt-4 text-xs text-slate-500">
                WhatsApp Business Account ID: {connection.whatsappBusinessId || "Connected"}
              </div>
            </>
          ) : (
            <>
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-300">
                  <MessageCircle className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-base font-semibold text-white">
                    Use your existing WhatsApp Business number
                  </h2>
                  <p className="mt-1 text-sm leading-6 text-slate-400">
                    Enter your current business number below. We will prefill it in Meta where supported, then securely ask Meta to authorize the connection.
                  </p>
                </div>
              </div>

              <div className="border-t border-slate-800 pt-5">
                <MetaWhatsAppConnect />
              </div>

              <p className="text-xs leading-5 text-slate-500">
                Meta may still require sign-in, permission approval, and business confirmation. Those hosted Meta screens cannot be removed by Smart Cleaning Desk.
              </p>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
