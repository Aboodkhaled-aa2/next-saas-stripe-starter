"use client";

import Link from "next/link";
import { useState } from "react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true); setError(""); setMessage("");
    try {
      const response = await fetch("/api/auth/forgot-password", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) });
      const data = await response.json();
      if (!response.ok) setError(data.error || "Something went wrong.");
      else setMessage(data.message || "Check your email for the reset link.");
    } catch { setError("Unable to send the reset link. Try again."); }
    finally { setLoading(false); }
  }

  return <main className="flex min-h-screen items-center justify-center bg-[#0b0f19] px-4 text-white"><section className="w-full max-w-md rounded-2xl border border-gray-800 bg-[#0d1322] p-8"><h1 className="text-2xl font-bold">Forgot password?</h1><p className="mt-2 text-sm text-gray-400">Enter your account email and we’ll send you a secure reset link.</p><form onSubmit={submit} className="mt-6 space-y-4"><input type="email" required value={email} onChange={e=>setEmail(e.target.value)} placeholder="name@example.com" className="w-full rounded-lg border border-gray-700 bg-[#0b0f19] px-4 py-3 text-white" />{error && <p role="alert" className="text-sm text-red-400">{error}</p>}{message && <p role="status" className="text-sm text-emerald-400">{message}</p>}<button disabled={loading} className="w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold disabled:opacity-60">{loading ? "Sending..." : "Send reset link"}</button></form><p className="mt-6 text-center text-sm text-gray-400"><Link className="underline hover:text-white" href="/login">Back to login</Link></p></section></main>;
}
