const FIWANO_BASE_URL = "https://fiwano.com/api/v1";

function getApiKey() {
  const apiKey = process.env.FIWANO_API_KEY;
  if (!apiKey) {
    throw new Error("FIWANO_API_KEY is not configured");
  }
  return apiKey;
}

async function fiwanoRequest<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const response = await fetch(`${FIWANO_BASE_URL}${path}`, {
    ...init,
    headers: {
      "X-API-Key": getApiKey(),
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
    cache: "no-store",
  });

  const text = await response.text();
  let data: unknown = null;

  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = { detail: text || "Empty response" };
  }

  if (!response.ok) {
    const detail =
      typeof data === "object" &&
      data !== null &&
      "detail" in data
        ? String((data as { detail?: unknown }).detail)
        : "Fiwano request failed";

    throw new Error(`Fiwano ${response.status}: ${detail}`);
  }

  return data as T;
}

export type FiwanoChannelType = "whatsapp" | "instagram" | "facebook";

export type FiwanoSetupUrlResponse = {
  setup_url: string;
  session_id: string;
  expires_at: string;
};

export type FiwanoExchangeResponse = {
  channel_id: string;
  channel_type: FiwanoChannelType;
  name?: string | null;
  phone_number_id?: string | null;
  phone_number?: string | null;
  ig_account_id?: string | null;
  ig_username?: string | null;
  page_id?: string | null;
  webhook_url?: string | null;
  webhook_secret?: string | null;
  webhook_events?: string[] | null;
};

export async function listFiwanoRedirects() {
  return fiwanoRequest<{
    redirects: Array<{ id: string; uri_pattern: string; created_at?: string | null }>;
  }>("/redirects");
}

export async function addFiwanoRedirect(uriPattern: string) {
  return fiwanoRequest<{ id: string; uri_pattern: string }>("/redirects", {
    method: "POST",
    body: JSON.stringify({ uri_pattern: uriPattern }),
  });
}

export async function createFiwanoSetupUrl(
  channelType: FiwanoChannelType,
  redirectUri: string,
) {
  return fiwanoRequest<FiwanoSetupUrlResponse>("/channels/setup-url", {
    method: "POST",
    body: JSON.stringify({
      channel_type: channelType,
      redirect_uri: redirectUri,
    }),
  });
}

export async function exchangeFiwanoCode(
  code: string,
  webhookUrl: string,
  webhookSecret: string,
  channelType: FiwanoChannelType,
) {
  const webhookEvents =
    channelType === "whatsapp"
      ? [
          "message.received",
          "message.sent",
          "message.delivered",
          "message.read",
          "message.failed",
        ]
      : ["message.received", "message.delivered", "message.read"];

  return fiwanoRequest<FiwanoExchangeResponse>("/channels/exchange-code", {
    method: "POST",
    body: JSON.stringify({
      code,
      webhook_url: webhookUrl,
      webhook_secret: webhookSecret,
      webhook_events: webhookEvents,
    }),
  });
}

export async function sendFiwanoMessage(
  channelId: string,
  recipient: string,
  text: string,
) {
  return fiwanoRequest<{
    success: boolean;
    message_id?: string | null;
    error?: string | null;
    error_code?: number | null;
    status?: string | null;
  }>("/messages/send", {
    method: "POST",
    body: JSON.stringify({
      channel_id: channelId,
      recipient,
      text,
    }),
  });
}
