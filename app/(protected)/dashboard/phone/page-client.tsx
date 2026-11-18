"use client";

import { useEffect, useState } from "react";

type AIPhoneSettings = {
  phoneNumber: string | null;
  assistantName: string | null;
  status: string;
  enabled: boolean;
};

type AIPhoneUsage = {
  plan: string;
  periodStart: string;
  periodEnd: string;
  messages: { used: number; included: number; remaining: number; extra: number };
  voice: { used: number; included: number; remaining: number; extra: number };
};

type AIPhoneResponse = {
  success?: boolean;
  aiPhoneSettings?: AIPhoneSettings | null;
  phoneNumber?: string;
  error?: string;
  message?: string;
};

export default function PhoneNumberPage({ showAdminUsage = false }: { showAdminUsage?: boolean }) {
  const [settings, setSettings] = useState<AIPhoneSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [activating, setActivating] = useState(false);
  const [areaCode, setAreaCode] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [usage, setUsage] = useState<AIPhoneUsage | null>(null);
  const [usageError, setUsageError] = useState("");
  const [usageLoading, setUsageLoading] = useState(true);

  async function loadUsage() {
    try {
      const response = await fetch("/api/ai-phone/usage", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to load usage.");
      setUsage(data as AIPhoneUsage);
      setUsageError("");
    } catch (err) {
      setUsageError(err instanceof Error ? err.message : "Unable to load usage.");
    } finally {
      setUsageLoading(false);
    }
  }

  async function loadSettings() {
    try {
      const response = await fetch("/api/ai-phone", {
        cache: "no-store",
      });
      const data = (await response.json()) as AIPhoneResponse;

      if (!response.ok) {
        throw new Error(data.error || "Unable to load AI Phone settings.");
      }

      setSettings(data.aiPhoneSettings ?? null);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load AI Phone settings.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadSettings();
    if (showAdminUsage) void loadUsage();
  }, [showAdminUsage]);

  async function activatePhone(retryExisting = false) {
    if (activating) return;

    const confirmed = window.confirm(
      retryExisting
        ? "Reconnect your existing reception number? No new number will be purchased."
        : "Activate a dedicated US reception number? The system will purchase an available local number and connect it to your AI receptionist.",
    );

    if (!confirmed) return;

    setActivating(true);
    setError("");
    setNotice("");

    try {
      const response = await fetch("/api/ai-phone/activate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(
          retryExisting
            ? { action: "retry-existing" }
            : areaCode
              ? { areaCode }
              : {},
        ),
      });

      const data = (await response.json()) as AIPhoneResponse;

      if (!response.ok) {
        throw new Error(data.error || "Unable to activate AI Phone.");
      }

      if (data.aiPhoneSettings) {
        setSettings(data.aiPhoneSettings);
      } else {
        await loadSettings();
      }

      setNotice(data.message || "Your AI Phone number is connected.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to activate AI Phone.",
      );
    } finally {
      setActivating(false);
    }
  }

  const hasNumber = Boolean(settings?.phoneNumber);
  const isEnabled = Boolean(settings?.enabled);

  return (
    <main className="min-h-screen bg-[#020617] px-4 py-10 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <header className="mb-8">
          <p className="text-sm font-medium text-blue-400">SMART CLEANING DESK</p>
          <h1 className="mt-2 text-3xl font-bold">AI Phone</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
            Activate a dedicated US reception number for your AI receptionist.
            Your existing business number can stay with your current phone provider.
          </p>
        </header>

        {error ? (
          <div
            role="alert"
            className="mb-5 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200"
          >
            {error}
          </div>
        ) : null}

        {notice ? (
          <div
            role="status"
            className="mb-5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-200"
          >
            {notice}
          </div>
        ) : null}

        {showAdminUsage ? <section className="mb-5 rounded-2xl border border-slate-800 bg-slate-950/80 p-6">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-lg font-semibold">Pro Usage</h2>
              <p className="mt-1 text-sm text-slate-400">Current calendar month · Admin test account</p>
            </div>
            <span className="rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-300">PRO</span>
          </div>
          {usageLoading ? (
            <p className="text-sm text-slate-400">Loading usage counters...</p>
          ) : usageError ? (
            <p role="alert" className="text-sm text-amber-300">{usageError}</p>
          ) : usage ? (
            <div className="grid gap-4 md:grid-cols-2">
              <UsageMeter title="AI Messages" used={usage.messages.used} included={usage.messages.included} remaining={usage.messages.remaining} extra={usage.messages.extra} unit="messages" />
              <UsageMeter title="AI Phone Minutes" used={usage.voice.used} included={usage.voice.included} remaining={usage.voice.remaining} extra={usage.voice.extra} unit="minutes" />
            </div>
          ) : null}
        </section> : null}

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
              ) : hasNumber ? (
                <>
                  <p className="mt-2 break-all text-2xl font-bold tracking-wide">
                    {settings?.phoneNumber}
                  </p>
                  <p className="mt-2 text-sm text-slate-400">
                    {settings?.assistantName
                      ? `Connected to ${settings.assistantName}`
                      : "Your dedicated number is assigned to this account."}
                  </p>
                  <span className="mt-4 inline-flex rounded-full border border-slate-700 px-3 py-1 text-xs font-medium text-slate-300">
                    {isEnabled ? "Active and connected" : "Number assigned — setup pending"}
                  </span>
                </>
              ) : (
                <>
                  <p className="mt-2 text-sm leading-6 text-slate-300">
                    No reception number has been assigned to your account yet.
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    Activate AI Phone to automatically purchase and connect a dedicated US number.
                  </p>
                </>
              )}
            </div>
          </div>

          {!loading ? (
            <div className="mt-6 border-t border-slate-800 pt-6">
              <button
                type="button"
                onClick={() => void activatePhone(true)}
                disabled={activating}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 text-sm font-semibold text-white transition-colors hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {activating ? "Reconnecting your saved number..." : "Reconnect Existing Number"}
              </button>
              <p className="mt-3 text-xs leading-5 text-slate-500">
                This admin-only action retries setup for the number already saved to your account. It will not purchase a new number.
              </p>
            </div>
          ) : null}
        </section>

        <section className="mt-5 rounded-2xl border border-slate-800 bg-slate-950/50 p-6">
          <h2 className="font-semibold">Keep your existing business number</h2>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            Once your dedicated reception number is active, you can set up call
            forwarding with your current phone provider. Customers can continue
            calling your existing business number.
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


function UsageMeter({
  title,
  used,
  included,
  remaining,
  extra,
  unit,
}: {
  title: string;
  used: number;
  included: number;
  remaining: number;
  extra: number;
  unit: string;
}) {
  const percentage = included > 0 ? Math.min(100, (used / included) * 100) : 0;
  const format = (value: number) =>
    Number(value).toLocaleString("en-US", { maximumFractionDigits: 2 });

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
      <h3 className="text-sm font-medium text-slate-300">{title}</h3>
      <p className="mt-3 text-2xl font-bold text-white">
        {format(used)} <span className="text-sm font-normal text-slate-400">/ {format(included)} {unit}</span>
      </p>
      <div
        className="mt-3 h-2 overflow-hidden rounded-full bg-slate-800"
        role="progressbar"
        aria-label={title}
        aria-valuenow={Math.min(used, included)}
        aria-valuemin={0}
        aria-valuemax={included}
      >
        <div className="h-full rounded-full bg-blue-500" style={{ width: `${percentage}%` }} />
      </div>
      <div className="mt-3 flex flex-wrap justify-between gap-2 text-xs text-slate-400">
        <span>{format(remaining)} {unit} remaining</span>
        <span>{format(extra)} extra {unit}</span>
      </div>
    </div>
  );
}
