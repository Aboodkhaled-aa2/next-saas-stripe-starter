"use client";

import { useEffect, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  Building2,
  CheckCircle2,
  ExternalLink,
  Smartphone,
  X,
} from "lucide-react";

export function WhatsAppConnectionNotesModal({
  initialOpen,
}: {
  initialOpen: boolean;
}) {
  const [open, setOpen] = useState(initialOpen);

  const closeNotes = () => setOpen(false);

  useEffect(() => {
    setOpen(initialOpen);
  }, [initialOpen]);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeNotes();
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/75 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) closeNotes();
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
          onClick={closeNotes}
          className="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-700 text-slate-300 transition-colors hover:bg-slate-800 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-start gap-4 pr-10">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
            <ExternalLink className="h-6 w-6" />
          </div>
          <div>
            <h2
              id="whatsapp-connection-notes-title"
              className="text-xl font-semibold text-white sm:text-2xl"
            >
              WhatsApp connection notes
            </h2>
            <p className="mt-1 text-sm leading-6 text-slate-400">
              A few notes to help you complete the setup.
            </p>
          </div>
        </div>

        <div className="mt-6 space-y-5">
          <Note
            icon={ExternalLink}
            title="Sign in to Meta"
            description="Use the Facebook account that manages your company’s business assets."
          />
          <Note
            icon={Building2}
            title="Choose your business"
            description="If asked, select your company’s existing Business Portfolio. Create one only if your company does not already have one."
          />
          <Note
            icon={Smartphone}
            title="Have your number ready"
            description="Use the WhatsApp Business number you want to connect. Meta may ask you to verify it."
          />
          <Note
            icon={CheckCircle2}
            title="Finish the setup"
            description="Follow Meta’s on-screen steps. When finished, return to Smart Cleaning Desk."
          />
        </div>
      </section>
    </div>
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
