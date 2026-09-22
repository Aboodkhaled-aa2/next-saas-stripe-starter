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
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500">
              <Sparkles className="h-5 w-5 text-white" />
            </div>

            <span className="text-lg font-bold tracking-tight">
              Smart Cleaning Desk
            </span>
          </Link>
        </div>
      </header>

      <div className="flex flex-1 items-center justify-center px-6 py-16">
        <div className="w-full max-w-md">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-8 shadow-2xl">
            <div className="mb-8 text-center">
              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-blue-500/10">
                <Mail className="h-7 w-7 text-blue-400" />
              </div>

              <h1 className="text-2xl font-bold">
                Verify your email
              </h1>

              <p className="mt-3 text-sm leading-6 text-slate-400">
                Enter the 6-digit verification code we sent to your email
                address.
              </p>

              {email && (
                <p className="mt-2 break-all text-sm font-medium text-slate-300">
                  {email}
                </p>
              )}
            </div>

            <form onSubmit={handleVerify} className="space-y-5">
              <div>
                <label
                  htmlFor="code"
                  className="mb-2 block text-sm font-medium text-slate-200"
                >
                  Verification code
                </label>

                <input
                  id="code"
                  name="code"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  value={code}
                  onChange={(e) =>
                    setCode(e.target.value.replace(/\D/g, ""))
                  }
                  placeholder="000000"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-center text-lg tracking-[0.35em] text-white outline-none transition placeholder:text-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              {errorMsg && (
                <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                  {errorMsg}
                </div>
              )}

              {successMsg && (
                <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400">
                  {successMsg}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-500 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-blue-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Verifying..." : "Verify email"}
                {!loading && <ArrowRight className="h-4 w-4" />}
              </button>
            </form>

            <div className="mt-6 text-center">
              <Link
                href="/login"
                className="text-sm text-slate-400 transition hover:text-white"
              >
                Back to login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
