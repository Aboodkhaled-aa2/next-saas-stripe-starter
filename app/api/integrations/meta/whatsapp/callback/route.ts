import { NextResponse } from "next/server";

import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

const GRAPH_VERSION = process.env.META_GRAPH_VERSION || "v26.0";

export async function POST(request: Request) {
  const user = await getCurrentUser();

  if (!user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const stateCookie = request.headers
    .get("cookie")
    ?.match(
      /(?:^|; )meta_whatsapp_oauth_state=([^;]+)/,
    )?.[1];

  const body = await request.json().catch(() => null);

  if (
    !body?.code ||
    !body?.state ||
    body.state !== stateCookie
  ) {
    return NextResponse.json(
      { error: "Invalid WhatsApp OAuth state" },
      { status: 400 },
    );
  }

  const appId = process.env.META_APP_ID;
  const appSecret = process.env.META_APP_SECRET;

  if (!appId || !appSecret) {
    return NextResponse.json(
      { error: "Meta is not configured" },
      { status: 500 },
    );
  }

  try {
    const tokenUrl = new URL(
      "https://graph.facebook.com/" +
        GRAPH_VERSION +
        "/oauth/access_token",
    );

    tokenUrl.searchParams.set("client_id", appId);
    tokenUrl.searchParams.set("client_secret", appSecret);
    tokenUrl.searchParams.set("code", body.code);

    const tokenResponse = await fetch(tokenUrl, {
      cache: "no-store",
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok || !tokenData.access_token) {
      throw new Error(
        tokenData.error?.message ||
          "Failed to exchange WhatsApp authorization code",
      );
    }

    const externalAccountId = String(
      body.wabaId ||
        body.phoneNumberId ||
        "whatsapp-" + user.id,
    );

    await prisma.metaIntegration.upsert({
      where: {
        userId_platform_externalAccountId: {
          userId: user.id,
          platform: "WHATSAPP",
          externalAccountId,
        },
      },
      update: {
        externalAccountName: body.businessName
          ? String(body.businessName)
          : "WhatsApp Business",
        accessToken: tokenData.access_token,
        whatsappBusinessId: body.wabaId
          ? String(body.wabaId)
          : null,
        whatsappPhoneNumberId: body.phoneNumberId
          ? String(body.phoneNumberId)
          : null,
        phoneNumber: body.phoneNumber
          ? String(body.phoneNumber)
          : null,
        metadata: {
          ...(typeof body.metadata === "object" &&
          body.metadata !== null
            ? body.metadata
            : {}),
          businessId: body.businessId
            ? String(body.businessId)
            : null,
        },
        updatedAt: new Date(),
      },
      create: {
        userId: user.id,
        platform: "WHATSAPP",
        externalAccountId,
        externalAccountName: body.businessName
          ? String(body.businessName)
          : "WhatsApp Business",
        accessToken: tokenData.access_token,
        whatsappBusinessId: body.wabaId
          ? String(body.wabaId)
          : null,
        whatsappPhoneNumberId: body.phoneNumberId
          ? String(body.phoneNumberId)
          : null,
        phoneNumber: body.phoneNumber
          ? String(body.phoneNumber)
          : null,
        metadata: {
          ...(typeof body.metadata === "object" &&
          body.metadata !== null
            ? body.metadata
            : {}),
          businessId: body.businessId
            ? String(body.businessId)
            : null,
        },
      },
    });

    const response = NextResponse.json({ success: true });
    response.cookies.delete("meta_whatsapp_oauth_state");

    return response;
  } catch (error) {
    console.error(
      "WhatsApp Embedded Signup callback failed:",
      error,
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "WhatsApp connection failed",
      },
      { status: 500 },
    );
  }
}
