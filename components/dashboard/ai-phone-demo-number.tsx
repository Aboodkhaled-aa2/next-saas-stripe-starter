"use client";

import { useState } from "react";
import { Check, Copy, PhoneCall } from "lucide-react";

const DEMO_PHONE_NUMBER = "+1 (201) 277-0096";
const DEMO_TEL_URI = "+12012770096";

export function AIPhoneDemoNumber() {
  const [copied, setCopied] = useState(false);

  async function copyNumber() {
    try {
      await navigator.clipboard.writeText(DEMO_TEL_URI);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <section className="rounded-2xl border border-violet-500/25 bg-violet-500/5 p-6 shadow-xl sm:p-8">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500/10 text-violet-300">
              <PhoneCall className="h-4 w-4" />
            </span>
            <p className="text-sm font-semibold text-violet-300">Try AI Phone</p>
          </div>
          <h2 className="mt-3 text-xl font-semibold text-white">Call our AI receptionist demo</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
            Call the demo number from your phone to experience a live AI receptionist conversation.
          </p>
          <p className="mt-4 text-2xl font-bold tracking-wide text-white">{DEMO_PHONE_NUMBER}</p>
          <p className="mt-2 text-xs leading-5 text-slate-500">
            Shared demo line. Your call may be handled by the same AI demo as other visitors.
          </p>
        </div>
        <div className="flex shrink-0 flex-col gap-3 sm:min-w-44">
          <a
            href={`tel:${DEMO_TEL_URI}`}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-violet-600 px-5 text-sm font-semibold text-white transition-colors hover:bg-violet-500"
          >
            <PhoneCall className="h-4 w-4" />
            Call Now
          </a>
          <button
            type="button"
            onClick={copyNumber}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-slate-700 bg-slate-900 px-5 text-sm font-semibold text-slate-200 transition-colors hover:border-slate-600 hover:bg-slate-800"
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? "Copied" : "Copy Number"}
          </button>
        </div>
      </div>
    </section>
  );
}
