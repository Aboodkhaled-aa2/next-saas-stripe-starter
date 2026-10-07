import { NextResponse } from "next/server";

import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

const GRAPH_VERSION = process.env.META_GRAPH_VERSION || "v26.0";
const PHONE_NUMBER_ID = "1318221814712929";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const integration = await prisma.metaIntegration.findFirst({
    where: { userId: user.id, platform: "WHATSAPP", whatsappPhoneNumberId: PHONE_NUMBER_ID },
    orderBy: { updatedAt: "desc" },
    select: { whatsappPhoneNumberId: true, accessToken: true },
  });

  if (!integration?.whatsappPhoneNumberId || !integration.accessToken) {
    return NextResponse.json({ error: "No matching WhatsApp integration found." }, { status: 404 });
  }

  const body = await request.json().catch(() => null);
  const pin = typeof body?.pin === "string" ? body.pin.trim() : "";

  if (!/^\d{6}$/.test(pin)) {
    return NextResponse.json({ error: "PIN must contain exactly 6 digits." }, { status: 400 });
  }

  const response = await fetch(
    `https://graph.facebook.com/${GRAPH_VERSION}/${integration.whatsappPhoneNumberId}/register`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${integration.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ messaging_product: "whatsapp", pin }),
      cache: "no-store",
    },
  );

  const data = await response.json().catch(() => null);

  return NextResponse.json(
    { ok: response.ok, status: response.status, phoneNumberId: integration.whatsappPhoneNumberId, result: data },
    { status: response.ok ? 200 : response.status },
  );
}
