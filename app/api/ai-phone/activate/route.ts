import { NextResponse } from "next/server";

import { env } from "@/env.mjs";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

export const maxDuration = 60;

const VAPI_BASE_URL = env.VAPI_API_BASE_URL || "https://api.vapi.ai";
const APP_BASE_URL =
  process.env.VERCEL_ENV === "preview" && process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : env.NEXT_PUBLIC_APP_URL || "https://www.smartcleaningdesk.com";
const VAPI_WEBHOOK_URL = `${APP_BASE_URL}/api/ai-phone/vapi`;

type JsonRecord = Record<string, unknown>;

type ProvisionedPhone = {
  id: string;
  phoneNumber: string;
  providerId: string;
  status: string;
  metadata: unknown;
};

type ProviderResources = {
  signalWirePhoneId?: string;
  vapiPhoneId?: string;
  swmlScriptId?: string;
};

class ProviderError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

function isRecord(value: unknown): value is JsonRecord {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function getString(value: unknown) {
  return typeof value === "string" ? value : "";
}

function hasVoiceCapability(value: unknown) {
  if (Array.isArray(value)) {
    return value.includes("voice");
  }

  return isRecord(value) && value.voice === true;
}

function getSignalWireAuth() {
  const apiToken = env.SIGNALWIRE_API_TOKEN_PHONE || env.SIGNALWIRE_API_TOKEN;

  if (!env.SIGNALWIRE_SPACE_URL || !env.SIGNALWIRE_PROJECT_ID || !apiToken) {
    throw new Error("SignalWire phone provisioning is not configured.");
  }

  return {
    baseUrl: env.SIGNALWIRE_SPACE_URL.replace(/\/$/, ""),
    headers: {
      Authorization:
        "Basic " +
        Buffer.from(`${env.SIGNALWIRE_PROJECT_ID}:${apiToken}`).toString("base64"),
      Accept: "application/json",
    },
  };
}

async function providerRequest(
  url: string,
  init: RequestInit,
  provider: "SignalWire" | "Vapi",
) {
  const response = await fetch(url, {
    ...init,
    signal: AbortSignal.timeout(8000),
    cache: "no-store",
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const providerMessage = isRecord(payload)
      ? getString(payload.message) ||
        getString(payload.error) ||
        getString(payload.details)
      : "";
    // Log the provider's response detail (never request headers or credentials)
    // so a 400 can be diagnosed without exposing secrets.
    console.error(`[${provider} PHONE PROVISIONING]`, {
      status: response.status,
      message: providerMessage.slice(0, 1000),
      response: payload,
    });
    throw new ProviderError(
      `${provider} request failed with status ${response.status}.${providerMessage ? ` ${providerMessage.slice(0, 300)}` : ""}`,
      response.status,
    );
  }

  return payload;
}

async function deleteProviderResource(
  url: string,
  headers: Record<string, string>,
  provider: "SignalWire" | "Vapi",
) {
  try {
    const response = await fetch(url, {
      method: "DELETE",
      headers,
      signal: AbortSignal.timeout(10000),
      cache: "no-store",
    });

    if (!response.ok && response.status !== 404) {
      console.error(`[${provider} PROVISIONING CLEANUP]`, response.status);
    }
  } catch (error) {
    console.error(`[${provider} PROVISIONING CLEANUP ERROR]`, error);
  }
}

function readProvisioningMetadata(value: unknown) {
  const metadata = isRecord(value) ? value : {};

  return {
    vapiPhoneNumberId: getString(metadata.vapiPhoneNumberId),
    swmlScriptId: getString(metadata.swmlScriptId),
    callRelayScriptUrl: getString(metadata.callRelayScriptUrl),
    vapiCredentialId: getString(metadata.vapiCredentialId),
  };
}

async function finishSignalWireRouting(phoneId: string, scriptUrl: string) {
  const signalWire = getSignalWireAuth();

  await providerRequest(
    `${signalWire.baseUrl}/api/relay/rest/phone_numbers/${encodeURIComponent(phoneId)}`,
    {
      method: "PUT",
      headers: {
        ...signalWire.headers,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        call_handler: "relay_script",
        call_relay_script_url: scriptUrl,
        call_receive_mode: "voice",
      }),
    },
    "SignalWire",
  );
}

export async function POST(request: Request) {
  const resources: ProviderResources = {};
  let resourcesPersisted = false;

  try {
    const user = await getCurrentUser();

    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const userId = user.id;

    const isAdmin = user.role === "ADMIN";

    if (!isAdmin) {
      return NextResponse.json(
        { error: "AI Phone provisioning is currently restricted to admin testing." },
        { status: 403 },
      );
    }

    if (
      !env.SIGNALWIRE_SPACE_URL ||
      !env.SIGNALWIRE_PROJECT_ID ||
      !(env.SIGNALWIRE_API_TOKEN_PHONE || env.SIGNALWIRE_API_TOKEN) ||
      !env.VAPI_PRIVATE_API_KEY ||
      !env.VAPI_SIGNALWIRE_CREDENTIAL_ID ||
      !env.VAPI_WEBHOOK_SECRET
    ) {
      return NextResponse.json(
        { error: "Phone provisioning providers are not fully configured." },
        { status: 503 },
      );
    }

    let requestedAreaCode = "";
    let retryExistingOnly = false;
    try {
      const body = await request.json();
      requestedAreaCode =
        typeof body?.areaCode === "string" ? body.areaCode.trim() : "";
      // Admin testing must only resume an already-purchased number.
      // Never allow this temporary admin-only flow to buy a replacement number.
      retryExistingOnly = isAdmin || body?.action === "retry-existing";
    } catch {
      requestedAreaCode = "";
    }

    if (requestedAreaCode && !/^\d{3}$/.test(requestedAreaCode)) {
      return NextResponse.json(
        { error: "Area code must be exactly 3 digits." },
        { status: 400 },
      );
    }

    const appProfile = await prisma.businessProfile.findUnique({
      where: { userId: userId },
      select: {
        id: true,
        businessName: true,
        onboardingCompleted: true,
      },
    });

    if (!appProfile?.onboardingCompleted) {
      return NextResponse.json(
        { error: "Complete your business profile before activating AI Phone." },
        { status: 400 },
      );
    }

    const signalWire = getSignalWireAuth();
    const vapiHeaders = {
      Authorization: `Bearer ${env.VAPI_PRIVATE_API_KEY}`,
      Accept: "application/json",
      "Content-Type": "application/json",
    };

    const provisioning = await prisma.$transaction(
      async (tx) => {
        // Serialize activation attempts for this account while provisioning.
        await tx.$queryRaw`SELECT pg_advisory_xact_lock(hashtext(${userId}))`;

        let phone = await tx.phoneNumber.findFirst({
          where: {
            userId,
            status: { in: ["ACTIVE", "PENDING"] },
          },
          orderBy: { purchasedAt: "desc" },
        });
        const isExisting = Boolean(phone);

        if (!phone && retryExistingOnly) {
          throw new ProviderError(
            "No existing SignalWire number was found to reconnect. No number was purchased.",
            404,
          );
        }

        if (!phone) {
          const searchParams = new URLSearchParams({
            number_type: "local",
            max_results: "30",
          });
          if (requestedAreaCode) {
            searchParams.set("areacode", requestedAreaCode);
          }

          const searchPayload = await providerRequest(
            `${signalWire.baseUrl}/api/relay/rest/phone_numbers/search?${searchParams.toString()}`,
            { method: "GET", headers: signalWire.headers },
            "SignalWire",
          );

          const candidates = Array.isArray(searchPayload?.data)
            ? searchPayload.data.filter((item: unknown) => {
                if (!isRecord(item)) return false;

                const candidateNumber =
                  getString(item.number) || getString(item.e164);
                const capabilities = item.capabilities;
                const supportsVoice =
                  capabilities === undefined ||
                  (Array.isArray(capabilities)
                    ? capabilities.includes("voice")
                    : isRecord(capabilities) && capabilities.voice === true);

                return /^\+1\d{10}$/.test(candidateNumber) && supportsVoice;
              })
            : [];
          const selected = candidates[0] as JsonRecord | undefined;

          if (!selected) {
            throw new Error(
              requestedAreaCode
                ? "No available voice number was found for that area code. Try another area code."
                : "No available US voice phone numbers were returned by SignalWire.",
            );
          }

          const number = getString(selected.number) || getString(selected.e164);
          const purchased = await providerRequest(
            `${signalWire.baseUrl}/api/relay/rest/phone_numbers`,
            {
              method: "POST",
              headers: { ...signalWire.headers, "Content-Type": "application/json" },
              body: JSON.stringify({ number }),
            },
            "SignalWire",
          );

          const signalWirePhoneId = getString(purchased?.id);
          const purchasedNumber = getString(purchased?.number) || number;
          if (!signalWirePhoneId || purchasedNumber !== number) {
            throw new Error("SignalWire did not confirm the purchased phone number.");
          }

          // Create the durable PENDING record before attempting any downstream integration.
          // Keep the provider's actual purchase identifier so retries reuse this exact number.
          phone = await tx.phoneNumber.create({
            data: {
              userId,
              provider: "SIGNALWIRE",
              providerId: signalWirePhoneId,
              phoneNumber: number,
              countryCode: "US",
              region: getString(selected.region) || null,
              city: getString(selected.city) || null,
              status: "PENDING",
              metadata: {
                provisioningStatus: "PURCHASED",
                vapiPhoneNumberId: null,
                swmlScriptId: null,
                callRelayScriptUrl: null,
                vapiCredentialId: env.VAPI_SIGNALWIRE_CREDENTIAL_ID,
              },
            },
          });
        }

        await tx.aIPhoneSettings.upsert({
          where: { businessProfileId: appProfile.id },
          create: {
            businessProfileId: appProfile.id,
            status: "READY",
            provider: "Vapi",
            phoneNumber: phone.phoneNumber,
            assistantName: `${appProfile.businessName || "AI"} Receptionist`.slice(0, 80),
            enabled: false,
          },
          update: {
            status: "READY",
            provider: "Vapi",
            phoneNumber: phone.phoneNumber,
            enabled: false,
          },
        });

        let metadata = readProvisioningMetadata(phone.metadata);
        let setupError: string | null = null;

        // Each successful provider step is saved immediately. If a later step fails,
        // the transaction commits the PENDING phone and the next request resumes it.
        try {
          // Reuse the existing shared SignalWire Relay Bin URL for every number.
          // The Relay Bin is managed in SignalWire; do not call the Fabric swml_scripts
          // endpoint with a Relay Bin ID (they are different resource types).
          const sharedSwmlScriptId = "4882d3a4-79f0-4daf-b033-f734ee6061c1";
          const sharedSwmlRequestUrl =
            "https://gearnest-llc.signalwire.com/relay-bins/4882d3a4-79f0-4daf-b033-f734ee6061c1";

          if (
            metadata.swmlScriptId !== sharedSwmlScriptId ||
            metadata.callRelayScriptUrl !== sharedSwmlRequestUrl ||
            metadata.vapiCredentialId !== env.VAPI_SIGNALWIRE_CREDENTIAL_ID
          ) {
            metadata = {
              ...metadata,
              swmlScriptId: sharedSwmlScriptId,
              callRelayScriptUrl: sharedSwmlRequestUrl,
              vapiCredentialId: env.VAPI_SIGNALWIRE_CREDENTIAL_ID,
            };
            phone = await tx.phoneNumber.update({
              where: { id: phone.id },
              data: {
                metadata: {
                  ...metadata,
                  vapiPhoneNumberId: metadata.vapiPhoneNumberId || null,
                  provisioningStatus: "SHARED_SWML_CONFIGURED",
                },
              },
            });
          }

          if (!metadata.vapiPhoneNumberId) {
            // The webhook returns the company-specific assistant dynamically
            // through Vapi's assistant-request event; no shared assistant is hardcoded.
            const vapiPhone = await providerRequest(
              `${VAPI_BASE_URL}/phone-number`,
              {
                method: "POST",
                headers: vapiHeaders,
                body: JSON.stringify({
                  provider: "byo-phone-number",
                  number: phone.phoneNumber,
                  numberE164CheckEnabled: false,
                  credentialId: env.VAPI_SIGNALWIRE_CREDENTIAL_ID,
                  name: `${appProfile.businessName || "Smart Cleaning Desk"} Phone`.slice(0, 40),
                  server: {
                    url: VAPI_WEBHOOK_URL,
                    timeoutSeconds: 20,
                    headers: {
                      Authorization: `Bearer ${env.VAPI_WEBHOOK_SECRET}`,
                    },
                  },
                }),
              },
              "Vapi",
            );

            const vapiPhoneNumberId = getString(vapiPhone?.id);
            if (!vapiPhoneNumberId) {
              throw new Error("Vapi did not confirm the imported phone number.");
            }

            metadata = { ...metadata, vapiPhoneNumberId };
            phone = await tx.phoneNumber.update({
              where: { id: phone.id },
              data: {
                metadata: {
                  ...metadata,
                  vapiCredentialId: env.VAPI_SIGNALWIRE_CREDENTIAL_ID,
                  provisioningStatus: "VAPI_IMPORTED",
                },
              },
            });
          }
        } catch (error) {
          setupError =
            error instanceof Error ? error.message : "Provider setup is incomplete.";
          console.error("[AI PHONE RESUMABLE PROVISIONING]", {
            phoneNumber: phone.phoneNumber,
            stage: metadata.vapiPhoneNumberId
              ? "ROUTING"
              : metadata.swmlScriptId &&
                  metadata.vapiCredentialId === env.VAPI_SIGNALWIRE_CREDENTIAL_ID
                ? "VAPI_IMPORT"
                : "SWML_CREATION",
            error: setupError,
          });
        }

        return {
          phone: phone as ProvisionedPhone,
          isExisting,
          setupError,
        };
      },
      {
        maxWait: 15000,
        timeout: 60000,
      },
    );

    const metadata = readProvisioningMetadata(provisioning.phone.metadata);

    if (!metadata.callRelayScriptUrl || !metadata.vapiPhoneNumberId) {
      return NextResponse.json(
        {
          success: false,
          status: "PENDING",
          existingNumber: provisioning.isExisting,
          phoneNumber: provisioning.phone.phoneNumber,
          message:
            "Your number is safely saved. Setup is incomplete and can be resumed without purchasing another number.",
          error: provisioning.setupError || "Phone setup is still pending.",
        },
        { status: 202 },
      );
    }

    // Reapply routing on retries too; this operation is safe to repeat for the same number.
    await finishSignalWireRouting(
      provisioning.phone.providerId,
      metadata.callRelayScriptUrl,
    );

    await prisma.$transaction([
      prisma.phoneNumber.update({
        where: { id: provisioning.phone.id },
        data: {
          status: "ACTIVE",
          metadata: {
            ...metadata,
            vapiCredentialId: env.VAPI_SIGNALWIRE_CREDENTIAL_ID,
            provisioningStatus: "ACTIVE",
          },
        },
      }),
      prisma.aIPhoneSettings.upsert({
        where: { businessProfileId: appProfile.id },
        create: {
          businessProfileId: appProfile.id,
          status: "ACTIVE",
          provider: "Vapi",
          phoneNumber: provisioning.phone.phoneNumber,
          assistantName: `${appProfile.businessName || "AI"} Receptionist`.slice(0, 80),
          enabled: true,
        },
        update: {
          status: "ACTIVE",
          enabled: true,
          phoneNumber: provisioning.phone.phoneNumber,
        },
      }),
    ]);

    const finalSettings = await prisma.aIPhoneSettings.findUnique({
      where: { businessProfileId: appProfile.id },
      select: {
        phoneNumber: true,
        assistantName: true,
        status: true,
        enabled: true,
      },
    });

    return NextResponse.json({
      success: true,
      existingNumber: provisioning.isExisting,
      phoneNumber: provisioning.phone.phoneNumber,
      status: "ACTIVE",
      aiPhoneSettings: finalSettings,
      message: provisioning.isExisting
        ? "Your existing AI Phone number is ready."
        : "Your AI Phone number has been assigned and connected.",
    });
  } catch (error) {
    console.error("[AI PHONE ACTIVATION ERROR]", error);

    // Purchased numbers are intentionally not deleted on downstream failures.
    // They remain recorded as PENDING so retries can resume without buying a replacement.

    const message =
      error instanceof ProviderError
        ? "A phone provider could not complete the setup. No active number was assigned; please try again."
        : error instanceof Error
          ? error.message
          : "Unable to activate AI Phone.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
