"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function CheckoutContinuePage() {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function openCheckout() {
      try {
        const response = await fetch("/api/stripe/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });
        const result = await response.json().catch(() => ({}));

        if (!response.ok || !result.url) {
          if (!cancelled) {
            setError(
              result.error ||
                "Unable to open checkout for your saved plan. Please try again.",
            );
          }
          return;
        }

        window.location.assign(result.url);
      } catch {
        if (!cancelled) {
          setError("Unable to connect to secure checkout. Please try again.");
        }
      }
    }

    void openCheckout();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-white">
      <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center">
        <h1 className="text-2xl font-bold">Continue to your subscription</h1>
        <p className="mt-3 text-slate-300">
          Your free trial has ended. We are opening secure checkout for the plan
          saved to your account. Your account and business data remain saved.
        </p>
        {!error ? (
          <p className="mt-5 text-sm text-slate-400">Opening secure Stripe Checkout…</p>
        ) : (
          <>
            <p role="alert" className="mt-5 text-sm text-red-400">{error}</p>
            <Link className="mt-5 inline-block text-blue-400 underline" href="/login?trial=expired">
              Return to sign in
            </Link>
          </>
        )}
      </div>
    </main>
  );
}
