"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, MessageCircle } from "lucide-react";

type FacebookLoginResponse = {
  status?: string;
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

type WhatsAppSessionInfo = {
  phone_number_id?: string;
  waba_id?: string;
  business_id?: string;
};

export function MetaWhatsAppConnect() {
  const [sdkReady, setSdkReady] = useState(false);
  const [setupReady, setSetupReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [configId, setConfigId] = useState<string | null>(null);

  const stateRef = useRef<string | null>(null);
  const codeRef = useRef<string | null>(null);
  const sessionInfoRef = useRef<WhatsAppSessionInfo | null>(null);
  const submittedRef = useRef(false);

  useEffect(() => {
    let cancelled = false;

    const getFacebook = () =>
      (window as Window & { FB?: FacebookSdk }).FB;

    const initialize = () => {
      const fb = getFacebook();

      if (!fb) {
        if (!cancelled) {
          setError("Facebook SDK failed to initialize.");
        }
        return;
      }

      fb.init({
        appId: "1058014497030757",
        cookie: true,
        xfbml: true,
        version: "v26.0",
      });

      if (!cancelled) {
        setSdkReady(true);
      }
    };

    const existing = getFacebook();

    if (existing) {
      initialize();
    } else {
      const win = window as Window & {
        fbAsyncInit?: () => void;
      };

      win.fbAsyncInit = initialize;

      if (!document.getElementById("facebook-jssdk")) {
        const script = document.createElement("script");
        script.id = "facebook-jssdk";
        script.async = true;
        script.defer = true;
        script.crossOrigin = "anonymous";
        script.src = "https://connect.facebook.net/en_US/sdk.js";
        document.body.appendChild(script);
      } else {
        const interval = window.setInterval(() => {
          if (getFacebook()) {
            window.clearInterval(interval);
            initialize();
          }
        }, 100);

        return () => {
          cancelled = true;
          window.clearInterval(interval);
        };
      }
    }

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    const prepare = async () => {
      try {
        const response = await fetch("/api/integrations/meta/whatsapp/start", {
          method: "POST",
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok || !data?.state || !data?.configId) {
          throw new Error(
            data?.error || "WhatsApp Embedded Signup is unavailable.",
          );
        }

        stateRef.current = data.state;

        if (!cancelled) {
          setConfigId(String(data.configId));
          setSetupReady(true);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "WhatsApp Embedded Signup is unavailable.",
          );
        }
      }
    };

    void prepare();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (
        event.origin !== "https://www.facebook.com" &&
        event.origin !== "https://web.facebook.com"
      ) {
        return;
      }

      if (typeof event.data !== "string") {
        return;
      }

      try {
        const message = JSON.parse(event.data);

        if (message?.type !== "WA_EMBEDDED_SIGNUP") {
          return;
        }

        console.log("WhatsApp Embedded Signup event:", message);

        if (message?.event === "CANCEL") {
          setLoading(false);
          setError(
            message.data?.current_step
              ? `WhatsApp signup was cancelled at: ${message.data.current_step}`
              : "WhatsApp signup was cancelled.",
          );
          return;
        }

        if (message?.event === "ERROR") {
          setLoading(false);
          setError(
            message.data?.error_message ||
              "Meta reported an error during WhatsApp signup.",
          );
          return;
        }

        if (message?.event !== "FINISH") {
          return;
        }

        sessionInfoRef.current = {
          phone_number_id: message.data?.phone_number_id,
          waba_id: message.data?.waba_id,
          business_id: message.data?.business_id,
        };

        void submitSignup();
      } catch {
        return;
      }
    };

    window.addEventListener("message", onMessage);

    return () => {
      window.removeEventListener("message", onMessage);
    };
  }, []);

  const submitSignup = async () => {
    if (submittedRef.current) {
      return;
    }

    const code = codeRef.current;
    const state = stateRef.current;
    const sessionInfo = sessionInfoRef.current;

    // Meta can deliver the FINISH postMessage before or after FB.login
    // returns the authorization code. Wait until both are available.
    if (
      !code ||
      !state ||
      !sessionInfo?.waba_id ||
      !sessionInfo?.phone_number_id
    ) {
      return;
    }

    submittedRef.current = true;

    try {
      const response = await fetch(
        "/api/integrations/meta/whatsapp/callback",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            code,
            state,
            wabaId: sessionInfo?.waba_id,
            phoneNumberId: sessionInfo?.phone_number_id,
            businessId: sessionInfo?.business_id,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error || "WhatsApp connection failed.",
        );
      }

      window.location.reload();
    } catch (err) {
      submittedRef.current = false;
      setLoading(false);
      setError(
        err instanceof Error
          ? err.message
          : "WhatsApp connection failed.",
      );
    }
  };

  const connect = () => {
    const fb = (window as Window & { FB?: FacebookSdk }).FB;
    const state = stateRef.current;
    const activeConfigId = configId;

    if (!fb || !sdkReady) {
      setError("Facebook SDK is still loading.");
      return;
    }

    if (!setupReady || !state || !activeConfigId) {
      setError("Preparing WhatsApp connection. Please try again in a moment.");
      return;
    }

    setLoading(true);
    setError("");
    codeRef.current = null;
    sessionInfoRef.current = null;
    submittedRef.current = false;

    fb.login(
      (response) => {
        const code = response.authResponse?.code;

        if (!code) {
          setLoading(false);
          setError("WhatsApp authorization was not completed.");
          return;
        }

        codeRef.current = code;
        void submitSignup();
      },
      {
        config_id: activeConfigId,
        response_type: "code",
        override_default_response_type: true,
        extras: {
          setup: {},
        },
      },
    );
  };

  return (
    <button
      type="button"
      onClick={connect}
      disabled={loading || !sdkReady || !setupReady}
      className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-emerald-600 px-5 text-sm font-semibold text-white transition-colors hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <MessageCircle className="h-4 w-4" />
      )}
      {loading ? "Connecting..." : "Connect WhatsApp"}
    </button>
  );
}
