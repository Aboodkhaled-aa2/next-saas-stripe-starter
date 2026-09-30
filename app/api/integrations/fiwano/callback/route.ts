import { auth } from "@/auth";
import { exchangeFiwanoCode } from "@/lib/fiwano";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { randomBytes } from "crypto";

function getAppUrl() {
  const configured =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.AUTH_URL ||
    (process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "https://www.smartcleaningdesk.com");

  return configured.replace(/\/$/, "");
}

function getWebhookSecret() {
  const configured = process.env.FIWANO_WEBHOOK_SECRET;
  if (configured) return configured.slice(0, 64);

  return randomBytes(32).toString("hex");
}

export async function GET(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.redirect(
      `${getAppUrl()}/login?error=fiwano_auth_required`,
    );
  }

  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const cookieHeader = request.headers.get("cookie") || "";
  const stateCookie = cookieHeader.match(
    /(?:^|; )fiwano_oauth_state=([^;]+)/
  )?.[1];
  const channelCookie = cookieHeader.match(
    /(?:^|; )fiwano_channel_type=([^;]+)/
  )?.[1];

  if (!state || !stateCookie || state !== decodeURIComponent(stateCookie)) {
    return NextResponse.redirect(
      `${getAppUrl()}/dashboard?fiwano=error&reason=invalid_state`,
    );
  }
  const providerError =
    url.searchParams.get("error") || url.searchParams.get("reason");

  if (!code) {
    return NextResponse.redirect(
      `${getAppUrl()}/dashboard?fiwano=error&reason=${encodeURIComponent(
        providerError || "connection_cancelled",
      )}`,
    );
  }

  const webhookUrl = `${getAppUrl()}/api/integrations/fiwano/webhook`;
  const webhookSecret = getWebhookSecret();

  try {
    const channelType =
      (url.searchParams.get("channel_type") as
        | "whatsapp"
        | "instagram"
        | "facebook"
        | null) ??
      (channelCookie as
        | "whatsapp"
        | "instagram"
        | "facebook"
        | null) ??
      null;

    if (!channelType) {
      return NextResponse.redirect(
        `${getAppUrl()}/dashboard?fiwano=error&reason=missing_channel_type`,
      );
    }

    const channel = await exchangeFiwanoCode(
      code,
      webhookUrl,
      webhookSecret,
      channelType,
    );

    await prisma.fiwanoChannel.upsert({
      where: { channelId: channel.channel_id },
      update: {
        userId: session.user.id,
        channelType: channel.channel_type,
        name: channel.name ?? null,
        phoneNumber: channel.phone_number ?? null,
        phoneNumberId: channel.phone_number_id ?? null,
        instagramAccountId: channel.ig_account_id ?? null,
        instagramUsername: channel.ig_username ?? null,
        pageId: channel.page_id ?? null,
        webhookSecret: channel.webhook_secret ?? webhookSecret,
        isActive: true,
        metadata: channel,
      },
      create: {
        userId: session.user.id,
        channelId: channel.channel_id,
        channelType: channel.channel_type,
        name: channel.name ?? null,
        phoneNumber: channel.phone_number ?? null,
        phoneNumberId: channel.phone_number_id ?? null,
        instagramAccountId: channel.ig_account_id ?? null,
        instagramUsername: channel.ig_username ?? null,
        pageId: channel.page_id ?? null,
        webhookSecret: channel.webhook_secret ?? webhookSecret,
        isActive: true,
        metadata: channel,
      },
    });

    const response = NextResponse.redirect(
      `${getAppUrl()}/dashboard/integrations/${encodeURIComponent(
        channel.channel_type,
      )}?fiwano=connected`,
    );

    response.cookies.set("fiwano_oauth_state", "", {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/api/integrations/fiwano/callback",
      maxAge: 0,
    });
    response.cookies.set("fiwano_channel_type", "", {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/api/integrations/fiwano/callback",
      maxAge: 0,
    });

    return response;
  } catch (error) {
    console.error("Fiwano callback error:", error);

    return NextResponse.redirect(
      `${getAppUrl()}/dashboard?fiwano=error&reason=exchange_failed`,
    );
  }
}
