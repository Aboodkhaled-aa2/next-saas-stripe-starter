"use client";

import { useEffect, useState } from "react";
import { Facebook, Loader2 } from "lucide-react";

type FacebookLoginResponse = {
  authResponse?: {
    code?: string;
  };
};

type FacebookSdk = {
  init: (options: Record<string, unknown>) => void;
  login: (
    callback: (response: FacebookLoginResponse) => void,
    options: Record<string, unknown>,
  ) => void;
};

export function FacebookConnect() {
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fb = (window as Window & { FB?: FacebookSdk }).FB;

    if (fb) {
      setReady(true);
      return;
    }

    const initialize = () => {
      const sdk = (window as Window & { FB?: FacebookSdk }).FB;

      if (!sdk) {
        setError("Facebook SDK failed to load.");
        return;
      }

      sdk.init({
        appId: "1058014497030757",
        cookie: true,
        xfbml: true,
        version: "v26.0",
      });

      setReady(true);
    };

    (
      window as Window & {
        fbAsyncInit?: () => void;
      }
    ).fbAsyncInit = initialize;

    const existingScript = document.getElementById("facebook-jssdk");

    if (existingScript) {
      return;
    }

    const script = document.createElement("script");
    script.id = "facebook-jssdk";
    script.async = true;
    script.defer = true;
    script.crossOrigin = "anonymous";
    script.src = "https://connect.facebook.net/en_US/sdk.js";

    document.body.appendChild(script);
  }, []);

  const connectFacebook = () => {
    const fb = (window as Window & { FB?: FacebookSdk }).FB;

    if (!fb || !ready) {
      setError("Facebook Login is still loading. Please try again.");
      return;
    }

    setLoading(true);
    setError("");

    fb.login(
      async (response) => {
        try {
          const code = response.authResponse?.code;

          if (!code) {
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
              body: JSON.stringify({ code }),
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
        config_id: "113798935317997",
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
