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
    <Card className="border-violet-500/30 bg-gradient-to-br from-violet-950/40 via-slate-950 to-slate-950 text-white">
      <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-violet-300">Test AI Receptionist</p>
          <p className="mt-1 text-sm text-slate-400">
            Call our shared demo number to experience the AI receptionist during your 7-day free trial.
          </p>
          <p className="mt-3 text-2xl font-bold tracking-wide">{DEMO_NUMBER}</p>
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
  );
}
