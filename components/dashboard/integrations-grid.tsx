"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Facebook,
  Instagram,
  MessageCircle,
  Phone,
  Sparkles,
  X,
  CheckCircle2,
  Building2,
  Smartphone,
  ExternalLink,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

type Integration = {
  href: string;
  title: string;
  description: string;
  icon: LucideIcon;
  restricted?: boolean;
  notesFirst?: boolean;
};

const integrations: Integration[] = [
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
    notesFirst: true,
  },
  {
    href: "/dashboard/integrations/phone",
    title: "AI Phone",
    description: "Set up your AI receptionist for incoming business calls.",
    icon: Phone,
    restricted: true,
  },
];

const cardClassName =
  "group w-full rounded-2xl border border-slate-800 bg-slate-950/70 p-6 text-left shadow-xl transition-colors hover:border-blue-500/30 hover:bg-slate-900/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500";

export function IntegrationsGrid() {
  const [whatsAppNotesOpen, setWhatsAppNotesOpen] = useState(false);

  useEffect(() => {
    if (!whatsAppNotesOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setWhatsAppNotesOpen(false);
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [whatsAppNotesOpen]);

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        {integrations.map((integration) => {
          const Icon = integration.icon;
          const content = (
            <>
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
            </>
          );

          return integration.notesFirst ? (
            <button
              key={integration.href}
              type="button"
              onClick={() => setWhatsAppNotesOpen(true)}
              aria-haspopup="dialog"
              aria-expanded={whatsAppNotesOpen}
              className={cardClassName}
            >
              {content}
            </button>
          ) : (
            <Link
              key={integration.href}
              href={integration.href}
              className={cardClassName}
            >
              {content}
            </Link>
          );
        })}
      </div>

      {whatsAppNotesOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/75 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setWhatsAppNotesOpen(false);
            }
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="whatsapp-connection-notes-title"
            className="relative my-auto w-full max-w-xl rounded-2xl border border-slate-700 bg-slate-950 p-5 shadow-2xl sm:p-7"
          >
            <button
              type="button"
              aria-label="Close WhatsApp connection notes"
              onClick={() => setWhatsAppNotesOpen(false)}
              className="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-700 text-slate-300 transition-colors hover:bg-slate-800 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex items-start gap-4 pr-10">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
                <MessageCircle className="h-6 w-6" />
              </div>
              <div>
                <h2
                  id="whatsapp-connection-notes-title"
                  className="text-xl font-semibold text-white sm:text-2xl"
                >
                  WhatsApp connection notes
                </h2>
                <p className="mt-1 text-sm leading-6 text-slate-400">
                  A few things to know before continuing to the WhatsApp setup.
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <Note
                icon={ExternalLink}
                title="Sign in to Meta"
                description="Use the Facebook account that manages your company’s business assets."
              />
              <Note
                icon={Building2}
                title="Choose your business"
                description="If asked, select your company’s Business Portfolio. Create one only if your company does not already have one."
              />
              <Note
                icon={Smartphone}
                title="Have your number ready"
                description="Use the WhatsApp Business number you want to connect. Meta may ask you to verify it."
              />
              <Note
                icon={CheckCircle2}
                title="Finish the setup"
                description="Follow Meta’s on-screen steps. When the connection flow is complete, return to Smart Cleaning Desk."
              />
            </div>

            <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setWhatsAppNotesOpen(false)}
                className="inline-flex h-11 items-center justify-center rounded-lg border border-slate-700 px-5 text-sm font-semibold text-slate-200 transition-colors hover:bg-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                Close
              </button>
              <Link
                href="/dashboard/integrations/whatsapp"
                onClick={() => setWhatsAppNotesOpen(false)}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-emerald-600 px-5 text-sm font-semibold text-white transition-colors hover:bg-emerald-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
              >
                Continue to WhatsApp
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </section>
        </div>
      )}
    </>
  );
}

function Note({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-emerald-400">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <h3 className="text-sm font-semibold text-slate-100">{title}</h3>
        <p className="mt-1 text-sm leading-6 text-slate-400">{description}</p>
      </div>
    </div>
  );
}
