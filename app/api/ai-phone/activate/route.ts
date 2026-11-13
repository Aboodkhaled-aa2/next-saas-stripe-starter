import { NextResponse } from "next/server";

import { env } from "@/env.mjs";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { getUserSubscriptionPlan } from "@/lib/subscription";
import { isAIPhoneTrialTester } from "@/lib/ai-phone-access";

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

async function getSignalWireVapiCredentialId(headers: Record<string, string>) {
  // Prefer the credential already configured for the working SignalWire/Vapi setup.
  // Fall back to discovering it by its explicit dashboard name only when unset.
  if (env.VAPI_SIGNALWIRE_CREDENTIAL_ID) {
    return env.VAPI_SIGNALWIRE_CREDENTIAL_ID;
  }

  const payload = await providerRequest(`${VAPI_BASE_URL}/credential?limit=100`, { method: "GET", headers }, "Vapi");
  const credentials = Array.isArray(payload)
    ? payload
    : isRecord(payload) && Array.isArray(payload.data)
      ? payload.data
      : [];
  const match = credentials.find((item: unknown) => {
    if (!isRecord(item)) return false;
    return getString(item.name).trim().toLowerCase() === "signalwire inbound trunk" && getString(item.provider) === "byo-sip-trunk";
  });
  const credentialId = isRecord(match) ? getString(match.id) : "";
  if (!credentialId) throw new ProviderError("Vapi could not find the saved SIP trunk credential named SignalWire Inbound Trunk. Check that it exists in this Vapi account.", 409);
  return credentialId;
}

async function findExistingVapiPhoneNumber(
  headers: Record<string, string>,
  expectedNumber: string,
  expectedCredentialId: string,
) {
  const payload = await providerRequest(
    `${VAPI_BASE_URL}/phone-number?limit=1000`,
    { method: "GET", headers },
    "Vapi",
  );
  const phoneNumbers = Array.isArray(payload)
    ? payload
    : isRecord(payload) && Array.isArray(payload.data)
      ? payload.data
      : [];
  const existing = phoneNumbers.find((item: unknown) =>
    isRecord(item) && getString(item.number) === expectedNumber,
  );
  if (!isRecord(existing)) return null;

  if (
    getString(existing.provider) !== "byo-phone-number" ||
    getString(existing.credentialId) !== expectedCredentialId ||
    !getString(existing.id)
  ) {
    throw new ProviderError(
      "This number already exists in Vapi but is connected to a different provider credential. It was not changed.",
      409,
    );
  }

  return {
    id: getString(existing.id),
    number: getString(existing.number),
    credentialId: getString(existing.credentialId),
  };
}

async function verifyVapiPhoneNumber(
  phoneNumberId: string,
  expectedNumber: string,
  expectedCredentialId: string,
) {
  const headers = {
    Authorization: `Bearer ${env.VAPI_PRIVATE_API_KEY}`,
    Accept: "application/json",
  };
  const phone = await providerRequest(
    `${VAPI_BASE_URL}/phone-number/${encodeURIComponent(phoneNumberId)}`,
    { method: "GET", headers },
    "Vapi",
  );
  const actualNumber = getString(phone?.number);
  const actualCredentialId = getString(phone?.credentialId);
  const actualServerUrl = getString(phone?.serverUrl);
  const actualAssistantId = phone?.assistantId ?? null;
  if (
    getString(phone?.id) !== phoneNumberId ||
    actualNumber !== expectedNumber ||
    actualCredentialId !== expectedCredentialId ||
    actualServerUrl !== VAPI_WEBHOOK_URL ||
    actualAssistantId !== null
  ) {
    throw new ProviderError(
      "Vapi did not confirm the number, SignalWire credential, and shared Smart Cleaning Desk assistant-request routing. The number remains pending.",
      409,
    );
  }
}

async function ensureSignalWireSwmlScript(
  credentialId: string,
  existingScriptId: string,
) {
  const signalWire = getSignalWireAuth();
  const headers = {
    ...signalWire.headers,
    "Content-Type": "application/json",
  };

  if (existingScriptId) {
    try {
      const existing = await providerRequest(
        `${signalWire.baseUrl}/api/fabric/resources/swml_scripts/${encodeURIComponent(existingScriptId)}`,
        { method: "GET", headers: signalWire.headers },
        "SignalWire",
      );
      const actualId = getString(existing?.id);
      if (actualId === existingScriptId) return actualId;
    } catch (error) {
      if (!(error instanceof ProviderError) || error.status !== 404) throw error;
    }
  }

  const created = await providerRequest(
    `${signalWire.baseUrl}/api/fabric/resources/swml_scripts`,
    {
      method: "POST",
      headers,
      body: JSON.stringify({
        name: "Smart Cleaning Desk Vapi Inbound",
        script_type: "calling",
        contents: {
          version: "1.0.0",
          sections: {
            main: [
              {
                connect: {
                  to: `sip:%{call.to}@${credentialId}.sip.vapi.ai`,
                },
              },
            ],
          },
        },
      }),
    },
    "SignalWire",
  );

  const scriptId = getString(created?.id) || getString(created?.swml_script?.id);
  if (!scriptId) {
    throw new ProviderError("SignalWire did not return the created SWML Script ID.", 502);
  }

  const verified = await providerRequest(
    `${signalWire.baseUrl}/api/fabric/resources/swml_scripts/${encodeURIComponent(scriptId)}`,
    { method: "GET", headers: signalWire.headers },
    "SignalWire",
  );
  if (getString(verified?.id) !== scriptId) {
    throw new ProviderError("SignalWire did not verify the new SWML Script.", 502);
  }
  return scriptId;
}

async function finishSignalWireRouting(phoneNumber: string, scriptId: string) {
  const signalWire = getSignalWireAuth();
  const headers = {
    ...signalWire.headers,
    "Content-Type": "application/json",
  };

  const listing = await providerRequest(
    `${signalWire.baseUrl}/api/fabric/phone_number_addresses?page_size=1000&page_number=0`,
    { method: "GET", headers: signalWire.headers },
    "SignalWire",
  );
  const addresses = Array.isArray(listing?.data) ? listing.data : [];
  const address = addresses.find(
    (item: unknown) =>
      isRecord(item) &&
      getString(item.phone_number) === phoneNumber &&
      getString(item.handler_type) === "calling",
  );

  let assigned: unknown;
  if (isRecord(address) && getString(address.id)) {
    assigned = await providerRequest(
      `${signalWire.baseUrl}/api/fabric/phone_number_addresses/${encodeURIComponent(getString(address.id))}`,
      {
        method: "PATCH",
        headers,
        body: JSON.stringify({ resource_id: scriptId }),
      },
      "SignalWire",
    );
  } else {
    assigned = await providerRequest(
      `${signalWire.baseUrl}/api/fabric/phone_number_addresses`,
      {
        method: "POST",
        headers,
        body: JSON.stringify({
          number: phoneNumber,
          handler_type: "calling",
          resource_id: scriptId,
        }),
      },
      "SignalWire",
    );
  }

  if (!isRecord(assigned) || getString(assigned.resource_id) !== scriptId) {
    throw new ProviderError("SignalWire did not confirm the SWML Script assignment to this number.", 502);
  }

  const verifiedListing = await providerRequest(
    `${signalWire.baseUrl}/api/fabric/phone_number_addresses?page_size=1000&page_number=0`,
    { method: "GET", headers: signalWire.headers },
    "SignalWire",
  );
  const verifiedAddresses = Array.isArray(verifiedListing?.data)
    ? verifiedListing.data
    : [];
  const verified = verifiedAddresses.find(
    (item: unknown) =>
      isRecord(item) &&
      getString(item.id) === getString(assigned?.id) &&
      getString(item.phone_number) === phoneNumber &&
      getString(item.handler_type) === "calling" &&
      getString(item.resource_id) === scriptId,
  );
  if (!verified) {
    throw new ProviderError("SignalWire could not verify inbound call routing for this number.", 502);
  }
}

export async function POST(request: Request) {
    try {
    const user = await getCurrentUser();

    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const userId = user.id;

    const isAdmin = user.role === "ADMIN" && user.email?.toLowerCase() === "tawilabood8@gmail.com";
    const isTrialTester = isAIPhoneTrialTester(user.email);
    const subscriptionPlan = isAdmin || isTrialTester ? null : await getUserSubscriptionPlan(user.id);
    const canUseAIPhone = Boolean(
      subscriptionPlan?.isPaid &&
        (subscriptionPlan.title === "Business" || subscriptionPlan.title === "Pro"),
    );

    if (!isAdmin && !isTrialTester && !canUseAIPhone) {
      return NextResponse.json(
        { error: "AI Phone requires a Business or Pro plan." },
        { status: 403 },
      );
    }

    if (
      !env.SIGNALWIRE_SPACE_URL ||
      !env.SIGNALWIRE_PROJECT_ID ||
      !(env.SIGNALWIRE_API_TOKEN_PHONE || env.SIGNALWIRE_API_TOKEN) ||
      !env.VAPI_PRIVATE_API_KEY ||
      !env.VAPI_WEBHOOK_SECRET
    ) {
      return NextResponse.json(
        { error: "Phone provisioning providers are not fully configured." },
        { status: 503 },
      );
    }

    let requestedAreaCode = "";
    let retryExisting = false;
    try {
      const body = await request.json();
      requestedAreaCode = typeof body?.areaCode === "string" ? body.areaCode.trim() : "";
      retryExisting = body?.action === "retry-existing";
    } catch {
      // Empty request body uses the default local-number search.
    }

    if (retryExisting && !isAdmin && !isTrialTester && !canUseAIPhone) {
      return NextResponse.json({ error: "Reconnect Existing Number requires an eligible Business or Pro plan." }, { status: 403 });
    }

    if (requestedAreaCode && !/^\d{3}$/.test(requestedAreaCode)) {
      return NextResponse.json({ error: "Area code must be exactly 3 digits." }, { status: 400 });
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
    const vapiCredentialId = await getSignalWireVapiCredentialId(vapiHeaders);

    let targetPhoneNumber = "";
    let targetSignalWirePhoneId = "";
    let isExistingNumber = false;

    if (isAdmin) {
      // Preserve the exact tested admin number; admin refresh never buys a replacement.
      targetPhoneNumber = "+12024749177";
      targetSignalWirePhoneId = "468c1f1b-d3e5-4404-b95d-56233af0ed53";
      isExistingNumber = true;
    } else if (retryExisting) {
      const existing = await prisma.phoneNumber.findFirst({
        where: { userId, status: { in: ["ACTIVE", "PENDING"] } },
        orderBy: { purchasedAt: "desc" },
        select: { phoneNumber: true, providerId: true },
      });
      if (!existing) {
        return NextResponse.json(
          { error: "There is no existing number on this account to reconnect. Use Get Number first." },
          { status: 409 },
        );
      }
      targetPhoneNumber = existing.phoneNumber;
      targetSignalWirePhoneId = existing.providerId;
      isExistingNumber = true;
    } else {
      // Serialize acquisition so simultaneous clicks cannot buy duplicate numbers.
      const acquired = await prisma.$transaction(async (tx) => {
        await tx.$queryRaw`SELECT 1 FROM (SELECT pg_advisory_xact_lock(hashtext(${userId}))) AS advisory_lock`;
        const existing = await tx.phoneNumber.findFirst({
          where: { userId, status: { in: ["ACTIVE", "PENDING"] } },
          orderBy: { purchasedAt: "desc" },
        });
        if (existing) {
          return { phoneNumber: existing.phoneNumber, providerId: existing.providerId, existing: true };
        }

        const searchParams = new URLSearchParams({ number_type: "local", max_results: "30" });
        if (requestedAreaCode) searchParams.set("areacode", requestedAreaCode);
        const searchPayload = await providerRequest(
          `${signalWire.baseUrl}/api/relay/rest/phone_numbers/search?${searchParams.toString()}`,
          { method: "GET", headers: signalWire.headers },
          "SignalWire",
        );
        const candidates = Array.isArray(searchPayload?.data)
          ? searchPayload.data.filter((item: unknown) => {
              if (!isRecord(item)) return false;
              const candidateNumber = getString(item.number) || getString(item.e164);
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
          throw new ProviderError(
            requestedAreaCode
              ? "No available voice number was found for that area code. Try another area code."
              : "No available US voice phone numbers were returned by SignalWire.",
            404,
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
        const purchasedId = getString(purchased?.id);
        const purchasedNumber = getString(purchased?.number) || number;
        if (!purchasedId || purchasedNumber !== number) {
          throw new ProviderError("SignalWire did not confirm the purchased phone number.", 502);
        }

        await tx.phoneNumber.create({
          data: {
            userId,
            provider: "SIGNALWIRE",
            providerId: purchasedId,
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
              vapiCredentialId,
            },
          },
        });
        return { phoneNumber: number, providerId: purchasedId, existing: false };
      }, { maxWait: 15000, timeout: 60000 });

      targetPhoneNumber = acquired.phoneNumber;
      targetSignalWirePhoneId = acquired.providerId;
      isExistingNumber = acquired.existing;
    }

    const signalWireResource = await providerRequest(
      `${signalWire.baseUrl}/api/relay/rest/phone_numbers/${encodeURIComponent(targetSignalWirePhoneId)}`,
      { method: "GET", headers: signalWire.headers },
      "SignalWire",
    );
    const signalWireResourceNumber = getString(signalWireResource?.number) || getString(signalWireResource?.e164);
    const signalWireResourceId = getString(signalWireResource?.id);
    if (
      signalWireResourceId !== targetSignalWirePhoneId ||
      signalWireResourceNumber.replace(/[^\d+]/g, "") !== targetPhoneNumber
    ) {
      throw new ProviderError("SignalWire did not confirm the exact purchased number and resource. The number remains pending.", 409);
    }

    let savedPhone = await prisma.phoneNumber.findUnique({ where: { phoneNumber: targetPhoneNumber } });
    if (
      savedPhone &&
      (savedPhone.userId !== userId || savedPhone.providerId !== targetSignalWirePhoneId)
    ) {
      throw new ProviderError("This phone number is already assigned to a different account or provider resource.", 409);
    }
    if (!savedPhone) {
      savedPhone = await prisma.phoneNumber.create({
        data: {
          userId,
          provider: "SIGNALWIRE",
          providerId: targetSignalWirePhoneId,
          phoneNumber: targetPhoneNumber,
          countryCode: "US",
          status: "PENDING",
          metadata: {
            provisioningStatus: "SIGNALWIRE_RESOURCE_VERIFIED",
            vapiPhoneNumberId: null,
            swmlScriptId: null,
            callRelayScriptUrl: null,
            vapiCredentialId,
          },
        },
      });
    }

    const provisioning = await prisma.$transaction(
      async (tx) => {
        await tx.$queryRaw`SELECT 1 FROM (SELECT pg_advisory_xact_lock(hashtext(${userId}))) AS advisory_lock`;
        let phone = await tx.phoneNumber.findUnique({ where: { phoneNumber: targetPhoneNumber } });
        if (!phone || phone.userId !== userId || phone.providerId !== targetSignalWirePhoneId) {
          throw new ProviderError("The verified phone number is not safely assigned to this account.", 409);
        }
        await tx.aIPhoneSettings.upsert({
          where: { businessProfileId: appProfile.id },
          create: { businessProfileId: appProfile.id, status: "READY", provider: "Vapi", phoneNumber: phone.phoneNumber, assistantName: `${appProfile.businessName || "AI"} Receptionist`.slice(0, 80), enabled: false },
          update: { status: "READY", provider: "Vapi", phoneNumber: phone.phoneNumber, enabled: false },
        });
        let metadata = readProvisioningMetadata(phone.metadata);
        let setupError: string | null = null;
        try {
          metadata = { ...metadata, vapiCredentialId: vapiCredentialId };
          phone = await tx.phoneNumber.update({ where: { id: phone.id }, data: { metadata: { ...metadata, vapiPhoneNumberId: metadata.vapiPhoneNumberId || null, provisioningStatus: "SIGNALWIRE_RESOURCE_VERIFIED" } } });
          if (!metadata.vapiPhoneNumberId) {
            // Reuse an earlier successful Vapi import if a previous request stopped
            // before its ID was saved in our database. Never create a duplicate.
            const existingVapiPhone = await findExistingVapiPhoneNumber(
              vapiHeaders,
              phone.phoneNumber,
              vapiCredentialId,
            );
            if (existingVapiPhone) {
              metadata = { ...metadata, vapiPhoneNumberId: existingVapiPhone.id };
            } else {
              const createdVapiPhone = await providerRequest(
                `${VAPI_BASE_URL}/phone-number`,
                {
                  method: "POST",
                  headers: vapiHeaders,
                  body: JSON.stringify({
                    provider: "byo-phone-number",
                    number: phone.phoneNumber,
                    numberE164CheckEnabled: false,
                    credentialId: vapiCredentialId,
                    assistantId: null,
                    squadId: null,
                    name: `${appProfile.businessName || "Smart Cleaning Desk"} Phone`.slice(0, 40),
                    serverUrl: VAPI_WEBHOOK_URL,
                    serverUrlSecret: env.VAPI_WEBHOOK_SECRET,
                  }),
                },
                "Vapi",
              );
              const createdId = getString(createdVapiPhone?.id);
              if (!createdId) {
                throw new Error("Vapi did not confirm the imported phone number.");
              }
              metadata = { ...metadata, vapiPhoneNumberId: createdId };
            }
          }

          // Always repair the Vapi phone configuration, including numbers that
          // already have a saved Vapi ID. A prior import may have left a stale
          // assistant or webhook configuration behind.
          const vapiPhoneNumberId = metadata.vapiPhoneNumberId;
          if (!vapiPhoneNumberId) {
            throw new Error("Vapi phone number ID is missing after import.");
          }
          await providerRequest(
            `${VAPI_BASE_URL}/phone-number/${encodeURIComponent(vapiPhoneNumberId)}`,
            {
              method: "PATCH",
              headers: vapiHeaders,
              body: JSON.stringify({
                provider: "byo-phone-number",
                number: phone.phoneNumber,
                credentialId: vapiCredentialId,
                assistantId: null,
                squadId: null,
                serverUrl: VAPI_WEBHOOK_URL,
                serverUrlSecret: env.VAPI_WEBHOOK_SECRET,
              }),
            },
            "Vapi",
          );
          phone = await tx.phoneNumber.update({
            where: { id: phone.id },
            data: {
              metadata: {
                ...metadata,
                provisioningStatus: "VAPI_SHARED_ASSISTANT_ROUTING_CONFIGURED",
              },
            },
          });

          const swmlScriptId = await ensureSignalWireSwmlScript(
            vapiCredentialId,
            metadata.swmlScriptId,
          );
          metadata = { ...metadata, swmlScriptId, callRelayScriptUrl: "" };
          phone = await tx.phoneNumber.update({
            where: { id: phone.id },
            data: {
              metadata: {
                ...metadata,
                provisioningStatus: "SWML_SCRIPT_READY",
              },
            },
          });
        } catch (error) {
          setupError = error instanceof Error ? error.message : "Provider setup is incomplete.";
          console.error("[AI PHONE RESUMABLE PROVISIONING]", { phoneNumber: phone.phoneNumber, stage: metadata.vapiPhoneNumberId ? "ROUTING" : "VAPI_IMPORT", error: setupError });
        }
        return { phone: phone as ProvisionedPhone, isExisting: isExistingNumber, setupError };
      },
      { maxWait: 15000, timeout: 60000 },
    );
    const metadata = readProvisioningMetadata(provisioning.phone.metadata);

    if (!metadata.swmlScriptId || !metadata.vapiPhoneNumberId) {
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

    // Confirm Vapi has the exact imported number and SIP credential before marking it active.
    await verifyVapiPhoneNumber(
      metadata.vapiPhoneNumberId,
      provisioning.phone.phoneNumber,
      vapiCredentialId,
    );

    // Reapply routing on retries too; this operation is safe to repeat for the same number.
    await finishSignalWireRouting(
      provisioning.phone.phoneNumber,
      metadata.swmlScriptId,
    );

    await prisma.$transaction([
      prisma.phoneNumber.update({
        where: { id: provisioning.phone.id },
        data: {
          status: "ACTIVE",
          metadata: {
            ...metadata,
            vapiCredentialId: vapiCredentialId,
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
