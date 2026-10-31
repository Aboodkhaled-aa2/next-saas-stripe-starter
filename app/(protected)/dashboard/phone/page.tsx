"use client";

import { useEffect, useState } from "react";

type AIPhoneSettings = {
  phoneNumber: string | null;
  assistantName: string | null;
  status: string;
  enabled: boolean;
};

type UsageSummary = {\n  eligible?: boolean;\n  plan?: string;\n  includedMinutes?: number;\n  includedUsed?: number;\n  includedRemaining?: number;\n  extraRemaining?: number;\n  totalRemaining?: number;\n  warningLevel?: "OK" | "LOW" | "CRITICAL" | "EMPTY";\n};\n\ntype AIPhoneResponse = {
  success?: boolean;
  aiPhoneSettings?: AIPhoneSettings | null;
  error?: string;
};

export default function PhoneNumberPage() {
  const [settings, setSettings] = useState<AIPhoneSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");\n  const [usage, setUsage] = useState<UsageSummary | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadSettings() {
      try {
        const response = await fetch("/api/ai-phone", {
          cache: "no-store",
        });
        const data = (await response.json()) as AIPhoneResponse;

        if (!response.ok) {
          throw new Error(data.error || "Unable to load AI Phone settings.");
        }

        if (!cancelled) {
          setSettings(data.aiPhoneSettings ?? null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load AI Phone settings.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadSettings();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main className="min-h-screen bg-[#020617] px-4 py-10 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <header className="mb-8">
          <p className="text-sm font-medium text-blue-400">SMART CLEANING DESK</p>
          <h1 className="mt-2 text-3xl font-bold">AI Phone</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
            Manage the phone number connected to your AI Receptionist. Your
            existing business number can stay with your current phone provider.
          </p>
        </header>

        {error ? (
          <div
            role="alert"
            className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200"
          >
            {error}
          </div>
        ) : null}

        {usage ? (
          <section className="mb-5 rounded-2xl border border-slate-800 bg-slate-950/80 p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold">AI Phone minute balance</h2>
                <p className="mt-1 text-sm text-slate-400">
                  {usage.includedRemaining?.toFixed(1)} included minutes and {usage.extraRemaining?.toFixed(1)} extra minutes remaining.
                </p>
              </div>
              <p className="text-2xl font-bold">{usage.totalRemaining?.toFixed(1)} min</p>
            </div>
            {usage.warningLevel !== "OK" ? (
              <div role="status" className={usage.warningLevel === "EMPTY"
                ? "mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200"
                : "mt-4 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-200"}>
                {usage.warningLevel === "EMPTY"
                  ? "Your AI Phone minutes are exhausted. New AI calls are blocked until you add minutes or your plan renews."
                  : usage.warningLevel === "CRITICAL"
                    ? "Your AI Phone balance is below 10%. Add minutes soon to avoid interruptions."
                    : "Your AI Phone balance is below 20%. Consider adding minutes soon."}
                <a href="/dashboard/billing/voice" className="ml-2 inline-flex font-semibold underline">Buy more minutes</a>
              </div>
            ) : null}
          </section>
        ) : null}

        <section className="rounded-2xl border border-slate-800 bg-slate-950/80 p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-300">
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="none"
                className="h-6 w-6"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 4h3l2 5-2 1.5a15 15 0 0 0 5.5 5.5L15 14l5 2v3a2 2 0 0 1-2 2C9.7 21 3 14.3 3 6a2 2 0 0 1 2-2Z"
                />
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-lg font-semibold">Reception number</h2>
              {loading ? (
                <p className="mt-2 text-sm text-slate-400">
                  Loading your phone settings...
                </p>
              ) : settings?.phoneNumber ? (
                <>
                  <p className="mt-2 break-all text-2xl font-bold tracking-wide">
                    {settings.phoneNumber}
                  </p>
                  <p className="mt-2 text-sm text-slate-400">
                    {settings.assistantName
                      ? `Connected to ${settings.assistantName}`
                      : "A phone number is saved in your AI Phone settings."}
                  </p>
                  <span className="mt-4 inline-flex rounded-full border border-slate-700 px-3 py-1 text-xs font-medium text-slate-300">
                    {settings.enabled ? "Enabled" : "Saved — not enabled"}
                  </span>
                </>
              ) : (
                <>
                  <p className="mt-2 text-sm leading-6 text-slate-300">
                    No reception number has been assigned to your account yet.
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    Automatic number assignment is being set up. You do not
                    need to search for or purchase a number manually on this page.
                  </p>
                </>
              )}
            </div>
          </div>
        </section>

        <section className="mt-5 rounded-2xl border border-slate-800 bg-slate-950/50 p-6">
          <h2 className="font-semibold">Keep your existing business number</h2>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            Once your dedicated reception number is assigned and connected,
            you can set up call forwarding with your current phone provider.
            Customers can continue calling your existing business number.
          </p>
          <p className="mt-3 text-xs leading-5 text-slate-500">
            Call forwarding instructions will be shown after the reception
            number is provisioned and connected successfully.
          </p>
        </section>
      </div>
    </main>
  );
}
