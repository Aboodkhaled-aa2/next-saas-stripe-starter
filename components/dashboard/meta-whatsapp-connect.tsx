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

const DIAGNOSTIC = "[WhatsApp signup diagnostic]";

export function MetaWhatsAppConnect() {
  const [sdkReady, setSdkReady] = useState(false);
  const [setupReady, setSetupReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [configId, setConfigId] = useState<string | null>(null);
  const [appId, setAppId] = useState<string | null>(null);
  const [diagnostics, setDiagnostics] = useState<string[]>([]);

  const recordDiagnostic = (message: string) => {
    setDiagnostics((current) => [...current, message].slice(-8));
  };

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
    if (submittedRef.current) {
      console.info(DIAGNOSTIC, "Callback skipped: request already submitted.");
      return;
    }

    const code = codeRef.current;
    const state = stateRef.current;
    const sessionInfo = sessionInfoRef.current;

    recordDiagnostic(`Prerequisites: code=${Boolean(code)}, state=${Boolean(state)}, WABA=${Boolean(sessionInfo?.waba_id)}, phone=${Boolean(sessionInfo?.phone_number_id)}.`);
    console.info(DIAGNOSTIC, "Checking signup prerequisites.", {
      hasAuthorizationCode: Boolean(code),
      hasOAuthState: Boolean(state),
      hasWabaId: Boolean(sessionInfo?.waba_id),
      hasPhoneNumberId: Boolean(sessionInfo?.phone_number_id),
      hasBusinessId: Boolean(sessionInfo?.business_id),
    });

    // Meta returns the authorization code and selected assets on separate channels.
    if (!code || !state || !sessionInfo?.waba_id) return;

    submittedRef.current = true;
    clearSignupTimeout();
    console.info(DIAGNOSTIC, "Sending signup data to the application callback.");

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
      recordDiagnostic(`Server callback: HTTP ${response.status} (${response.ok ? "success" : "failed"}).`);
      console.info(DIAGNOSTIC, "Application callback responded.", {
        status: response.status,
        ok: response.ok,
        hasErrorMessage: Boolean(data?.error),
      });

      if (!response.ok) {
        throw new Error(data?.error || "WhatsApp connection failed.");
      }

      console.info(DIAGNOSTIC, "Signup completed successfully; reloading integration page.");
      window.location.reload();
    } catch (err) {
      submittedRef.current = false;
      setLoading(false);
      console.error(DIAGNOSTIC, "Application callback failed.", {
        message: err instanceof Error ? err.message : "Unknown callback error",
      });
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
        console.error(DIAGNOSTIC, "Facebook SDK initialization callback ran without FB.");
        if (!cancelled) setError("Facebook SDK failed to initialize.");
        return;
      }

      try {
        fb.init({ appId, cookie: true, xfbml: true, version: "v26.0" });
        console.info(DIAGNOSTIC, "Facebook SDK initialized.", { version: "v26.0" });
        if (!cancelled) setSdkReady(true);
      } catch (err) {
        console.error(DIAGNOSTIC, "Facebook SDK initialization failed.", {
          message: err instanceof Error ? err.message : "Unknown SDK initialization error",
        });
        if (!cancelled) setError("Facebook SDK failed to initialize.");
      }
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
        script.onerror = () => {
          console.error(DIAGNOSTIC, "Facebook SDK script failed to load.");
          if (!cancelled) setError("Facebook SDK failed to load. Check network or content blockers.");
        };
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
      console.info(DIAGNOSTIC, "Requesting signup configuration.");
      try {
        const response = await fetch("/api/integrations/meta/whatsapp/start", {
          method: "POST",
          cache: "no-store",
        });
        const data = await response.json().catch(() => null);

        console.info(DIAGNOSTIC, "Signup configuration response.", {
          status: response.status,
          ok: response.ok,
          hasState: Boolean(data?.state),
          hasConfigId: Boolean(data?.configId),
          hasAppId: Boolean(data?.appId),
        });

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
        console.error(DIAGNOSTIC, "Could not prepare signup.", {
          message: err instanceof Error ? err.message : "Unknown setup error",
        });
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
      // Safe diagnostic: record message origin and payload type before filtering.
      // Never log message contents, authorization codes, tokens, or account IDs.
      console.info(DIAGNOSTIC, "Window message received.", {
        origin: event.origin,
        dataType: typeof event.data,
      });
      recordDiagnostic(`Window message: origin=${event.origin}, data type=${typeof event.data}.`);

      let originUrl: URL;
      try {
        originUrl = new URL(event.origin);
      } catch {
        return;
      }

      // Meta may deliver Embedded Signup messages from different HTTPS
      // subdomains of facebook.com. Match the hostname boundary safely.
      const isFacebookOrigin =
        originUrl.protocol === "https:" &&
        (originUrl.hostname === "facebook.com" ||
          originUrl.hostname.endsWith(".facebook.com"));

      if (!isFacebookOrigin) return;

      let message: EmbeddedSignupMessage;
      try {
        message = typeof event.data === "string"
          ? JSON.parse(event.data)
          : event.data;
      } catch {
        // Report only payload shape, never the raw message text.
        const rawLength = typeof event.data === "string" ? event.data.length : 0;
        recordDiagnostic(`Facebook message was not JSON (string length=${rawLength}).`);
        console.warn(DIAGNOSTIC, "Received a non-JSON message from an approved Facebook origin.", {
          dataType: typeof event.data,
          stringLength: rawLength,
        });
        return;
      }

      if (!message) {
        recordDiagnostic("Meta sent an empty message.");
        return;
      }

      const dataKeys = message.data && typeof message.data === "object"
        ? Object.keys(message.data).sort().join(", ") || "none"
        : "not an object";
      const eventName = String(message.event || "").toUpperCase();
      recordDiagnostic(`Meta message: type=${String(message.type || "missing")}, event=${eventName || "missing"}, data keys=${dataKeys}.`);
      if (message.type !== "WA_EMBEDDED_SIGNUP") return;

      console.info(DIAGNOSTIC, "Received Embedded Signup event.", {
        origin: event.origin,
        event: eventName || "missing",
        hasWabaId: Boolean(message.data?.waba_id),
        hasPhoneNumberId: Boolean(message.data?.phone_number_id),
        hasBusinessId: Boolean(message.data?.business_id),
        currentStep: message.data?.current_step || null,
        hasMetaErrorMessage: Boolean(message.data?.error_message),
      });

      if (eventName === "CANCEL") {
        recordDiagnostic(`Meta signup cancelled${message.data?.current_step ? ` at ${message.data.current_step}` : ""}.`);
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
        recordDiagnostic("Meta reported an Embedded Signup error.");
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
        recordDiagnostic(`Meta finish event had no WABA ID. Available data keys: ${dataKeys}.`);
        console.error(DIAGNOSTIC, "Meta sent a finish event without a WABA ID.");
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
    setDiagnostics(["Signup started. Waiting for Meta authorization and account details."]);
    console.info(DIAGNOSTIC, "User started Embedded Signup.");

    timeoutRef.current = setTimeout(() => {
      if (submittedRef.current) return;
      console.error(DIAGNOSTIC, "Signup timed out waiting for both Meta response channels.", {
        receivedAuthorizationCode: Boolean(codeRef.current),
        receivedWabaId: Boolean(sessionInfoRef.current?.waba_id),
        receivedPhoneNumberId: Boolean(sessionInfoRef.current?.phone_number_id),
      });
      setLoading(false);
      setError(
        sessionInfoRef.current?.waba_id
          ? "Meta returned the business account, but the authorization code was not received. Please try connecting again."
          : codeRef.current
            ? "Meta authorization succeeded, but the WhatsApp business account details were not received."
            : "WhatsApp signup did not finish. Check the browser console for diagnostic details.",
      );
      resetSignup();
    }, 60000);

    try {
      fb.login(
        (response) => {
          const code = response?.authResponse?.code;
          console.info(DIAGNOSTIC, "Facebook login callback received.", {
            status: response?.status || "missing",
            hasAuthorizationCode: Boolean(code),
          });

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

          recordDiagnostic("Meta authorization code received. Waiting for WhatsApp account details.");
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
            sessionInfoVersion: "3",
          },
        },
      );
    } catch (err) {
      console.error(DIAGNOSTIC, "FB.login threw an exception.", {
        message: err instanceof Error ? err.message : "Unknown FB.login error",
      });
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
      {diagnostics.length > 0 && (
        <div className="w-full max-w-xl rounded-lg border border-slate-700 bg-slate-900/70 p-3 text-xs leading-5 text-slate-300" aria-live="polite">
          <p className="mb-1 font-semibold text-slate-100">WhatsApp connection diagnostics</p>
          <ol className="list-decimal space-y-1 pl-4">
            {diagnostics.map((item, index) => <li key={`${index}-${item}`}>{item}</li>)}
          </ol>
        </div>
      )}
    </div>
  );
}
