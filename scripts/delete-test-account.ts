#!/usr/bin/env node
/**
 * Safely remove one allowlisted test account.
 * Dry-run is the default. Real deletion requires --confirm.
 */
import { PrismaClient } from "@prisma/client";
import Stripe from "stripe";
import { appendFile } from "node:fs/promises";
import { hostname } from "node:os";

const prisma = new PrismaClient();
const CONFIRM = process.argv.includes("--confirm");
const emailArg = process.argv.find((arg, index) => index > 1 && !arg.startsWith("--"));
const normalizeEmail = (value) => String(value ?? "").trim().toLowerCase();
const email = normalizeEmail(emailArg);
const allowlist = (process.env.TEST_ACCOUNT_EMAILS ?? "")
  .split(",")
  .map(normalizeEmail)
  .filter(Boolean);
const production = process.env.NODE_ENV === "production" || process.env.VERCEL_ENV === "production";
const auditPath = process.env.TEST_ACCOUNT_DELETE_AUDIT ?? ".test-account-delete-audit.jsonl";

function stop(message) {
  console.error(`REFUSED: ${message}`);
  process.exitCode = 1;
}

async function audit(event, details = {}) {
  const record = {
    event,
    atUtc: new Date().toISOString(),
    actor: process.env.USER ?? process.env.USERNAME ?? "unknown",
    host: hostname(),
    targetEmail: email,
    ...details,
  };
  await appendFile(auditPath, JSON.stringify(record) + "\n", { mode: 0o600 });
}

async function requestJson(url, options = {}) {
  const response = await fetch(url, options);
  if (!response.ok && response.status !== 404) {
    const body = await response.text().catch(() => "");
    throw new Error(`Provider request failed (${response.status}): ${body.slice(0, 300)}`);
  }
  return response.status === 404 ? null : response.json().catch(() => ({}));
}

try {
  if (!email || email === "all" || email === "*" || email.includes(",")) {
    stop("Pass exactly one email address. Bulk deletion is not supported.");
    process.exit(1);
  }
  if (!allowlist.length) {
    stop("TEST_ACCOUNT_EMAILS is empty. Configure an explicit comma-separated allowlist.");
    process.exit(1);
  }
  if (!allowlist.includes(email)) {
    stop("This email is not in TEST_ACCOUNT_EMAILS.");
    process.exit(1);
  }
  if (production && process.env.ALLOW_PROD_DELETE !== "true") {
    stop("Production deletion is disabled. ALLOW_PROD_DELETE=true is required.");
    process.exit(1);
  }
  if (CONFIRM && process.env.ALLOW_ACCOUNT_DELETE !== "true") {
    stop("Real deletion requires ALLOW_ACCOUNT_DELETE=true as an additional explicit guard.");
    process.exit(1);
  }

  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      phoneNumbers: true,
      businessProfile: { include: { aiPhoneSettings: true } },
      conversations: { include: { messages: true } },
      metaIntegrations: true,
      fiwanoChannels: true,
    },
  });
  if (!user) {
    console.log("No account found. Nothing to delete.");
    await audit("account_not_found");
    process.exit(0);
  }

  const phones = user.phoneNumbers.map((phone) => ({
    provider: phone.provider,
    providerId: phone.providerId,
    phoneNumber: phone.phoneNumber,
    status: phone.status,
  }));
  const preview = {
    email: user.email,
    plan: user.plan,
    stripeCustomerId: user.stripeCustomerId,
    stripeSubscriptionId: user.stripeSubscriptionId,
    phoneNumbers: phones.map(({ phoneNumber, provider, status }) => ({ phoneNumber, provider, status })),
    vapiPhoneNumberIdPresent: Boolean(user.businessProfile?.aiPhoneSettings?.provider),
    conversations: user.conversations.length,
    messages: user.conversations.reduce((sum, conversation) => sum + conversation.messages.length, 0),
    metaIntegrations: user.metaIntegrations.length,
    fiwanoChannels: user.fiwanoChannels.length,
  };
  console.log(JSON.stringify({ mode: CONFIRM ? "DELETE" : "DRY_RUN", account: preview }, null, 2));

  if (!CONFIRM) {
    await audit("dry_run", { plan: user.plan, phoneCount: phones.length, conversationCount: user.conversations.length });
    console.log(`Dry-run only. To delete, set ALLOW_ACCOUNT_DELETE=true and pass --confirm. Audit: ${auditPath}`);
    process.exit(0);
  }

  // Cancel Stripe subscriptions before deleting the customer.
  if (user.stripeSubscriptionId && process.env.STRIPE_API_KEY) {
    const stripe = new Stripe(process.env.STRIPE_API_KEY);
    try {
      await stripe.subscriptions.cancel(user.stripeSubscriptionId);
    } catch (error) {
      if (!(error instanceof Stripe.errors.StripeInvalidRequestError && error.code === "resource_missing")) throw error;
    }
  }
  if (user.stripeCustomerId && process.env.STRIPE_API_KEY) {
    try {
      await new Stripe(process.env.STRIPE_API_KEY).customers.del(user.stripeCustomerId);
    } catch (error) {
      if (!(error instanceof Stripe.errors.StripeInvalidRequestError && error.code === "resource_missing")) throw error;
    }
  } else if (user.stripeSubscriptionId || user.stripeCustomerId) {
    throw new Error("Stripe IDs exist but STRIPE_API_KEY is missing; refusing to delete local account first.");
  }

  // Release SignalWire-owned numbers. Provider ID is the SignalWire resource ID.
  for (const phone of user.phoneNumbers) {
    if (String(phone.provider).toUpperCase() !== "SIGNALWIRE") continue;
    const space = process.env.SIGNALWIRE_SPACE_URL;
    const projectId = process.env.SIGNALWIRE_PROJECT_ID;
    const token = process.env.SIGNALWIRE_API_TOKEN;
    if (!space || !projectId || !token) {
      throw new Error("SignalWire number exists but SIGNALWIRE_SPACE_URL / SIGNALWIRE_PROJECT_ID / SIGNALWIRE_API_TOKEN are not all configured.");
    }
    const auth = Buffer.from(`${projectId}:${token}`).toString("base64");
    await requestJson(`${space.replace(/\/$/, "")}/api/relay/rest/phone_numbers/${encodeURIComponent(phone.providerId)}`, {
      method: "DELETE",
      headers: { Authorization: `Basic ${auth}` },
    });
  }

  // Vapi cleanup is only attempted when an explicit Vapi phone-number ID is stored
  // in the supported metadata shape. Never guess a Vapi ID from a SignalWire ID.
  const aiSettings = user.businessProfile?.aiPhoneSettings;
  const metadata = aiSettings && typeof aiSettings === "object" ? aiSettings : null;
  const vapiPhoneNumberId = metadata?.provider === "VAPI" && typeof metadata?.phoneNumber === "string"
    ? metadata.phoneNumber
    : null;
  if (vapiPhoneNumberId) {
    if (!process.env.VAPI_PRIVATE_API_KEY) {
      throw new Error("Vapi phone number was detected but VAPI_PRIVATE_API_KEY is missing.");
    }
    await requestJson(`https://api.vapi.ai/phone-number/${encodeURIComponent(vapiPhoneNumberId)}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${process.env.VAPI_PRIVATE_API_KEY}` },
    });
  }

  // Remove account-owned records and token/session data. User deletion cascades
  // through relations explicitly marked onDelete: Cascade in Prisma.
  await prisma.$transaction(async (tx) => {
    await tx.message.deleteMany({ where: { conversation: { userId: user.id } } });
    await tx.conversation.deleteMany({ where: { userId: user.id } });
    await tx.verificationToken.deleteMany({ where: { identifier: email } });
    await tx.passwordResetToken.deleteMany({ where: { userId: user.id } });
    await tx.session.deleteMany({ where: { userId: user.id } });
    await tx.account.deleteMany({ where: { userId: user.id } });
    await tx.user.delete({ where: { id: user.id } });
  });

  await audit("account_deleted", {
    plan: user.plan,
    phoneCount: phones.length,
    conversationCount: user.conversations.length,
    stripeCustomerRemoved: Boolean(user.stripeCustomerId),
    stripeSubscriptionCancelled: Boolean(user.stripeSubscriptionId),
  });
  console.log("Account deleted. Audit event written.");
} catch (error) {
  console.error("Cleanup failed; inspect provider state before retrying:", error instanceof Error ? error.message : "unknown error");
  try { await audit("delete_failed", { errorType: error instanceof Error ? error.name : "unknown" }); } catch {}
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
