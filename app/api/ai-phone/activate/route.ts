import { NextResponse } from "next/server";

import { env } from "@/env.mjs";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { getUserSubscriptionPlan } from "@/lib/subscription";

export const maxDuration = 60;

const VAPI_BASE_URL = env.VAPI_API_BASE_URL || "https://api.vapi.ai";
const VAPI_WEBHOOK_URL = "https://www.smartcleaningdesk.com/api/ai-phone/vapi";

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
    console.error(`[${provider} PHONE PROVISIONING]`, response.status);
    throw new ProviderError(
      `${provider} request failed with status ${response.status}.`,
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

    const subscriptionPlan = await getUserSubscriptionPlan(userId);
    const supportsAIPhone =
      subscriptionPlan.title === "Business" || subscriptionPlan.title === "Pro";

    if (!subscriptionPlan.isPaid || !supportsAIPhone) {
      return NextResponse.json(
        {
          error:
            "Automatic AI Phone activation requires an active paid Business or Pro subscription. Free trials are not eligible for automatic number provisioning.",
        },
        { status: 403 },
      );
    }

    if (
      !env.SIGNALWIRE_SPACE_URL ||
      !env.SIGNALWIRE_PROJECT_ID ||
      !(env.SIGNALWIRE_API_TOKEN_PHONE || env.SIGNALWIRE_API_TOKEN) ||
      !env.VAPI_PRIVATE_API_KEY ||
      !env.VAPI_SIGNALWIRE_CREDENTIAL_ID
    ) {
      return NextResponse.json(
        { error: "Phone provisioning providers are not fully configured." },
        { status: 503 },
      );
    }

    let requestedAreaCode = "";
    try {
      const body = await request.json();
      requestedAreaCode =
        typeof body?.areaCode === "string" ? body.areaCode.trim() : "";
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
        await tx.$queryRaw`SELECT pg_advisory_xact_lock(hashtext(${userId}))`;

        const existing = await tx.phoneNumber.findFirst({
          where: {
            userId: userId,
            status: { in: ["ACTIVE", "PENDING"] },
          },
          orderBy: { purchasedAt: "desc" },
        });

        if (existing) {
          return {
            phone: existing as ProvisionedPhone,
            isExisting: true,
          };
        }

        const searchParams = new URLSearchParams({
          number_type: "local",
          max_results: "30",
        });
        if (requestedAreaCode) {
          searchParams.set("areacode", requestedAreaCode);
        }

        const searchPayload = await providerRequest(
          `${signalWire.baseUrl}/api/relay/rest/phone_numbers/search?${searchParams.toString()}`,
          {
            method: "GET",
            headers: signalWire.headers,
          },
          "SignalWire",
        );

        const candidates = Array.isArray(searchPayload?.data)
          ? searchPayload.data.filter(
              (item: unknown) =>
                isRecord(item) &&
                hasVoiceCapability(item.capabilities) &&
                /^\+1\d{10}$/.test(getString(item.number)),
            )
          : [];

        const selected = candidates[0] as JsonRecord | undefined;

        if (!selected) {
          throw new Error(
            requestedAreaCode
              ? "No available voice number was found for that area code. Try another area code."
              : "No available US voice phone numbers were returned by SignalWire.",
          );
        }

        const number = getString(selected.number);

        const purchased = await providerRequest(
          `${signalWire.baseUrl}/api/relay/rest/phone_numbers`,
          {
            method: "POST",
            headers: {
              ...signalWire.headers,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ number }),
          },
          "SignalWire",
        );

        const signalWirePhoneId = getString(purchased?.id);
        const purchasedNumber = getString(purchased?.number) || number;

        if (!signalWirePhoneId || purchasedNumber !== number) {
          throw new Error("SignalWire did not confirm the purchased phone number.");
        }

        resources.signalWirePhoneId = signalWirePhoneId;

        const swmlPayload = await providerRequest(
          `${signalWire.baseUrl}/api/fabric/resources/swml_scripts`,
          {
            method: "POST",
            headers: {
              ...signalWire.headers,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              name: `SCD Inbound ${number.slice(-4)}`,
              script_type: "calling",
              contents: {
                version: "1.0.0",
                sections: {
                  main: [
                    {
                      connect: {
                        to: `sip:%{call.to}@${env.VAPI_SIGNALWIRE_CREDENTIAL_ID}.sip.vapi.ai`,
                      },
                    },
                  ],
                },
              },
            }),
          },
          "SignalWire",
        );

        const swmlScriptId =
          getString(swmlPayload?.swml_script?.id) || getString(swmlPayload?.id);
        const scriptUrl =
          getString(swmlPayload?.swml_script?.request_url) ||
          (swmlScriptId
            ? `${signalWire.baseUrl}/relay-bins/${swmlScriptId}`
            : "");

        if (!swmlScriptId || !scriptUrl) {
          throw new Error("SignalWire did not return a usable inbound SWML script URL.");
        }

        resources.swmlScriptId = swmlScriptId;

        const vapiPhone = await providerRequest(
          `${VAPI_BASE_URL}/phone-number`,
          {
            method: "POST",
            headers: vapiHeaders,
            body: JSON.stringify({
              provider: "byo-phone-number",
              number,
              credentialId: env.VAPI_SIGNALWIRE_CREDENTIAL_ID,
              name: `${appProfile.businessName || "Smart Cleaning Desk"} Phone`.slice(0, 40),
              server: {
                url: VAPI_WEBHOOK_URL,
                timeoutSeconds: 20,
              },
            }),
          },
          "Vapi",
        );

        const vapiPhoneId = getString(vapiPhone?.id);
        if (!vapiPhoneId) {
          throw new Error("Vapi did not confirm the imported phone number.");
        }

        resources.vapiPhoneId = vapiPhoneId;

        const phone = await tx.phoneNumber.create({
          data: {
            userId: userId,
            provider: "SIGNALWIRE",
            providerId: signalWirePhoneId,
            phoneNumber: number,
            countryCode: "US",
            region: getString(selected.region) || null,
            city: getString(selected.city) || null,
            status: "PENDING",
            monthlyPriceCents: 0,
            metadata: {
              vapiPhoneNumberId: vapiPhoneId,
              swmlScriptId,
              callRelayScriptUrl: scriptUrl,
              vapiCredentialId: env.VAPI_SIGNALWIRE_CREDENTIAL_ID,
              provisioningStatus: "ROUTING_PENDING",
            },
          },
        });

        await tx.aIPhoneSettings.upsert({
          where: { businessProfileId: appProfile.id },
          create: {
            businessProfileId: appProfile.id,
            status: "READY",
            provider: "Vapi",
            phoneNumber: number,
            assistantName: `${appProfile.businessName || "AI"} Receptionist`.slice(0, 80),
            enabled: false,
          },
          update: {
            status: "READY",
            provider: "Vapi",
            phoneNumber: number,
            enabled: false,
          },
        });

        return {
          phone: phone as ProvisionedPhone,
          isExisting: false,
        };
      },
      {
        maxWait: 15000,
        timeout: 45000,
      },
    );

    resourcesPersisted = true;
    const metadata = readProvisioningMetadata(provisioning.phone.metadata);

    if (provisioning.phone.status === "PENDING") {
      if (!metadata.callRelayScriptUrl) {
        return NextResponse.json(
          {
            error:
              "The number is purchased but its routing details are incomplete. Contact support before retrying.",
            phoneNumber: provisioning.phone.phoneNumber,
          },
          { status: 409 },
        );
      }

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
              vapiPhoneNumberId: metadata.vapiPhoneNumberId,
              swmlScriptId: metadata.swmlScriptId,
              callRelayScriptUrl: metadata.callRelayScriptUrl,
              provisioningStatus: "ACTIVE",
            },
          },
        }),
        prisma.aIPhoneSettings.update({
          where: { businessProfileId: appProfile.id },
          data: {
            status: "ACTIVE",
            enabled: true,
            phoneNumber: provisioning.phone.phoneNumber,
          },
        }),
      ]);
    }

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

    // If provider resources were created but the database transaction did not commit, undo them.
    // Persisted PENDING records are intentionally retained so the next activation attempt can finish routing.
    if (!resourcesPersisted && (resources.vapiPhoneId || resources.signalWirePhoneId || resources.swmlScriptId)) {
      const vapiHeaders = {
        Authorization: `Bearer ${env.VAPI_PRIVATE_API_KEY || ""}`,
        Accept: "application/json",
      };

      if (resources.vapiPhoneId && env.VAPI_PRIVATE_API_KEY) {
        await deleteProviderResource(
          `${VAPI_BASE_URL}/phone-number/${resources.vapiPhoneId}`,
          vapiHeaders,
          "Vapi",
        );
      }

      if (resources.swmlScriptId) {
        try {
          const signalWire = getSignalWireAuth();
          await deleteProviderResource(
            `${signalWire.baseUrl}/api/fabric/resources/swml_scripts/${resources.swmlScriptId}`,
            signalWire.headers,
            "SignalWire",
          );
        } catch (cleanupError) {
          console.error("[SIGNALWIRE SWML CLEANUP CONFIGURATION ERROR]", cleanupError);
        }
      }

      if (resources.signalWirePhoneId) {
        try {
          const signalWire = getSignalWireAuth();
          await deleteProviderResource(
            `${signalWire.baseUrl}/api/relay/rest/phone_numbers/${resources.signalWirePhoneId}`,
            signalWire.headers,
            "SignalWire",
          );
        } catch (cleanupError) {
          console.error("[SIGNALWIRE CLEANUP CONFIGURATION ERROR]", cleanupError);
        }
      }
    }

    const message =
      error instanceof ProviderError
        ? "A phone provider could not complete the setup. No active number was assigned; please try again."
        : error instanceof Error
          ? error.message
          : "Unable to activate AI Phone.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
