import { env } from "@/env.mjs";

type DmlyRequestOptions = {
  baseUrl?: string;
  method?: "GET" | "POST" | "PUT" | "DELETE";
  path: string;
  body?: unknown;
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

  const text = await response.text();
  let data: unknown = null;

  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  if (!response.ok) {
    const message =
      typeof data === "object" &&
      data !== null &&
      "message" in data &&
      typeof data.message === "string"
        ? data.message
        : `DMLY API request failed with status ${response.status}`;

    throw new Error(message);
  }

  return data as T;
}

export type DmlyWorkspaceResponse = {
  id?: string;
  workspaceId?: string;
  name?: string;
  plan?: string;
  status?: string;
  [key: string]: unknown;
};

export async function createDmlyWorkspace(input: {
  name: string;
  plan: string;
  brand?: { color?: string };
}) {
  return dmlyRequest<DmlyWorkspaceResponse>({
    method: "POST",
    path: "v1/workspaces",
    body: input,
  });
}

export async function listDmlyWorkspaces() {
  return dmlyRequest<unknown[]>({
    method: "GET",
    path: "v1/workspaces",
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
