import { NextResponse } from "next/server";

import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

export const dynamic = "force-dynamic";

const ADMIN_EMAIL = "tawilabood8@gmail.com";
const PRO_MESSAGE_LIMIT = 15000;
const PRO_VOICE_MINUTE_LIMIT = 500;

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (
      !user?.id ||
      user.role !== "ADMIN" ||
      user.email?.toLowerCase() !== ADMIN_EMAIL
    ) {
      return NextResponse.json({ error: "Not found." }, { status: 404 });
    }

    const now = new Date();
    const periodStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
    const periodEnd = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));

    const [account, usedMessages, voiceUsage] = await Promise.all([
      prisma.user.findUnique({
        where: { id: user.id },
        select: { plan: true, extraMessageCredits: true, extraVoiceMinutes: true },
      }),
      prisma.message.count({
        where: {
          direction: "OUTBOUND",
          createdAt: { gte: periodStart, lt: periodEnd },
          conversation: {
            userId: user.id,
            channel: { in: ["FACEBOOK", "INSTAGRAM", "WHATSAPP"] },
          },
        },
      }),
      prisma.voiceUsage.aggregate({
        where: {
          userId: user.id,
          source: "VAPI_CALL",
          startedAt: { gte: periodStart, lt: periodEnd },
        },
        _sum: { billedMinutes: true },
      }),
    ]);

    if (!account) {
      return NextResponse.json({ error: "Account not found." }, { status: 404 });
    }

    const usedVoiceMinutes = voiceUsage._sum.billedMinutes ?? 0;

    return NextResponse.json(
      {
        success: true,
        plan: account.plan,
        periodStart: periodStart.toISOString(),
        periodEnd: periodEnd.toISOString(),
        messages: {
          used: usedMessages,
          included: PRO_MESSAGE_LIMIT,
          remaining: Math.max(PRO_MESSAGE_LIMIT - usedMessages, 0),
          extra: account.extraMessageCredits,
        },
        voice: {
          used: usedVoiceMinutes,
          included: PRO_VOICE_MINUTE_LIMIT,
          remaining: Math.max(PRO_VOICE_MINUTE_LIMIT - usedVoiceMinutes, 0),
          extra: account.extraVoiceMinutes,
        },
      },
      { headers: { "Cache-Control": "no-store, max-age=0" } },
    );
  } catch (error) {
    console.error("Admin AI Phone usage fetch error:", error);
    return NextResponse.json(
      { error: "Unable to load AI Phone usage." },
      { status: 500 },
    );
  }
}
