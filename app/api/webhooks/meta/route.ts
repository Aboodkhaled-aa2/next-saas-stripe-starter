import { createHmac, randomUUID, timingSafeEqual } from "crypto";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/db";
import { runCustomerAgent } from "@/lib/ai/customer-agent-runtime";
import { stripe } from "@/lib/stripe";

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
  const response = await fetch(`https://graph.instagram.com/${instagramAccountId}/messages`, {
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

async function canUseMessaging(
  userId: string,
  channel: "FACEBOOK" | "INSTAGRAM" | "WHATSAPP",
) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      stripeSubscriptionId: true,
      trialStartedAt: true,
      trialEndsAt: true,
      plan: true,
      extraMessageCredits: true,
    },
  });

  if (!user) {
    return {
      allowed: false,
      remaining: 0,
      usesExtraCredit: false,
      reason: "Account not found.",
    };
  }

  const now = new Date();
  const isTrial = !user.stripeSubscriptionId &&
    Boolean(user.trialStartedAt && user.trialEndsAt && user.trialEndsAt > now);

  // WhatsApp is paid-only. The free trial allowance is shared by Facebook + Instagram.
  if (isTrial && channel === "WHATSAPP") {
    return {
      allowed: false,
      remaining: 0,
      usesExtraCredit: false,
      reason: "WhatsApp messaging is available after activating a paid subscription.",
    };
  }

  let periodStart: Date;
  let periodEnd: Date;
  let limit: number;

  if (isTrial) {
    periodStart = user.trialStartedAt!;
    periodEnd = user.trialEndsAt!;
    limit = 100;
  } else {
    if (!user.stripeSubscriptionId) {
      return {
        allowed: false,
        remaining: 0,
        usesExtraCredit: false,
        reason: "Your free trial has ended. Choose a plan to continue.",
      };
    }

    let subscription;
    try {
      subscription = await stripe.subscriptions.retrieve(user.stripeSubscriptionId);
    } catch (error) {
      console.error("Failed to verify subscription before messaging:", error);
      return {
        allowed: false,
        remaining: 0,
        usesExtraCredit: false,
        reason: "We could not verify your subscription. Please try again later.",
      };
    }

    if (!["active", "trialing"].includes(subscription.status)) {
      return {
        allowed: false,
        remaining: 0,
        usesExtraCredit: false,
        reason: "Messaging automation requires an active paid subscription.",
      };
    }

    periodStart = new Date(subscription.current_period_start * 1000);
    periodEnd = new Date(subscription.current_period_end * 1000);
    limit = user.plan === "PRO" ? 5000 : user.plan === "BUSINESS" ? 2000 : 500;
  }

  // Only successful AI replies are written as outbound messages with aiResponseId.
  // Trial usage is one shared Facebook + Instagram pool; paid plans have a pool per channel.
  const usageWhere = {
    direction: "OUTBOUND",
    createdAt: { gte: periodStart, lt: periodEnd },
    OR: [
      { metadata: { path: ["aiResponseId"], not: "" } },
      { metadata: { path: ["quotaReservationId"], not: "" } },
    ],
    conversation: {
      userId,
      ...(isTrial
        ? { channel: { in: ["FACEBOOK", "INSTAGRAM"] } }
        : { channel }),
    },
  };

  const used = await prisma.message.count({ where: usageWhere });
  const hasExtraMessageCredits = user.extraMessageCredits > 0;
  const usesExtraCredit = used >= limit && hasExtraMessageCredits;

  return {
    allowed: used < limit || hasExtraMessageCredits,
    remaining: Math.max(limit - used, 0) + (used >= limit ? user.extraMessageCredits : 0),
    used,
    limit,
    usesExtraCredit,
    periodStart,
    periodEnd,
    isTrial,
    reason:
      used >= limit && !hasExtraMessageCredits
        ? "Your message limit for this channel and billing period has been reached. Purchase additional message credits to continue."
        : null,
  };
}

async function reserveMessagingAllowance(
  userId: string,
  channel: "FACEBOOK" | "INSTAGRAM" | "WHATSAPP",
  periodStart: Date,
  periodEnd: Date,
  limit: number,
  isTrial: boolean,
  conversationId: string,
  reply: string,
) {
  const scope = isTrial ? "META_TRIAL_SHARED" : channel;
  const lockKey = userId + ":" + scope + ":" + periodStart.toISOString();

  return prisma.$transaction(async (tx) => {
    await tx.$queryRaw`SELECT pg_advisory_xact_lock(hashtext(${lockKey})::bigint)`;

    const used = await tx.message.count({
      where: {
        direction: "OUTBOUND",
        createdAt: { gte: periodStart, lt: periodEnd },
        OR: [
          { metadata: { path: ["aiResponseId"], not: "" } },
          { metadata: { path: ["quotaReservationId"], not: "" } },
        ],
        conversation: {
          userId,
          ...(isTrial
            ? { channel: { in: ["FACEBOOK", "INSTAGRAM"] } }
            : { channel }),
        },
      },
    });

    const usesExtraCredit = used >= limit;
    if (usesExtraCredit) {
      const credit = await tx.user.updateMany({
        where: { id: userId, extraMessageCredits: { gt: 0 } },
        data: { extraMessageCredits: { decrement: 1 } },
      });
      if (credit.count !== 1) {
        return { allowed: false, reservationId: null, messageId: null, usesExtraCredit: false };
      }
    }

    const reservationId = randomUUID();
    const reservation = await tx.message.create({
      data: {
        conversationId,
        direction: "OUTBOUND",
        text: reply,
        metadata: { quotaReservationId: reservationId },
      },
      select: { id: true },
    });
    return { allowed: true, reservationId, messageId: reservation.id, usesExtraCredit };
  });
}

async function refundExtraMessageCredit(userId: string) {
  await prisma.user.update({
    where: { id: userId },
    data: { extraMessageCredits: { increment: 1 } },
  });
}


function isDuplicateMessageError(error: unknown) {
  return Boolean(
    error &&
      typeof error === "object" &&
      "code" in error &&
      (error as { code?: string }).code === "P2002",
  );
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
  console.log("META INTEGRATION LOOKUP:", JSON.stringify({
    channel,
    recipientId,
    found: Boolean(integration),
    userId: integration?.userId ?? null,
    instagramAccountId: integration?.instagramAccountId ?? null,
  }));
  if (!integration) {
    console.log("META INTEGRATION NOT FOUND:", JSON.stringify({ channel, recipientId }));
    return;
  }

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
      channelId: integration.id,
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

  try {
    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        direction: "INBOUND",
        externalMessageId: event.message?.mid ?? null,
        senderExternalId: senderId,
        text,
      },
    });
  } catch (error) {
    if (event.message?.mid && isDuplicateMessageError(error)) return;
    throw error;
  }

  let reservedExtraCredit = false;
  let reservedMessageId: string | null = null;
  let providerSendSucceeded = false;

  try {
    const trialMessaging = await canUseMessaging(integration.userId, channel);

    if (!trialMessaging.allowed) {
      console.log("META TRIAL MESSAGING BLOCKED:", JSON.stringify({
        channel,
        userId: integration.userId,
        reason: trialMessaging.reason,
      }));
      return;
    }

    console.log("META AI START:", JSON.stringify({ channel, userId: integration.userId, textLength: text.length }));
    const result = await runCustomerAgent({
      userId: integration.userId,
      message: text,
      previousResponseId: conversation.aiResponseId ?? undefined,
    });

    console.log("META AI RESULT:", JSON.stringify({ channel, responseId: result.responseId, replyLength: result.text?.length ?? 0 }));
    console.log("META AI RESULT:", JSON.stringify({
      channel,
      responseId: result.responseId,
      hasText: Boolean(result.text?.trim()),
      textLength: result.text?.trim().length ?? 0,
    }));

    const reply = result.text.trim();
    if (!reply) return;

    const reservation = await reserveMessagingAllowance(
      integration.userId,
      channel,
      trialMessaging.periodStart,
      trialMessaging.periodEnd,
      trialMessaging.limit,
      trialMessaging.isTrial,
      conversation.id,
      reply,
    );
    if (!reservation.allowed || !reservation.messageId) {
      console.log("META MESSAGE QUOTA RESERVATION FAILED:", JSON.stringify({ channel, userId: integration.userId }));
      return;
    }
    reservedExtraCredit = reservation.usesExtraCredit;
    reservedMessageId = reservation.messageId;

    console.log("META SEND START:", JSON.stringify({
      channel,
      recipientId: senderId,
      instagramAccountId: integration.instagramAccountId ?? null,
    }));

    const sendResult =
      channel === "FACEBOOK"
        ? await sendFacebookMessage(integration.accessToken, senderId, reply)
        : await sendInstagramMessage(
            integration.accessToken,
            integration.instagramAccountId!,
            senderId,
            reply,
          );

    console.log("META SEND RESULT:", JSON.stringify({
      channel,
      success: true,
    }));
    providerSendSucceeded = true;

    await prisma.message.update({
      where: { id: reservation.messageId },
      data: {
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
    if (!providerSendSucceeded && reservedMessageId) {
      await prisma.message.delete({ where: { id: reservedMessageId } }).catch((cleanupError) =>
        console.error("Failed to release message quota reservation:", cleanupError),
      );
    }
    if (!providerSendSucceeded && reservedExtraCredit) {
      await refundExtraMessageCredit(integration.userId).catch((refundError) =>
        console.error("Failed to refund message credit:", refundError),
      );
    }
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
      channelId: integration.id,
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

  try {
    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        direction: "INBOUND",
        externalMessageId: message.id ?? null,
        senderExternalId: senderId,
        text,
      },
    });
  } catch (error) {
    if (message.id && isDuplicateMessageError(error)) return;
    throw error;
  }

  let reservedExtraCredit = false;
  let reservedMessageId: string | null = null;
  let providerSendSucceeded = false;

  try {
    const trialMessaging = await canUseMessaging(integration.userId, "WHATSAPP");

    if (!trialMessaging.allowed) {
      console.log("META TRIAL MESSAGING BLOCKED:", JSON.stringify({
        channel: "WHATSAPP",
        userId: integration.userId,
        reason: trialMessaging.reason,
      }));
      return;
    }

    console.log("META AI START:", JSON.stringify({
      channel: "WHATSAPP",
      userId: integration.userId,
      conversationId: conversation.id,
      messageLength: text.length,
    }));

    const result = await runCustomerAgent({
      userId: integration.userId,
      message: text,
      previousResponseId: conversation.aiResponseId ?? undefined,
    });

    const reply = result.text.trim();
    if (!reply || !integration.whatsappPhoneNumberId) return;

    const reservation = await reserveMessagingAllowance(
      integration.userId,
      "WHATSAPP",
      trialMessaging.periodStart,
      trialMessaging.periodEnd,
      trialMessaging.limit,
      trialMessaging.isTrial,
      conversation.id,
      reply,
    );
    if (!reservation.allowed || !reservation.messageId) {
      console.log("META MESSAGE QUOTA RESERVATION FAILED:", JSON.stringify({ channel: "WHATSAPP", userId: integration.userId }));
      return;
    }
    reservedExtraCredit = reservation.usesExtraCredit;
    reservedMessageId = reservation.messageId;

    const sendResult = await sendWhatsAppMessage(
      integration.accessToken,
      integration.whatsappPhoneNumberId,
      senderId,
      reply,
    );
    providerSendSucceeded = true;

    await prisma.message.update({
      where: { id: reservation.messageId },
      data: {
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
    if (!providerSendSucceeded && reservedMessageId) {
      await prisma.message.delete({ where: { id: reservedMessageId } }).catch((cleanupError) =>
        console.error("Failed to release WhatsApp quota reservation:", cleanupError),
      );
    }
    if (!providerSendSucceeded && reservedExtraCredit) {
      await refundExtraMessageCredit(integration.userId).catch((refundError) =>
        console.error("Failed to refund WhatsApp message credit:", refundError),
      );
    }
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
  console.log("META WEBHOOK POST HIT:", new Date().toISOString());
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

    console.log("META WEBHOOK RECEIVED:", JSON.stringify({
      object: payload.object,
      entryCount: payload.entry?.length ?? 0,
      firstEntryId: payload.entry?.[0]?.id ?? null,
      firstMessagingCount: payload.entry?.[0]?.messaging?.length ?? 0,
      firstMessagingEvent: payload.entry?.[0]?.messaging?.[0]
        ? {
            senderId: payload.entry[0].messaging[0].sender?.id ?? null,
            recipientId: payload.entry[0].messaging[0].recipient?.id ?? null,
            hasMessage: Boolean(payload.entry[0].messaging[0].message),
            hasText: Boolean(payload.entry[0].messaging[0].message?.text),
          }
        : null,
    }));

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
          console.log("META MESSAGE EVENT:", JSON.stringify({
            channel,
            senderId: event.sender?.id ?? null,
            recipientId: event.recipient?.id ?? null,
            hasText: Boolean(event.message?.text),
            messageId: event.message?.mid ?? null,
          }));
          await handleMetaMessage(channel, event);
        }
      }

      return new NextResponse("EVENT_RECEIVED", { status: 200 });
    }

    if (payload.object === "whatsapp_business_account") {
      console.log("META WHATSAPP WEBHOOK:", JSON.stringify({
        entryCount: payload.entry?.length ?? 0,
        entries: (payload.entry ?? []).map((entry) => ({
          wabaId: entry.id ?? null,
          changes: (entry.changes ?? []).map((change) => ({
            field: change.field ?? null,
            phoneNumberId: change.value?.metadata?.phone_number_id ?? null,
            messageCount: change.value?.messages?.length ?? 0,
          })),
        })),
      }));

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
