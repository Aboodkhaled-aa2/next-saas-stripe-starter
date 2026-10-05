"use client";

import { useEffect, useState } from "react";
import { Facebook, Loader2 } from "lucide-react";

declare global {
  interface Window {
    FB?: {
      init: (options: {
        appId: string;
        cookie?: boolean;
        xfbml?: boolean;
        version: string;
      }) => void;
      login: (
        callback: (response: {
          status?: string;
          authResponse?: {
            code?: string;
          } | null;
        }) => void,
        options: {
          config_id: string;
          response_type: "code";
          override_default_response_type: boolean;
        },
      ) => void;
    };
    fbAsyncInit?: () => void;
  }
}

const APP_ID = "1058014497030757";
const CONFIG_ID = "113798935317997";

export function FacebookConnect() {
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (window.FB) {
      setReady(true);
      return;
    }

    const existingScript = document.getElementById("facebook-jssdk");

    const initialize = () => {
      if (!window.FB) return;

      window.FB.init({
        appId: APP_ID,
        cookie: true,
        xfbml: true,
        version: "v26.0",
      });

      setReady(true);
    };

    if (existingScript) {
      window.fbAsyncInit = initialize;
      return;
    }

    window.fbAsyncInit = initialize;

    const script = document.createElement("script");
    script.id = "facebook-jssdk";
    script.async = true;
    script.defer = true;
    script.crossOrigin = "anonymous";
    script.src = "https://connect.facebook.net/en_US/sdk.js";

    document.body.appendChild(script);

    return () => {
      if (window.fbAsyncInit === initialize) {
        window.fbAsyncInit = undefined;
      }
    };
  }, []);

  const connectFacebook = () => {
    if (!window.FB || !ready) {
      setError("Facebook Login is still loading. Please try again.");
      return;
    }

    setLoading(true);
    setError("");

    window.FB.login(
      async (response) => {
        try {
          if (!response.authResponse?.code) {
            setLoading(false);
            setError("Facebook authorization was not completed.");
            return;
          }

          const result = await fetch(
            "/api/integrations/meta/facebook/callback",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                code: response.authResponse.code,
              }),
            },
          );

          const data = await result.json();

          if (!result.ok) {
            throw new Error(
              data?.error || "Facebook connection failed.",
            );
          }

          window.location.href =
            "/dashboard/integrations/facebook?connected=1";
        } catch (err) {
          console.error("Facebook connection failed:", err);

          setLoading(false);
          setError(
            err instanceof Error
              ? err.message
              : "Facebook connection failed.",
          );
        }
      },
      {
        config_id: CONFIG_ID,
        response_type: "code",
        override_default_response_type: true,
      },
    );
  };

  return (
    <div className="flex flex-col items-end gap-2">
      <button
        type="button"
        onClick={connectFacebook}
        disabled={!ready || loading}
        className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Facebook className="h-4 w-4" />
        )}

        {loading ? "Connecting..." : "Connect Facebook"}
      </button>

      {error ? (
        <p className="max-w-xs text-right text-xs text-red-400">
          {error}
        </p>
      ) : null}
    </div>
  );
}
