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

    const wabaId = body.wabaId ? String(body.wabaId) : null;
    const phoneNumberId = body.phoneNumberId
      ? String(body.phoneNumberId)
      : null;

    if (!wabaId || !phoneNumberId) {
      throw new Error(
        "Meta did not return the WhatsApp Business Account and phone number IDs.",
      );
    }

    const wabaResponse = await fetch(
      `https://graph.facebook.com/${GRAPH_VERSION}/${encodeURIComponent(
        wabaId,
      )}?fields=id,name&access_token=${encodeURIComponent(
        tokenData.access_token,
      )}`,
      { cache: "no-store" },
    );
    const wabaData = await wabaResponse.json().catch(() => null);

    if (!wabaResponse.ok || !wabaData?.id) {
      throw new Error(
        wabaData?.error?.message ||
          "The connected WhatsApp Business Account could not be verified.",
      );
    }

    const phoneResponse = await fetch(
      `https://graph.facebook.com/${GRAPH_VERSION}/${encodeURIComponent(
        phoneNumberId,
      )}?fields=id,display_phone_number,verified_name&access_token=${encodeURIComponent(
        tokenData.access_token,
      )}`,
      { cache: "no-store" },
    );
    const phoneData = await phoneResponse.json().catch(() => null);

    if (!phoneResponse.ok || !phoneData?.id) {
      throw new Error(
        phoneData?.error?.message ||
          "The connected WhatsApp phone number could not be verified.",
      );
    }

    const externalAccountId = wabaId;

    await prisma.metaIntegration.upsert({
      where: {
        userId_platform_externalAccountId: {
          userId: user.id,
          platform: "WHATSAPP",
          externalAccountId,
        },
      },
      update: {
        externalAccountName:
          wabaData.name ||
          (body.businessName ? String(body.businessName) : "WhatsApp Business"),
        accessToken: tokenData.access_token,
        whatsappBusinessId: wabaId,
        whatsappPhoneNumberId: phoneNumberId,
        phoneNumber:
          phoneData.display_phone_number ||
          (body.phoneNumber ? String(body.phoneNumber) : null),
        metadata: {
          ...(typeof body.metadata === "object" &&
          body.metadata !== null
            ? body.metadata
            : {}),
          businessId: body.businessId
            ? String(body.businessId)
            : null,
          verifiedName: phoneData.verified_name || null,
        },
        updatedAt: new Date(),
      },
      create: {
        userId: user.id,
        platform: "WHATSAPP",
        externalAccountId,
        externalAccountName:
          wabaData.name ||
          (body.businessName ? String(body.businessName) : "WhatsApp Business"),
        accessToken: tokenData.access_token,
        whatsappBusinessId: wabaId,
        whatsappPhoneNumberId: phoneNumberId,
        phoneNumber:
          phoneData.display_phone_number ||
          (body.phoneNumber ? String(body.phoneNumber) : null),
        metadata: {
          ...(typeof body.metadata === "object" &&
          body.metadata !== null
            ? body.metadata
            : {}),
          businessId: body.businessId
            ? String(body.businessId)
            : null,
          verifiedName: phoneData.verified_name || null,
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
