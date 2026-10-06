import { NextResponse } from "next/server";

import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

export async function GET(request: Request) {
  const user = await getCurrentUser();
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const error = url.searchParams.get("error");
  const expectedState = request.headers.get("cookie")?.match(/(?:^|; )meta_instagram_oauth_state=([^;]+)/)?.[1];

  if (!user?.id) return NextResponse.redirect(new URL("/login", request.url));
  if (error) return NextResponse.redirect(new URL("/dashboard/integrations/instagram?error=meta_denied", request.url));
  if (!code || !state || state !== expectedState) {
    return NextResponse.redirect(new URL("/dashboard/integrations/instagram?error=invalid_oauth_state", request.url));
  }

  const appId = process.env.META_INSTAGRAM_APP_ID;
  const appSecret = process.env.META_INSTAGRAM_APP_SECRET;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;

  if (!appId || !appSecret || !appUrl) {
    return NextResponse.redirect(new URL("/dashboard/integrations/instagram?error=meta_not_configured", request.url));
  }

  const redirectUri = new URL(
    "/api/integrations/meta/instagram/callback",
    appUrl,
  ).toString();

  try {
    const tokenResponse = await fetch("https://api.instagram.com/oauth/access_token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: appId,
        client_secret: appSecret,
        grant_type: "authorization_code",
        redirect_uri: redirectUri,
        code,
      }),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok || !tokenData.access_token || !tokenData.user_id) {
      throw new Error(tokenData.error_message || "Failed to exchange Instagram OAuth code");
    }

    const longLivedUrl = new URL("https://graph.instagram.com/access_token");
    longLivedUrl.searchParams.set("grant_type", "ig_exchange_token");
    longLivedUrl.searchParams.set("client_secret", appSecret);
    longLivedUrl.searchParams.set("access_token", tokenData.access_token);

    const longLivedResponse = await fetch(longLivedUrl);
    const longLivedData = await longLivedResponse.json();

    if (!longLivedResponse.ok || !longLivedData.access_token) {
      throw new Error("Failed to exchange Instagram token");
    }

    const profileResponse = await fetch(
      `https://graph.instagram.com/me?fields=id,username,account_type&access_token=${encodeURIComponent(longLivedData.access_token)}`,
    );
    const profile = await profileResponse.json();

    if (!profileResponse.ok) {
      throw new Error(profile.error?.message || "Failed to load Instagram profile");
    }

    const instagramId = String(profile.id ?? tokenData.user_id);

    await prisma.metaIntegration.upsert({
      where: {
        userId_platform_externalAccountId: {
          userId: user.id,
          platform: "INSTAGRAM",
          externalAccountId: instagramId,
        },
      },
      update: {
        externalAccountName: profile.username ?? null,
        accessToken: longLivedData.access_token,
        tokenExpiresAt: new Date(Date.now() + (longLivedData.expires_in ?? 5184000) * 1000),
        scopes: "instagram_business_basic,instagram_business_manage_comments,instagram_business_manage_messages",
        instagramAccountId: instagramId,
        metadata: { username: profile.username, accountType: profile.account_type },
      },
      create: {
        userId: user.id,
        platform: "INSTAGRAM",
        externalAccountId: instagramId,
        externalAccountName: profile.username ?? null,
        accessToken: longLivedData.access_token,
        tokenExpiresAt: new Date(Date.now() + (longLivedData.expires_in ?? 5184000) * 1000),
        scopes: "instagram_business_basic,instagram_business_manage_comments,instagram_business_manage_messages",
        instagramAccountId: instagramId,
        metadata: { username: profile.username, accountType: profile.account_type },
      },
    });

    const graphVersion = process.env.META_GRAPH_VERSION || "v26.0";

    const subscribeUrl = new URL(
      "https://graph.instagram.com/" +
        graphVersion +
        "/" +
        instagramId +
        "/subscribed_apps",
    );
    subscribeUrl.searchParams.set("subscribed_fields", "messages");
    subscribeUrl.searchParams.set("access_token", longLivedData.access_token);

    const subscribeResponse = await fetch(subscribeUrl, {
      method: "POST",
      cache: "no-store",
    });
    const subscribeData = await subscribeResponse.json().catch(() => null);

    if (!subscribeResponse.ok || subscribeData?.success !== true) {
      throw new Error(
        subscribeData?.error?.message ||
          "Failed to subscribe Instagram account to messaging webhooks.",
      );
    }
    const response = NextResponse.redirect(
      new URL("/dashboard/integrations/instagram?connected=1", request.url),
    );
    response.cookies.delete("meta_instagram_oauth_state");
    return response;
  } catch (error) {
    console.error("Instagram OAuth callback failed:", error);
    return NextResponse.redirect(
      new URL("/dashboard/integrations/instagram?error=connection_failed", request.url),
    );
  }
}
