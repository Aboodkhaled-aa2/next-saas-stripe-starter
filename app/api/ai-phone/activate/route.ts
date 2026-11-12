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
  if (
    getString(phone?.id) !== phoneNumberId ||
    actualNumber !== expectedNumber ||
    actualCredentialId !== expectedCredentialId
  ) {
    throw new ProviderError(
      "Vapi did not confirm the imported number and SIP credential. The number remains pending.",
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
      !env.VAPI_WEBHOOK_SECRET
    ) {
      return NextResponse.json(
        { error: "Phone provisioning providers are not fully configured." },
        { status: 503 },
      );
    }

    // Admin Refresh ignores purchase options and only reconnects the saved number.

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

    // Admin Refresh targets the exact number already purchased in SignalWire.
    // It must never search for or purchase a replacement number.
    const adminPhoneNumber = "+12024749177";
    const adminSignalWirePhoneId = "468c1f1b-d3e5-4404-b95d-56233af0ed53";

    const signalWireResource = await providerRequest(
      `${signalWire.baseUrl}/api/relay/rest/phone_numbers/${encodeURIComponent(adminSignalWirePhoneId)}`,
      { method: "GET", headers: signalWire.headers },
      "SignalWire",
    );
    const signalWireResourceNumber = getString(signalWireResource?.number) || getString(signalWireResource?.e164);
    const signalWireResourceId = getString(signalWireResource?.id);

    if (signalWireResourceId !== adminSignalWirePhoneId || signalWireResourceNumber.replace(/[^\d+]/g, "") !== adminPhoneNumber) {
      throw new ProviderError("SignalWire did not confirm the exact existing admin number. No changes were made.", 409);
    }

    let savedPhone = await prisma.phoneNumber.findUnique({ where: { phoneNumber: adminPhoneNumber } });
    if (savedPhone && (savedPhone.userId !== userId || savedPhone.providerId !== adminSignalWirePhoneId)) {
      throw new ProviderError("The existing admin number is assigned to a different account or resource. Manual review is required.", 409);
    }
    if (!savedPhone) {
      savedPhone = await prisma.phoneNumber.create({
        data: { userId, provider: "SIGNALWIRE", providerId: adminSignalWirePhoneId, phoneNumber: adminPhoneNumber, countryCode: "US", status: "PENDING", metadata: { provisioningStatus: "SIGNALWIRE_RESOURCE_VERIFIED", vapiPhoneNumberId: null, swmlScriptId: null, callRelayScriptUrl: null, vapiCredentialId: vapiCredentialId } },
      });
    }

    const provisioning = await prisma.$transaction(
      async (tx) => {
        await tx.$queryRaw`SELECT 1 FROM (SELECT pg_advisory_xact_lock(hashtext(${userId}))) AS advisory_lock`;
        let phone = await tx.phoneNumber.findUnique({ where: { phoneNumber: adminPhoneNumber } });
        if (!phone || phone.userId !== userId || phone.providerId !== adminSignalWirePhoneId) throw new ProviderError("The verified admin number is not safely assigned to this account.", 409);
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
            const vapiPhone = existingVapiPhone ?? await providerRequest(
              `${VAPI_BASE_URL}/phone-number`,
              {
                method: "POST",
                headers: vapiHeaders,
                body: JSON.stringify({
                  provider: "byo-phone-number",
                  number: phone.phoneNumber,
                  numberE164CheckEnabled: false,
                  credentialId: vapiCredentialId,
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
                  provisioningStatus: "VAPI_IMPORTED",
                },
              },
            });
          }

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
        return { phone: phone as ProvisionedPhone, isExisting: true, setupError };
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
