import Link from "next/link";

export default function TrialExpiredPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-white">
      <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center shadow-2xl">
        <h1 className="text-2xl font-bold">Your 7-day free trial has ended</h1>
        <p className="mt-3 text-slate-300">
          Your account, business profile, customers, conversations, and connected
          channel data are محفوظة. Choose a plan to restore subscription features.
        </p>
        <p className="mt-3 text-sm text-slate-400">
          You are still signed in. You do not need to create another account or
          repeat business setup.
        </p>
        <Link
          className="mt-7 inline-flex items-center justify-center rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-500"
          href="/pricing?trial=expired"
        >
          Choose a plan
        </Link>
        <p className="mt-5 text-xs text-slate-500">
          Your saved information will remain in your account while you decide.
        </p>
      </div>
    </main>
  );
}
