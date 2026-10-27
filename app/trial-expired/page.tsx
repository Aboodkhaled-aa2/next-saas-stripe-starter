"use client";

import { useEffect } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";

export default function TrialExpiredPage() {
  useEffect(() => {
    void signOut({ callbackUrl: "/login?trial=expired" });
  }, []);

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-white">
      <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center">
        <h1 className="text-2xl font-bold">Your 7-day free trial has ended</h1>
        <p className="mt-3 text-slate-300">
          Your account and saved business information remain محفوظين. Sign in again to choose your saved plan and activate a paid subscription. Messaging automation and AI Phone calls remain disabled until payment is active.
        </p>
        <p className="mt-5 text-sm text-slate-400">Signing you out securely…</p>
        <Link className="mt-5 inline-block text-blue-400 underline" href="/login?trial=expired">
          Continue to sign in
        </Link>
      </div>
    </main>
  );
}
