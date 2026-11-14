"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, AlertTriangle, CheckCircle2, Loader2, Phone, PhoneCall } from "lucide-react";

export default function AIPhoneActivationPage() {
  const [existingNumber, setExistingNumber] = useState("");
  const [active, setActive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    fetch("/api/ai-phone")
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Unable to load AI Phone.");
        if (!cancelled) {
          setExistingNumber(data.aiPhoneSettings?.phoneNumber || "");
          setActive(data.aiPhoneSettings?.status === "ACTIVE" && data.aiPhoneSettings?.enabled === true);
        }
      })
      .catch((reason) => {
        if (!cancelled) setError(reason instanceof Error ? reason.message : "Unable to load AI Phone.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  async function activate(action: "get-new-number" | "connect-existing") {
    setWorking(true);
    setError("");
    setMessage("");
    try {
      const response = await fetch("/api/ai-phone/activate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await response.json();
      if (!response.ok && response.status !== 202) throw new Error(data.error || "Unable to activate AI Phone.");
      if (data.status === "PENDING") {
        setMessage(data.message || "Setup is pending. Retry to continue without purchasing another number.");
      } else if (data.success) {
        setExistingNumber(data.phoneNumber || "");
        setActive(true);
        setMessage(data.message || "AI Phone is active.");
      } else {
        throw new Error(data.error || "Activation is not complete.");
      }
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to activate AI Phone.");
    } finally {
      setWorking(false);
    }
  }

  return (
    <main className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/ai" className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-800 bg-slate-950 text-slate-400 hover:text-white" aria-label="Back to AI Employee">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <p className="text-sm text-slate-500">AI Employee / AI Phone</p>
          <h1 className="text-2xl font-semibold text-white">Activate AI Phone</h1>
        </div>
      </div>

      <section className="rounded-2xl border border-slate-800 bg-slate-950/70 p-6 sm:p-8">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400"><Phone className="h-5 w-5" /></div>
          <div>
            <h2 className="font-semibold text-white">Set up your AI receptionist</h2>
            <p className="text-sm text-slate-400">Choose how you want to connect your business phone.</p>
          </div>
        </div>

        <div className="mt-6 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" />
            <p className="text-sm leading-6 text-amber-200">Important: Make sure your Business Profile is accurate and complete, including services, service areas, business hours, pricing, and booking rules, before activation.</p>
          </div>
          <Link href="/onboarding" className="mt-3 inline-flex text-sm font-semibold text-amber-300 underline underline-offset-4">Review Business Profile</Link>
        </div>

        <div className="mt-6 rounded-xl border border-slate-800 bg-slate-900/40 p-4">
          <p className="text-sm font-semibold text-white">1. Choose your number</p>
          <p className="mt-1 text-sm text-slate-400">Select one of the two activation methods.</p>
        </div>

        <div className="mt-4 space-y-3">
          <button onClick={() => activate("get-new-number")} disabled={loading || working || active} className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-50">
            {working ? <Loader2 className="h-4 w-4 animate-spin" /> : <Phone className="h-4 w-4" />} Get a New Number
          </button>
          <button onClick={() => activate("connect-existing")} disabled={loading || working || active || !existingNumber} className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50">
            {working ? <Loader2 className="h-4 w-4 animate-spin" /> : <PhoneCall className="h-4 w-4" />} Connect Existing Number
          </button>
        </div>

        {loading && <p className="mt-3 text-center text-xs text-slate-500">Checking your phone setup...</p>}
        {existingNumber && <p className="mt-3 text-center text-xs text-slate-400">Number on your account: {existingNumber}</p>}
        {active && <p className="mt-4 flex items-center justify-center gap-2 text-sm text-emerald-400"><CheckCircle2 className="h-4 w-4" /> AI Phone is active</p>}
        {message && <p className="mt-4 rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3 text-sm text-emerald-300">{message}</p>}
        {error && <p className="mt-4 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-300">{error}</p>}
      </section>
    </main>
  );
}
