import { NextResponse } from "next/server";

import { env } from "@/env.mjs";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

const VAPI_BASE_URL = env.VAPI_API_BASE_URL || "https://api.vapi.ai";
const DEMO_NUMBER = "+12012770096";

type VapiRecord = Record<string, unknown>;

function asArray(value: unknown): VapiRecord[] {
  if (!Array.isArray(value)) return [];
  return value.filter(
    (item): item is VapiRecord => Boolean(item) && typeof item === "object",
  );
}

function safeGateway(value: unknown) {
  const gateway = value && typeof value === "object"
    ? (value as Record<string, unknown>)
    : {};

  return {
    ip: typeof gateway.ip === "string" ? gateway.ip : null,
    port: typeof gateway.port === "number" ? gateway.port : null,
    netmask: typeof gateway.netmask === "number" ? gateway.netmask : null,
    inboundEnabled: typeof gateway.inboundEnabled === "boolean"
      ? gateway.inboundEnabled
      : null,
    outboundEnabled: typeof gateway.outboundEnabled === "boolean"
      ? gateway.outboundEnabled
      : null,
    outboundProtocol: typeof gateway.outboundProtocol === "string"
      ? gateway.outboundProtocol
      : null,
  };
}

async function vapiGet(path: string, apiKey: string) {
  const response = await fetch(`${VAPI_BASE_URL}${path}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      Accept: "application/json",
    },
    cache: "no-store",
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    console.error("[VAPI PROVIDER DIAGNOSTICS]", path, response.status);
    throw new Error(`Vapi request failed with status ${response.status}.`);
  }

  return payload;
}

export async function GET() {
  try {
    const sessionUser = await getCurrentUser();

    if (!sessionUser?.id) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const account = await prisma.user.findUnique({
      where: { id: sessionUser.id },
      select: { role: true },
    });

    if (account?.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden." }, { status: 403 });
    }

    if (!env.VAPI_PRIVATE_API_KEY) {
      return NextResponse.json(
        { error: "Vapi private API key is not configured." },
        { status: 503 },
      );
    }

    const [phonePayload, credentialPayload] = await Promise.all([
      vapiGet("/phone-number", env.VAPI_PRIVATE_API_KEY),
      vapiGet("/credential", env.VAPI_PRIVATE_API_KEY),
    ]);

    const phoneNumbers = asArray(phonePayload);
    const credentials = asArray(credentialPayload);

    const demoPhone = phoneNumbers.find((item) => {
      const number = typeof item.number === "string"
        ? item.number.replace(/\s/g, "")
        : "";
      return number === DEMO_NUMBER;
    });

    const phoneCredentialId =
      typeof demoPhone?.credentialId === "string"
        ? demoPhone.credentialId
        : null;

    const sipCredentials = credentials
      .filter((item) => item.provider === "byo-sip-trunk")
      .map((item) => ({
        id: typeof item.id === "string" ? item.id : null,
        name: typeof item.name === "string" ? item.name : null,
        provider: item.provider,
        gateways: Array.isArray(item.gateways)
          ? item.gateways.map(safeGateway)
          : [],
        matchesDemoPhone: Boolean(
          phoneCredentialId &&
          typeof item.id === "string" &&
          item.id === phoneCredentialId
        ),
      }));

    return NextResponse.json({
      success: true,
      demoPhone: demoPhone
        ? {
            id: typeof demoPhone.id === "string" ? demoPhone.id : null,
            number: typeof demoPhone.number === "string" ? demoPhone.number : null,
            provider: typeof demoPhone.provider === "string" ? demoPhone.provider : null,
            credentialId: phoneCredentialId,
            assistantId: typeof demoPhone.assistantId === "string"
              ? demoPhone.assistantId
              : null,
            serverUrl: typeof demoPhone.serverUrl === "string"
              ? demoPhone.serverUrl
              : typeof (demoPhone.server as Record<string, unknown> | undefined)?.url === "string"
                ? (demoPhone.server as Record<string, unknown>).url
                : null,
            status: typeof demoPhone.status === "string" ? demoPhone.status : null,
          }
        : null,
      sipCredentials,
      credentialIdMatchFound: sipCredentials.some((item) => item.matchesDemoPhone),
      note: "Read-only diagnostics. No phone numbers, credentials, assistants, or routes were changed.",
    });
  } catch (error) {
    console.error("[VAPI PROVIDER DIAGNOSTICS ERROR]", error);
    return NextResponse.json(
      { error: "Unable to inspect Vapi phone configuration." },
      { status: 502 },
    );
  }
}
