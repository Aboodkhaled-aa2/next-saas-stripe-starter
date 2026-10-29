"use client";

import { useState } from "react";
import Link from "next/link";

export default function TrialExpiredPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function subscribeNow() {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const result = await response.json().catch(() => ({}));

      if (!response.ok || !result.url) {
        setError(
          result.error ||
            "Unable to open checkout. Please sign in again and retry.",
        );
        return;
      }

      window.location.assign(result.url);
    } catch {
      setError("Unable to open checkout. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-white">
      <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center">
        <h1 className="text-2xl font-bold">Your 7-day free trial has ended</h1>
        <p className="mt-3 text-slate-300">
          Your account and saved business information are preserved. Subscribe
          to your saved plan to restore paid features. Messaging automation and
          AI Phone calls remain disabled until payment is active.
        </p>

        <button
          type="button"
          onClick={() => void subscribeNow()}
          disabled={loading}
          className="mt-6 w-full rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Opening secure checkout..." : "Subscribe Now"}
        </button>

        {error && (
          <p role="alert" className="mt-3 text-sm text-red-400">
            {error}
          </p>
        )}

        <p className="mt-5 text-sm text-slate-400">
          You will stay signed in while choosing your subscription.
        </p>
        <Link className="mt-4 inline-block text-blue-400 underline" href="/dashboard">
          Return to dashboard
        </Link>
      </div>
    </main>
  );
}
