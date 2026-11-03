"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function ResetPasswordPage() {
  const params = useSearchParams();
  const token = params.get("token") || "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError("");
    if (password !== confirm) { setError("Passwords do not match."); return; }
    setLoading(true);
    try {
      const response = await fetch("/api/auth/reset-password", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token, password }) });
      const data = await response.json();
      if (!response.ok) setError(data.error || "Unable to reset password.");
      else setSuccess(true);
    } catch { setError("Unable to reset password. Try again."); }
    finally { setLoading(false); }
  }

  return <main className="flex min-h-screen items-center justify-center bg-[#0b0f19] px-4 text-white"><section className="w-full max-w-md rounded-2xl border border-gray-800 bg-[#0d1322] p-8"><h1 className="text-2xl font-bold">Create a new password</h1>{success ? <div className="mt-6"><p className="text-emerald-400">Your password has been updated.</p><Link href="/login" className="mt-4 inline-block text-blue-400 underline">Sign in</Link></div> : <form onSubmit={submit} className="mt-6 space-y-4"><input type="password" required minLength={8} value={password} onChange={e=>setPassword(e.target.value)} placeholder="New password" className="w-full rounded-lg border border-gray-700 bg-[#0b0f19] px-4 py-3 text-white" /><input type="password" required value={confirm} onChange={e=>setConfirm(e.target.value)} placeholder="Confirm new password" className="w-full rounded-lg border border-gray-700 bg-[#0b0f19] px-4 py-3 text-white" />{error && <p role="alert" className="text-sm text-red-400">{error}</p>}<p className="text-xs text-gray-500">At least 8 characters, with uppercase, lowercase, a number, and a symbol.</p><button disabled={loading || !token} className="w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold disabled:opacity-60">{loading ? "Saving..." : "Update password"}</button></form>}</section></main>;
}
