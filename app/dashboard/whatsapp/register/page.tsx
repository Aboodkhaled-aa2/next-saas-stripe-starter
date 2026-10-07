"use client";

import { useState } from "react";

export default function WhatsAppRegisterPage() {
  const [pin, setPin] = useState("483217");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  async function registerPhone() {
    setLoading(true);
    setStatus("");
    try {
      const response = await fetch("/api/integrations/meta/whatsapp/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin }),
      });
      const data = await response.json().catch(() => ({}));
      setStatus(JSON.stringify(data, null, 2));
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Registration failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-xl items-center px-6 py-12">
      <div className="w-full rounded-2xl border p-6">
        <h1 className="text-2xl font-semibold">Register WhatsApp Phone</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Register the connected WhatsApp Cloud API phone number.
        </p>
        <label className="mt-6 block text-sm font-medium">6-digit PIN</label>
        <input
          inputMode="numeric"
          autoComplete="off"
          maxLength={6}
          value={pin}
          onChange={(event) => setPin(event.target.value.replace(/\D/g, "").slice(0, 6))}
          className="mt-2 w-full rounded-lg border bg-transparent px-3 py-2"
        />
        <button
          type="button"
          disabled={loading || pin.length !== 6}
          onClick={registerPhone}
          className="mt-4 rounded-lg bg-primary px-4 py-2 text-primary-foreground disabled:opacity-50"
        >
          {loading ? "Registering..." : "Register phone number"}
        </button>
        {status ? <pre className="mt-5 overflow-auto rounded-lg border p-4 text-xs">{status}</pre> : null}
      </div>
    </main>
  );
}
