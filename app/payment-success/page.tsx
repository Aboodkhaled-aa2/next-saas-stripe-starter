import Link from "next/link";
import { CheckCircle2, ArrowRight } from "lucide-react";

export default function PaymentSuccessPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#020617] px-6 text-white">
      <div className="w-full max-w-lg text-center">
        <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/10 ring-1 ring-emerald-500/20">
          <CheckCircle2 className="h-12 w-12 text-emerald-400" />
        </div>

        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-emerald-400">
          Smart Cleaning Desk
        </p>

        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Your Free Trial Has Started
        </h1>

        <p className="mx-auto mt-5 max-w-md text-base leading-7 text-slate-400">
          Your 3-day free trial is now active. Your subscription will begin billing after the trial period ends.
        </p>

        <div className="mt-10">
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-400"
          >
            Go to Dashboard
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <p className="mt-6 text-sm text-slate-500">
          Continue to your dashboard to complete your business setup and connect your channels.
        </p>
      </div>
    </main>
  );
}
