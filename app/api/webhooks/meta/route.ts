import { createHmac, timingSafeEqual } from "crypto";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/db";
import { runCustomerAgent } from "@/lib/ai/customer-agent-runtime";

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

async function resolveIntegration(channel: "FACEBOOK" | "INSTAGRAM", recipientId: string) {
  if (channel === "FACEBOOK") {
    return prisma.metaIntegration.findFirst({
      where: { platform: "FACEBOOK", pageId: recipientId },
      select: { id: true, userId: true },
    });
  }

  return prisma.metaIntegration.findFirst({
    where: {
      platform: "INSTAGRAM",
      instagramAccountId: recipientId,
    },
    select: { id: true, userId: true },
  });
}

async function handleMessage(channel: "FACEBOOK" | "INSTAGRAM", event: MetaMessageEvent) {
  const senderId = event.sender?.id;
  const recipientId = event.recipient?.id;
  const text = event.message?.text?.trim();

  if (!senderId || !recipientId || !text) return;

  const integration = await resolveIntegration(channel, recipientId);
  if (!integration) return;

  const externalConversationId = senderId;

  const conversation = await prisma.conversation.upsert({
    where: {
      userId_channel_externalConversationId: {
        userId: integration.userId,
        channel,
        externalConversationId,
      },
    },
    update: {
      lastMessageAt: new Date(),
    },
    create: {
      userId: integration.userId,
      channel,
      externalConversationId,
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
    });

    if (result.text.trim()) {
      await prisma.message.create({
        data: {
          conversationId: conversation.id,
          direction: "OUTBOUND",
          text: result.text.trim(),
          metadata: { aiResponseId: result.responseId },
        },
      });

      await prisma.conversation.update({
        where: { id: conversation.id },
        data: { aiResponseId: result.responseId, lastMessageAt: new Date() },
      });
    }
  } catch (error) {
    console.error("Meta AI response failed:", error);
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
  const appSecret = process.env.META_APP_SECRET;

  if (!signature || !appSecret || !verifySignature(body, signature, appSecret)) {
    return new NextResponse("Invalid signature", { status: 401 });
  }

  try {
    const payload = JSON.parse(body) as {
      object?: string;
      entry?: Array<{
        id?: string;
        messaging?: MetaMessageEvent[];
      }>;
    };

    const channel =
      payload.object === "page"
        ? "FACEBOOK"
        : payload.object === "instagram"
          ? "INSTAGRAM"
          : null;

    if (!channel) {
      return new NextResponse("EVENT_RECEIVED", { status: 200 });
    }

    for (const entry of payload.entry ?? []) {
      for (const event of entry.messaging ?? []) {
        await handleMessage(channel, event);
      }
    }

    return new NextResponse("EVENT_RECEIVED", { status: 200 });
  } catch (error) {
    console.error("Meta webhook processing error:", error);
    return new NextResponse("Invalid payload", { status: 400 });
  }
}
