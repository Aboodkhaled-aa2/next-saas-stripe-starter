"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, ArrowRight, Sparkles } from "lucide-react";

export default function VerifyEmailPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [plan, setPlan] = useState("starter");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    const emailParam = params.get("email") || "";
    const planParam = params.get("plan") || "starter";

    setEmail(emailParam.toLowerCase().trim());
    setPlan(planParam);
  }, []);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();

    setErrorMsg("");
    setSuccessMsg("");

    if (!email) {
      setErrorMsg("Email address is missing.");
      return;
    }

    if (!/^\d{6}$/.test(code)) {
      setErrorMsg("Please enter the 6-digit verification code.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          code,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMsg(data.error || "Unable to verify your email.");
        setLoading(false);
        return;
      }

      setSuccessMsg("Email verified successfully.");

      const callbackUrl = `/pricing?plan=${encodeURIComponent(plan)}`;

      setTimeout(() => {
        router.push(
          `/login?callbackUrl=${encodeURIComponent(callbackUrl)}`,
        );
      }, 1000);
    } catch {
      setErrorMsg("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800/80 bg-slate-950/90 px-6 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-600 text-white">
              <Sparkles className="h-4 w-4" />
            </div>

            <span className="font-bold tracking-tight text-white">
              Smart Cleaning Desk
            </span>
          </Link>

          <Link
            href="/login"
            className="text-sm text-slate-400 transition hover:text-white"
          >
            Log in
          </Link>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-12">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-blue-500/20 bg-blue-600/10">
            <Mail className="h-8 w-8 text-blue-400" />
          </div>

          <h1 className="text-3xl font-black text-white">
            Verify Your Email
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-400">
            We sent a 6-digit verification code to
          </p>

          <p className="mt-1 break-all font-medium text-white">
            {email || "your email address"}
          </p>
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-8 shadow-2xl">
          {errorMsg && (
            <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm leading-relaxed text-red-400">
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="mb-6 rounded-xl border border-green-500/30 bg-green-500/10 p-4 text-sm leading-relaxed text-green-400">
              {successMsg}
            </div>
          )}

          <form onSubmit={handleVerify} className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Verification Code
              </label>

              <input
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                required
                value={code}
                onChange={(e) =>
                  setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                }
                placeholder="000000"
                disabled={loading}
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-4 text-center text-2xl tracking-[0.5em] text-white placeholder-slate-700 transition focus:border-blue-500 focus:outline-none disabled:opacity-50"
              />

              <p className="mt-2 text-center text-xs text-slate-500">
                The code expires in 10 minutes.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || code.length !== 6}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Verifying..." : "Verify Email"}

              {!loading && <ArrowRight className="h-4 w-4" />}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link
              href="/signup"
              className="text-sm text-blue-400 transition hover:text-blue-300"
            >
              Back to Sign Up
            </Link>
          </div>
        </div>
      </div>

      <footer className="border-t border-slate-900 py-6 text-center text-xs text-slate-600">
        © {new Date().getFullYear()} Smart Cleaning Desk. All rights reserved.
      </footer>
    </main>
  );
}
