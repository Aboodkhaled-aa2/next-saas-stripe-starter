"use client";

import { useState } from "react";
import { Loader2, Sparkles } from "lucide-react";

export function DmlyWorkspaceButton({
  hasWorkspace,
}: {
  hasWorkspace: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function provision() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/integrations/dmly/workspace", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to create the messaging workspace.");
      }

      window.location.reload();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to create the messaging workspace.",
      );
    } finally {
      setLoading(false);
    }
  }

  if (hasWorkspace) {
    return (
      <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-sm text-emerald-300">
        Your messaging workspace is ready.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={provision}
        disabled={loading}
        className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-emerald-600 px-5 text-sm font-semibold text-white transition-colors hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Sparkles className="h-4 w-4" />
        )}
        {loading ? "Creating workspace..." : "Set Up Messaging Workspace"}
      </button>

      {error && (
        <p className="text-sm leading-6 text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}
