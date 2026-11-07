"use client";

import { useEffect, useState } from "react";

type AIPhoneSettings = {
  phoneNumber: string | null;
  assistantName: string | null;
  status: string;
  enabled: boolean;
};

type AIPhoneResponse = {
  success?: boolean;
  aiPhoneSettings?: AIPhoneSettings | null;
  phoneNumber?: string;
  error?: string;
  message?: string;
};

export default function PhoneNumberPage() {
  const [settings, setSettings] = useState<AIPhoneSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [activating, setActivating] = useState(false);
  const [areaCode, setAreaCode] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

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
  }, []);

  async function activatePhone() {
    if (activating) return;

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
          areaCode ? { areaCode } : {},
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
                    Get a dedicated US reception number connected to your AI receptionist. No separate number purchase is required from you.
                  </p>
                </>
              )}
            </div>
          </div>

          {!loading && !isEnabled ? (
            <div className="mt-6 border-t border-slate-800 pt-6">
              <div className="max-w-xs">
                <label
                  htmlFor="areaCode"
                  className="text-sm font-medium text-slate-300"
                >
                  Preferred US area code (optional)
                </label>
                <input
                  id="areaCode"
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  maxLength={3}
                  pattern="[0-9]{3}"
                  value={areaCode}
                  onChange={(event) =>
                    setAreaCode(event.target.value.replace(/\D/g, "").slice(0, 3))
                  }
                  placeholder="e.g. 904"
                  className="mt-2 h-11 w-full rounded-xl border border-slate-800 bg-slate-900/60 px-4 text-sm text-white outline-none transition-colors placeholder:text-slate-600 focus:border-blue-500"
                />
                <p className="mt-2 text-xs leading-5 text-slate-500">
                  Leave this blank to assign any available US local number.
                </p>
              </div>

              <button
                type="button"
                onClick={activatePhone}
                disabled={activating}
                className="mt-5 inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 text-sm font-semibold text-white transition-colors hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {activating
                  ? "Connecting your number..."
                  : hasNumber
                    ? "Finish AI Phone Setup"
                    : "Get My Free AI Phone Number"}
              </button>
              <p className="mt-3 text-xs leading-5 text-slate-500">
                Your dedicated US number is included with eligible plans. Smart Cleaning Desk provisions it automatically; provider and call usage costs are covered by the service.
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
