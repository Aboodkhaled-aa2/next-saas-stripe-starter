"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, MessageCircle } from "lucide-react";

type FacebookLoginResponse = {
  status?: string;
  authResponse?: { code?: string };
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

type EmbeddedSignupMessage = {
  type?: string;
  event?: string;
  data?: WhatsAppSessionInfo & {
    current_step?: string;
    error_message?: string;
  };
};

export function MetaWhatsAppConnect() {
  const [sdkReady, setSdkReady] = useState(false);
  const [setupReady, setSetupReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [configId, setConfigId] = useState<string | null>(null);
  const [appId, setAppId] = useState<string | null>(null);

  const stateRef = useRef<string | null>(null);
  const codeRef = useRef<string | null>(null);
  const sessionInfoRef = useRef<WhatsAppSessionInfo | null>(null);
  const submittedRef = useRef(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearSignupTimeout = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  const resetSignup = () => {
    clearSignupTimeout();
    codeRef.current = null;
    sessionInfoRef.current = null;
    submittedRef.current = false;
  };

  const submitSignup = async () => {
    if (submittedRef.current) return;

    const code = codeRef.current;
    const state = stateRef.current;
    const sessionInfo = sessionInfoRef.current;

    // Meta returns the authorization code and selected assets on separate channels.
    if (!code || !state || !sessionInfo?.waba_id) return;

    submittedRef.current = true;
    clearSignupTimeout();

    try {
      const response = await fetch("/api/integrations/meta/whatsapp/callback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify({
          code,
          state,
          wabaId: sessionInfo.waba_id,
          phoneNumberId: sessionInfo.phone_number_id,
          businessId: sessionInfo.business_id,
        }),
      });

      const data = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(data?.error || "WhatsApp connection failed.");
      }

      window.location.reload();
    } catch (err) {
      submittedRef.current = false;
      setLoading(false);
      setError(err instanceof Error ? err.message : "WhatsApp connection failed.");
    }
  };

  useEffect(() => {
    if (!appId) return;

    let cancelled = false;
    const getFacebook = () => (window as Window & { FB?: FacebookSdk }).FB;

    const initialize = () => {
      const fb = getFacebook();
      if (!fb) {
        if (!cancelled) setError("Facebook SDK failed to initialize.");
        return;
      }

      fb.init({ appId, cookie: true, xfbml: true, version: "v26.0" });
      if (!cancelled) setSdkReady(true);
    };

    if (getFacebook()) {
      initialize();
    } else {
      const win = window as Window & { fbAsyncInit?: () => void };
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
  }, [appId]);

  useEffect(() => {
    let cancelled = false;

    const prepare = async () => {
      try {
        const response = await fetch("/api/integrations/meta/whatsapp/start", {
          method: "POST",
          cache: "no-store",
        });
        const data = await response.json().catch(() => null);

        if (!response.ok || !data?.state || !data?.configId || !data?.appId) {
          throw new Error(data?.error || "WhatsApp Embedded Signup is unavailable.");
        }

        stateRef.current = String(data.state);
        if (!cancelled) {
          setAppId(String(data.appId));
          setConfigId(String(data.configId));
          setSetupReady(true);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "WhatsApp Embedded Signup is unavailable.");
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
      ) return;

      let message: EmbeddedSignupMessage;
      try {
        message = typeof event.data === "string"
          ? JSON.parse(event.data)
          : event.data;
      } catch {
        return;
      }

      if (!message || message.type !== "WA_EMBEDDED_SIGNUP") return;

      const eventName = String(message.event || "").toUpperCase();

      if (eventName === "CANCEL") {
        setLoading(false);
        resetSignup();
        setError(
          message.data?.current_step
            ? "WhatsApp signup was cancelled at: " + message.data.current_step
            : "WhatsApp signup was cancelled.",
        );
        return;
      }

      if (eventName === "ERROR") {
        setLoading(false);
        resetSignup();
        setError(message.data?.error_message || "Meta reported an error during WhatsApp signup.");
        return;
      }

      if (
        eventName !== "FINISH" &&
        eventName !== "FINISH_WHATSAPP_BUSINESS_APP_ONBOARDING"
      ) return;

      sessionInfoRef.current = {
        phone_number_id: message.data?.phone_number_id,
        waba_id: message.data?.waba_id,
        business_id: message.data?.business_id,
      };

      if (!sessionInfoRef.current.waba_id) {
        setLoading(false);
        resetSignup();
        setError("Meta completed signup but did not return a WhatsApp Business Account ID. Please try again.");
        return;
      }

      void submitSignup();
    };

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  const connect = () => {
    const fb = (window as Window & { FB?: FacebookSdk }).FB;

    if (!fb || !sdkReady) {
      setError("Facebook SDK is still loading.");
      return;
    }
    if (!setupReady || !stateRef.current || !configId) {
      setError("Preparing WhatsApp connection. Please try again in a moment.");
      return;
    }

    resetSignup();
    setLoading(true);
    setError("");

    // A bounded wait prevents an incomplete Meta popup flow from leaving the button spinning forever.
    timeoutRef.current = setTimeout(() => {
      if (submittedRef.current) return;
      setLoading(false);
      setError(
        sessionInfoRef.current?.waba_id
          ? "Meta returned the business account, but the authorization code was not received. Please try connecting again."
          : "WhatsApp signup did not finish. If the Meta window was closed, try connecting again.",
      );
      resetSignup();
    }, 60000);

    try {
      fb.login(
        (response) => {
          const code = response?.authResponse?.code;
          if (!code) {
            setLoading(false);
            resetSignup();
            setError(
              response?.status === "unknown"
                ? "Meta authorization was cancelled or did not complete. Please try again."
                : "Meta did not return an authorization code. Please try again.",
            );
            return;
          }

          codeRef.current = code;
          void submitSignup();
        },
        {
          config_id: configId,
          response_type: "code",
          override_default_response_type: true,
          extras: {
            setup: {},
            featureType: "whatsapp_business_app_onboarding",
          },
        },
      );
    } catch {
      setLoading(false);
      resetSignup();
      setError("Could not open the Meta signup window. Check your browser popup settings and try again.");
    }
  };

  return (
    <div className="flex flex-col items-start gap-2">
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
      {error && (
        <p role="alert" className="max-w-xl text-sm leading-5 text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}
