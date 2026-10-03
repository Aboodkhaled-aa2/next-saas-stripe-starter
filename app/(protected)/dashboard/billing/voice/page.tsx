"use client";

import { useState } from "react";

const packages = [
  { minutes: 100, price: 15 },
  { minutes: 500, price: 75 },
  { minutes: 1000, price: 120 },
];

export default function VoiceMinutePurchase({
  searchParams,
}: {
  searchParams: { minutes?: string };
}) {
  const [loading, setLoading] = useState<number | null>(null);
  const selectedMinutes = Number(searchParams.minutes);
  const selectedPackage = packages.find(
    (pack) => pack.minutes === selectedMinutes,
  );

  const buy = async (minutes: number) => {
    try {
      setLoading(minutes);
      const response = await fetch("/api/stripe/voice-minutes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ minutes }),
      });
      const data = await response.json();
      if (!response.ok || !data.url) {
        throw new Error(data.error || "Unable to start checkout.");
      }
      window.location.href = data.url;
    } catch (error) {
      console.error(error);
      alert(error instanceof Error ? error.message : "Unable to start checkout.");
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] px-4 py-12 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8">
          <p className="text-sm font-medium text-blue-400">SMART CLEANING DESK</p>
          <h1 className="mt-2 text-3xl font-bold">Extra AI Phone Minutes</h1>
          <p className="mt-2 text-sm text-slate-400">Add one-time voice minutes to your account and use them after your included plan minutes.</p>
        </div>
        {selectedPackage ? (
          <div className="mb-8 rounded-2xl border border-blue-500/30 bg-blue-500/10 p-5">
            <p className="text-sm text-slate-300">Selected package</p>
            <p className="mt-1 text-2xl font-bold">
              {selectedPackage.minutes.toLocaleString()} minutes — ${selectedPackage.price}
            </p>
          </div>
        ) : null}
        <div className="grid gap-4 sm:grid-cols-3">
          {packages.map((pack) => (
            <button key={pack.minutes} type="button" onClick={() => buy(pack.minutes)} disabled={loading !== null}
              className="rounded-2xl border border-slate-800 bg-slate-950/80 p-6 text-left transition hover:border-blue-500/40 hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-60">
              <p className="text-sm font-semibold text-slate-300">{pack.minutes.toLocaleString()} Extra Minutes</p>
              <p className="mt-3 text-3xl font-bold text-blue-400">${pack.price}</p>
              <p className="mt-3 text-xs text-slate-500">One-time purchase</p>
              <span className="mt-5 inline-flex text-sm font-semibold text-white">{loading === pack.minutes ? "Opening checkout..." : "Buy minutes"}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}