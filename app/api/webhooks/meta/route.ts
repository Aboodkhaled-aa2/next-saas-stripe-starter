import { createHmac, timingSafeEqual } from "crypto";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/db";
import { runCustomerAgent } from "@/lib/ai/customer-agent-runtime";

const GRAPH_VERSION = process.env.META_GRAPH_VERSION || "v26.0";
const GRAPH_BASE = `https://graph.facebook.com/${GRAPH_VERSION}`;
const GRAPH_VERIFY_MODE = "subscribe";

function verifySignature(body: string, signature: string, appSecret: string) {
  if (!signature.startsWith("sha256=")) return false;
  const received = Buffer.from(signature.slice(7), "hex");
  const expected = createHmac("sha256", appSecret).update(body).digest();
  return received.length === expected.length && timingSafeEqual(received, expected);
}

type MetaMessageEvent = {
  sender?: { id?: string };
  recipient?: { id?: string };
  message?: { mid?: string; text?: string };
};

type WhatsAppMessage = {
  id?: string;
  from?: string;
  timestamp?: string;
  type?: string;
  text?: { body?: string };
};

async function resolveIntegration(
  channel: "FACEBOOK" | "INSTAGRAM",
  recipientId: string,
) {
  if (channel === "FACEBOOK") {
    return prisma.metaIntegration.findFirst({
      where: { platform: "FACEBOOK", pageId: recipientId },
      select: {
        id: true,
        userId: true,
        accessToken: true,
        pageId: true,
        instagramAccountId: true,
      },
    });
  }

  return prisma.metaIntegration.findFirst({
    where: {
      platform: "INSTAGRAM",
      instagramAccountId: recipientId,
    },
    select: {
      id: true,
      userId: true,
      accessToken: true,
      instagramAccountId: true,
    },
  });
}

async function resolveWhatsAppIntegration(
  wabaId: string | undefined,
  phoneNumberId: string | undefined,
) {
  if (!wabaId && !phoneNumberId) return null;

  return prisma.metaIntegration.findFirst({
    where: {
      platform: "WHATSAPP",
      OR: [
        ...(wabaId ? [{ whatsappBusinessId: wabaId }] : []),
        ...(phoneNumberId ? [{ whatsappPhoneNumberId: phoneNumberId }] : []),
      ],
    },
    select: {
      id: true,
      userId: true,
      accessToken: true,
      whatsappPhoneNumberId: true,
      whatsappBusinessId: true,
    },
  });
}

async function sendFacebookMessage(
  accessToken: string,
  recipientId: string,
  text: string,
) {
  const response = await fetch(`${GRAPH_BASE}/me/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      recipient: { id: recipientId },
      message: { text },
    }),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.error?.message || "Facebook message send failed.");
  }

  return data;
}

async function sendInstagramMessage(
  accessToken: string,
  instagramAccountId: string,
  recipientId: string,
  text: string,
) {
  const response = await fetch(`${GRAPH_BASE}/${instagramAccountId}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      recipient: { id: recipientId },
      message: { text },
    }),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.error?.message || "Instagram message send failed.");
  }

  return data;
}

async function sendWhatsAppMessage(
  accessToken: string,
  phoneNumberId: string,
  recipientPhone: string,
  text: string,
) {
  const response = await fetch(`${GRAPH_BASE}/${phoneNumberId}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: recipientPhone,
      type: "text",
      text: { preview_url: false, body: text },
    }),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.error?.message || "WhatsApp message send failed.");
  }

  return data;
}

async function handleMetaMessage(
  channel: "FACEBOOK" | "INSTAGRAM",
  event: MetaMessageEvent,
) {
  const senderId = event.sender?.id;
  const recipientId = event.recipient?.id;
  const text = event.message?.text?.trim();

  if (!senderId || !recipientId || !text) return;

  const integration = await resolveIntegration(channel, recipientId);
  if (!integration) return;

  const conversation = await prisma.conversation.upsert({
    where: {
      userId_channel_externalConversationId: {
        userId: integration.userId,
        channel,
        externalConversationId: senderId,
      },
    },
    update: { lastMessageAt: new Date() },
    create: {
      userId: integration.userId,
      channel,
      externalConversationId: senderId,
      customerExternalId: senderId,
      lastMessageAt: new Date(),
    },
  });

  if (event.message?.mid) {
    const duplicate = await prisma.message.findUnique({
      where: {
        conversationId_externalMessageId: {
          conversationId: conversation.id,
          externalMessageId: event.message.mid,
        },
      },
      select: { id: true },
    });

    if (duplicate) return;
  }

  await prisma.message.create({
    data: {
      conversationId: conversation.id,
      direction: "INBOUND",
      externalMessageId: event.message?.mid ?? null,
      senderExternalId: senderId,
      text,
    },
  });

  try {
    const result = await runCustomerAgent({
      userId: integration.userId,
      message: text,
      previousResponseId: conversation.aiResponseId ?? undefined,
    });

    const reply = result.text.trim();
    if (!reply) return;

    const sendResult =
      channel === "FACEBOOK"
        ? await sendFacebookMessage(integration.accessToken, senderId, reply)
        : await sendInstagramMessage(
            integration.accessToken,
            integration.instagramAccountId!,
            senderId,
            reply,
          );

    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        direction: "OUTBOUND",
        text: reply,
        metadata: {
          aiResponseId: result.responseId,
          externalSendResult: sendResult,
        },
      },
    });

    await prisma.conversation.update({
      where: { id: conversation.id },
      data: {
        aiResponseId: result.responseId,
        lastMessageAt: new Date(),
      },
    });
  } catch (error) {
    console.error(`${channel} AI response/send failed:`, error);
  }
}

async function handleWhatsAppMessage(
  integration: {
    id: string;
    userId: string;
    accessToken: string;
    whatsappPhoneNumberId: string | null;
  },
  message: WhatsAppMessage,
) {
  const senderId = message.from;
  const text = message.text?.body?.trim();

  if (!senderId || !text) return;

  const conversation = await prisma.conversation.upsert({
    where: {
      userId_channel_externalConversationId: {
        userId: integration.userId,
        channel: "WHATSAPP",
        externalConversationId: senderId,
      },
    },
    update: { lastMessageAt: new Date() },
    create: {
      userId: integration.userId,
      channel: "WHATSAPP",
      externalConversationId: senderId,
      customerExternalId: senderId,
      lastMessageAt: new Date(),
    },
  });

  if (message.id) {
    const duplicate = await prisma.message.findUnique({
      where: {
        conversationId_externalMessageId: {
          conversationId: conversation.id,
          externalMessageId: message.id,
        },
      },
      select: { id: true },
    });

    if (duplicate) return;
  }

  await prisma.message.create({
    data: {
      conversationId: conversation.id,
      direction: "INBOUND",
      externalMessageId: message.id ?? null,
      senderExternalId: senderId,
      text,
    },
  });

  try {
    const result = await runCustomerAgent({
      userId: integration.userId,
      message: text,
      previousResponseId: conversation.aiResponseId ?? undefined,
    });

    const reply = result.text.trim();
    if (!reply || !integration.whatsappPhoneNumberId) return;

    const sendResult = await sendWhatsAppMessage(
      integration.accessToken,
      integration.whatsappPhoneNumberId,
      senderId,
      reply,
    );

    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        direction: "OUTBOUND",
        text: reply,
        metadata: {
          aiResponseId: result.responseId,
          externalSendResult: sendResult,
        },
      },
    });

    await prisma.conversation.update({
      where: { id: conversation.id },
      data: {
        aiResponseId: result.responseId,
        lastMessageAt: new Date(),
      },
    });
  } catch (error) {
    console.error("WHATSAPP AI response/send failed:", error);
  }
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const mode = url.searchParams.get("hub.mode");
  const verifyToken = url.searchParams.get("hub.verify_token");
  const challenge = url.searchParams.get("hub.challenge");
  const configuredVerifyToken = process.env.META_WEBHOOK_VERIFY_TOKEN;

  if (
    mode !== GRAPH_VERIFY_MODE ||
    !configuredVerifyToken ||
    verifyToken !== configuredVerifyToken ||
    !challenge
  ) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  return new NextResponse(challenge, { status: 200 });
}

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("x-hub-signature-256");

  try {
    const payload = JSON.parse(body) as {
      object?: string;
      entry?: Array<{
        id?: string;
        messaging?: MetaMessageEvent[];
        changes?: Array<{
          field?: string;
          value?: {
            metadata?: { phone_number_id?: string };
            messages?: WhatsAppMessage[];
          };
        }>;
      }>;
    };

    const appSecret =
      payload.object === "instagram"
        ? process.env.META_INSTAGRAM_APP_SECRET
        : process.env.META_APP_SECRET;

    if (!signature || !appSecret || !verifySignature(body, signature, appSecret)) {
      return new NextResponse("Invalid signature", { status: 401 });
    }

    if (payload.object === "page" || payload.object === "instagram") {
      const channel = payload.object === "page" ? "FACEBOOK" : "INSTAGRAM";

      for (const entry of payload.entry ?? []) {
        for (const event of entry.messaging ?? []) {
          await handleMetaMessage(channel, event);
        }
      }

      return new NextResponse("EVENT_RECEIVED", { status: 200 });
    }

    if (payload.object === "whatsapp_business_account") {
      for (const entry of payload.entry ?? []) {
        const wabaId = entry.id;

        for (const change of entry.changes ?? []) {
          const phoneNumberId = change.value?.metadata?.phone_number_id;
          const integration = await resolveWhatsAppIntegration(
            wabaId,
            phoneNumberId,
          );

          if (!integration) continue;

          for (const message of change.value?.messages ?? []) {
            await handleWhatsAppMessage(integration, message);
          }
        }
      }

      return new NextResponse("EVENT_RECEIVED", { status: 200 });
    }

    return new NextResponse("EVENT_RECEIVED", { status: 200 });
  } catch (error) {
    console.error("Meta webhook processing error:", error);
    return new NextResponse("Invalid payload", { status: 400 });
  }
}
