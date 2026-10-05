"use client";

import { useEffect, useState } from "react";
import { Loader2, MessageCircle } from "lucide-react";

declare global {
  interface Window {
    FB?: {
      init: (options: Record<string, unknown>) => void;
      login: (
        callback: (response: { authResponse?: { code?: string } }) => void,
        options: Record<string, unknown>,
      ) => void;
    };
    fbAsyncInit?: () => void;
  }
}

export function MetaWhatsAppConnect() {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (document.getElementById("facebook-jssdk")) return;

    window.fbAsyncInit = () => {
      window.FB?.init({
        appId: process.env.NEXT_PUBLIC_META_APP_ID,
        cookie: true,
        xfbml: false,
        version: process.env.NEXT_PUBLIC_META_GRAPH_VERSION || "v25.0",
      });
    };

    const script = document.createElement("script");
    script.id = "facebook-jssdk";
    script.async = true;
    script.defer = true;
    script.crossOrigin = "anonymous";
    script.src = "https://connect.facebook.net/en_US/sdk.js";
    document.body.appendChild(script);
  }, []);

  async function connect() {
    setLoading(true);

    try {
      const setup = await fetch("/api/integrations/meta/whatsapp/start", {
        method: "POST",
      });
      const data = await setup.json();

      if (!setup.ok) throw new Error(data.error || "WhatsApp setup is unavailable");

      const launch = () => {
        window.FB?.login(
          async (response) => {
            const code = response.authResponse?.code;

            if (!code) {
              setLoading(false);
              return;
            }

            const result = await fetch("/api/integrations/meta/whatsapp/callback", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ code, state: data.state }),
            });

            if (!result.ok) {
              console.error(await result.text());
              setLoading(false);
              return;
            }

            window.location.reload();
          },
          {
            config_id: data.configId,
            response_type: "code",
            override_default_response_type: true,
            extras: {
              feature: "whatsapp_embedded_signup",
              sessionInfoVersion: "3",
            },
          },
        );
      };

      if (window.FB) {
        launch();
      } else {
        window.fbAsyncInit = () => {
          window.FB?.init({
            appId: data.appId,
            cookie: true,
            xfbml: false,
            version: process.env.NEXT_PUBLIC_META_GRAPH_VERSION || "v25.0",
          });
          launch();
        };
      }
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={connect}
      disabled={loading}
      className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-emerald-600 px-5 text-sm font-semibold text-white transition-colors hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <MessageCircle className="h-4 w-4" />}
      {loading ? "Connecting..." : "Connect WhatsApp"}
    </button>
  );
}
