import { createHmac, timingSafeEqual } from "crypto";
import { prisma } from "@/lib/db";
import { sendFiwanoMessage } from "@/lib/fiwano";
import { NextResponse } from "next/server";

type FiwanoWebhook = {
  event?: string;
  channel_id?: string;
  channel_type?: string;
  timestamp?: string;
  data?: {
    message_id?: string;
    from?: string;
    from_name?: string | null;
    type?: string;
    text?: string;
    caption?: string;
  };
};

function verifySignature(body: string, signature: string, secret: string) {
  const received = signature.replace(/^sha256=/, "");
  const expected = createHmac("sha256", secret)
    .update(body)
    .digest("hex");

  const receivedBuffer = Buffer.from(received, "hex");
  const expectedBuffer = Buffer.from(expected, "hex");

  if (receivedBuffer.length !== expectedBuffer.length) return false;

  return timingSafeEqual(receivedBuffer, expectedBuffer);
}

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("X-Webhook-Signature");

  let payload: FiwanoWebhook;

  try {
    payload = JSON.parse(body) as FiwanoWebhook;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!payload.channel_id) {
    return NextResponse.json({ error: "Missing channel_id" }, { status: 400 });
  }

  const channel = await prisma.fiwanoChannel.findUnique({
    where: { channelId: payload.channel_id },
  });

  if (!channel || !channel.isActive) {
    return NextResponse.json({ received: true });
  }

  if (channel.webhookSecret && signature) {
    if (!verifySignature(body, signature, channel.webhookSecret)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }
  } else if (channel.webhookSecret && !signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 401 });
  }

  if (payload.event === "message.received" && payload.data?.from) {
    const text = payload.data.text?.trim() || payload.data.caption?.trim();

    if (text) {
      await prisma.lead.create({
        data: {
          userId: channel.userId,
          name: payload.data.from_name || null,
          phone:
            channel.channelType === "whatsapp"
              ? payload.data.from
              : null,
          source: `fiwano:${channel.channelType}`,
          lastMessage: text,
        },
      });

      // AI reply is intentionally not triggered here yet. This endpoint first
      // establishes the verified transport layer for the three Meta channels.
    }
  }

  return NextResponse.json({ received: true });
}

export async function GET() {
  return NextResponse.json({ ok: true });
}
