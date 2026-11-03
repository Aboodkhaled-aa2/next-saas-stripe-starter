"use client";

import { useState } from "react";
import { Check, Copy, Phone } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const DEMO_NUMBER = "+1 201-277-0096";

export function TrialDemoPhoneCard() {
  const [copied, setCopied] = useState(false);

  async function copyNumber() {
    try {
      await navigator.clipboard.writeText(DEMO_NUMBER);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("Copy the demo phone number:", DEMO_NUMBER);
    }
  }

  return (
    <div className="space-y-4">
      <Card className="border-violet-500/30 bg-gradient-to-br from-violet-950/40 via-slate-950 to-slate-950 text-white">
        <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-violet-300">Test AI Receptionist</p>
            <p className="mt-1 text-sm text-slate-400">
              Call our shared demo number to experience the AI receptionist during your 7-day free trial.
            </p>
            <p className="mt-3 text-2xl font-bold tracking-wide">{DEMO_NUMBER}</p>
            <p className="mt-2 text-xs leading-5 text-slate-500">
              This is a shared demo number for testing. It is not your company&apos;s assigned business number.
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-3">
            <a
              href="tel:+12012770096"
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-violet-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-violet-500"
            >
              <Phone className="h-4 w-4" />
              Call Demo
            </a>
            <button
              type="button"
              onClick={copyNumber}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-700 bg-slate-900 px-4 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? "Copied" : "Copy Number"}
            </button>
          </div>
        </CardContent>
      </Card>

      <section className="rounded-2xl border border-slate-800 bg-slate-950/70 p-5 sm:p-6">
        <h3 className="text-base font-semibold text-white">
          What happens to your business phone number after you subscribe?
        </h3>
        <p className="mt-2 text-sm leading-6 text-slate-400">
          With a plan that includes AI Phone, you can choose the setup that works best for your cleaning business:
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
            <p className="text-sm font-semibold text-white">Get a new business number</p>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              Get a dedicated phone number for your AI receptionist and use it as your business call number.
            </p>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
            <p className="text-sm font-semibold text-white">Keep your existing number</p>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              Keep your current business number and, where your phone provider supports it, forward calls to your AI receptionist.
            </p>
          </div>
        </div>

        <p className="mt-4 text-xs leading-5 text-slate-500">
          You do not have to give up your existing business number. We will guide you through the setup after subscription. Number availability and call-forwarding options depend on your provider and location.
        </p>
      </section>
    </div>
  );
}
