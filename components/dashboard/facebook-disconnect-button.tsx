"use client";

import { useState } from "react";
import { Unplug } from "lucide-react";

export function FacebookDisconnectButton() {
  const [loading, setLoading] = useState(false);

  async function disconnect() {
    if (
      !window.confirm(
        "Disconnect this Facebook Page from Smart Cleaning Desk?",
      )
    ) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "/api/integrations/meta/facebook/disconnect",
        {
          method: "DELETE",
        },
      );

      if (!response.ok) {
        throw new Error("Failed to disconnect Facebook.");
      }

      window.location.reload();
    } catch {
      window.alert("Could not disconnect Facebook. Please try again.");
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={disconnect}
      disabled={loading}
      className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-5 text-sm font-semibold text-red-300 transition-colors hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-50"
    >
      <Unplug className="h-4 w-4" />
      {loading ? "Disconnecting..." : "Disconnect Facebook"}
    </button>
  );
}
