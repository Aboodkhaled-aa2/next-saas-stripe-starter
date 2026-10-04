"use client";

import { useState } from "react";

type PhoneNumber = {
  number: string | null;
  region: string | null;
  city: string | null;
  rateCenter: string | null;
  capabilities: {
    voice: boolean;
    sms: boolean;
    mms: boolean;
  };
};

export default function PhoneNumberPage() {
  const [areaCode, setAreaCode] = useState("");
  const [region, setRegion] = useState("");
  const [numbers, setNumbers] = useState<PhoneNumber[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const searchNumbers = async () => {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams({ limit: "12" });

      if (areaCode.trim()) params.set("areaCode", areaCode.trim());
      if (region) params.set("region", region);

      const response = await fetch(
        `/api/phone-numbers/search?${params.toString()}`,
        { cache: "no-store" },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to search phone numbers.");
      }

      setNumbers(data.numbers ?? []);
    } catch (err) {
      setNumbers([]);
      setError(
        err instanceof Error
          ? err.message
          : "Unable to search phone numbers.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] px-4 py-10 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8">
          <p className="text-sm font-medium text-blue-400">AI PHONE</p>
          <h1 className="mt-2 text-3xl font-bold">Get a Business Phone Number</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-400">
            Choose a US phone number for your AI Receptionist. Search by area code and select an available number.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-5">
          <div className="grid gap-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
            <label className="block">
              <span className="text-sm font-medium text-slate-300">Area code</span>
              <input
                value={areaCode}
                onChange={(event) => setAreaCode(event.target.value)}
                inputMode="numeric"
                maxLength={3}
                placeholder="212"
                className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none placeholder:text-slate-600 focus:border-blue-500"
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-slate-300">State</span>
              <input
                value={region}
                onChange={(event) => setRegion(event.target.value.toUpperCase())}
                maxLength={2}
                placeholder="NY"
                className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none placeholder:text-slate-600 focus:border-blue-500"
              />
            </label>

            <button
              type="button"
              onClick={searchNumbers}
              disabled={loading}
              className="rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Searching..." : "Search Numbers"}
            </button>
          </div>

          {error ? (
            <p className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-300">
              {error}
            </p>
          ) : null}
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {numbers.map((item) => (
            <div
              key={item.number}
              className="rounded-2xl border border-slate-800 bg-slate-950/80 p-5"
            >
              <p className="text-xl font-bold tracking-wide">
                {item.number ?? "Unavailable"}
              </p>
              <p className="mt-2 text-sm text-slate-400">
                {[item.city, item.region].filter(Boolean).join(", ") || "US local number"}
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                {item.capabilities.voice ? (
                  <span className="rounded-full bg-blue-500/10 px-2.5 py-1 text-xs text-blue-300">
                    Voice
                  </span>
                ) : null}
                {item.capabilities.sms ? (
                  <span className="rounded-full bg-slate-800 px-2.5 py-1 text-xs text-slate-300">
                    SMS
                  </span>
                ) : null}
                {item.capabilities.mms ? (
                  <span className="rounded-full bg-slate-800 px-2.5 py-1 text-xs text-slate-300">
                    MMS
                  </span>
                ) : null}
              </div>

              <button
                type="button"
                onClick={async () => {
                  try {
                    const response = await fetch("/api/stripe/phone-number", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ phoneNumber: item.number }),
                    });

                    const data = await response.json();

                    if (!response.ok || !data.url) {
                      throw new Error(
                        data.error || "Unable to start checkout.",
                      );
                    }

                    window.location.href = data.url;
                  } catch (err) {
                    setError(
                      err instanceof Error
                        ? err.message
                        : "Unable to start checkout.",
                    );
                  }
                }}
                disabled={!item.number}
                className="mt-5 w-full rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Get this number — $4.99/month
              </button>
            </div>
          ))}
        </div>

        {!loading && !error && numbers.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-dashed border-slate-800 p-10 text-center text-sm text-slate-500">
            Enter an area code or state and search for available numbers.
          </div>
        ) : null}
      </div>
    </div>
  );
}
