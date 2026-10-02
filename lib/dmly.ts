import { env } from "@/env.mjs";

type DmlyRequestOptions = {
  baseUrl?: string;
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  path: string;
  body?: unknown;
};

type DmlyApiErrorPayload = {
  message?: string;
  error?: string;
  [key: string]: unknown;
};

async function dmlyRequest<T>({
  baseUrl = env.DMLY_AGENCY_API_URL,
  method = "GET",
  path,
  body,
}: DmlyRequestOptions): Promise<T> {
  const response = await fetch(
    `${baseUrl.replace(/\/$/, "")}/${path.replace(/^\//, "")}`,
    {
      method,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "x-api-key": env.DMLY_API_KEY,
      },
      body: body === undefined ? undefined : JSON.stringify(body),
      cache: "no-store",
    },
  );

  const responseText = await response.text();
  let data: unknown = null;

  if (responseText) {
    try {
      data = JSON.parse(responseText);
    } catch {
      data = responseText;
    }
  }

  if (!response.ok) {
    const payload =
      typeof data === "object" && data !== null
        ? (data as DmlyApiErrorPayload)
        : null;

    const message =
      typeof payload?.message === "string"
        ? payload.message
        : typeof payload?.error === "string"
          ? payload.error
          : `DMLY API request failed with status ${response.status}`;

    throw new Error(message);
  }

  return data as T;
}

export type DmlyWorkspaceResponse = {
  id?: string;
  uuid?: string;
  workspaceId?: string;
  name?: string;
  plan?: string | null;
  status?: string;
  created_at?: string;
  [key: string]: unknown;
};

export type DmlyWorkspacesListResponse = {
  data: DmlyWorkspaceResponse[];
  meta?: {
    current_page?: number;
    last_page?: number;
    per_page?: number;
    total?: number;
    [key: string]: unknown;
  };
};

export async function createDmlyWorkspace(input: {
  name: string;
}) {
  return dmlyRequest<DmlyWorkspaceResponse>({
    method: "POST",
    path: "workspaces",
    body: input,
  });
}

export async function listDmlyWorkspaces() {
  return dmlyRequest<DmlyWorkspacesListResponse>({
    method: "GET",
    path: "workspaces",
  });
}

export async function sendDmlyMessage(input: {
  channel: "whatsapp" | "messenger" | "instagram";
  workspaceId: string;
  contactId?: string;
  phoneNumber?: string;
  text: string;
}) {
  const pathByChannel = {
    whatsapp: "v1/messages/whatsapp/sendtext",
    messenger: "v1/messages/messenger/sendtext",
    instagram: "v1/messages/instagram/sendtext",
  } as const;

  const body: Record<string, unknown> = {
    workspace: { id: input.workspaceId },
    textMessage: input.text,
  };

  if (input.contactId) {
    body.contact = { id: input.contactId };
  } else if (input.channel === "whatsapp" && input.phoneNumber) {
    body.recipient = { phoneNumber: input.phoneNumber };
  } else {
    throw new Error("A contactId is required for Messenger and Instagram.");
  }

  return dmlyRequest({
    baseUrl: env.DMLY_REST_API_URL,
    method: "POST",
    path: pathByChannel[input.channel],
    body,
  });
}
