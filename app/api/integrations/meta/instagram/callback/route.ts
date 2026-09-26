import { createHmac, timingSafeEqual } from "crypto";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/db";

const INSTAGRAM_GRAPH_API_VERSION = "v26.0";
const INSTAGRAM_TOKEN_URL = "https://api.instagram.com/oauth/access_token";
const INSTAGRAM_GRAPH_BASE_URL = "https://graph.instagram.com";

function verifyState(state: string, secret: string) {
  const [payload, signature] = state.split(".");

  if (!payload || !signature) {
    return null;
  }

  const expected = createHmac("sha256", secret)
    .update(payload)
    .digest("base64url");

  const receivedBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);

  if (
    receivedBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(receivedBuffer, expectedBuffer)
  ) {
    return null;
  }

  try {
    const decoded = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8"),
    ) as {
      userId?: string;
      createdAt?: number;
    };

    if (
      !decoded.userId ||
      !decoded.createdAt ||
      Date.now() - decoded.createdAt > 10 * 60 * 1000
    ) {
      return null;
    }

    return decoded.userId;
  } catch {
    return null;
  }
}

function getRedirectUri(request: Request) {
  return new URL(
    "/api/integrations/meta/instagram/callback",
    request.url,
  ).toString();
}

async function exchangeCodeForToken(
  code: string,
  appId: string,
  appSecret: string,
  redirectUri: string,
) {
  const body = new URLSearchParams();

  body.set("client_id", appId);
  body.set("client_secret", appSecret);
  body.set("grant_type", "authorization_code");
  body.set("redirect_uri", redirectUri);
  body.set("code", code);

  const response = await fetch(INSTAGRAM_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
    cache: "no-store",
  });

  const data = (await response.json()) as {
    access_token?: string;
    user_id?: string;
    permissions?: string[];
    expires_in?: number;
    error_type?: string;
    code?: number;
    error_message?: string;
  };

  if (!response.ok || !data.access_token || !data.user_id) {
    throw new Error(
      data.error_message || "Instagram authorization code exchange failed.",
    );
  }

  return data;
}

async function exchangeForLongLivedToken(
  shortLivedToken: string,
  appSecret: string,
) {
  const url = new URL(
    `${INSTAGRAM_GRAPH_BASE_URL}/access_token`,
  );

  url.searchParams.set("grant_type", "ig_exchange_token");
  url.searchParams.set("client_secret", appSecret);
  url.searchParams.set("access_token", shortLivedToken);

  const response = await fetch(url, {
    method: "GET",
    cache: "no-store",
  });

  const data = (await response.json()) as {
    access_token?: string;
    token_type?: string;
    expires_in?: number;
    error?: {
      message?: string;
      type?: string;
      code?: number;
    };
  };

  if (!response.ok || !data.access_token) {
    throw new Error(
      data.error?.message || "Instagram long-lived token exchange failed.",
    );
  }

  return data;
}

async function getInstagramAccount(accessToken: string) {
  const url = new URL(
    `${INSTAGRAM_GRAPH_BASE_URL}/${INSTAGRAM_GRAPH_API_VERSION}/me`,
  );

  url.searchParams.set("fields", "id,username,name,account_type");
  url.searchParams.set("access_token", accessToken);

  const response = await fetch(url, {
    method: "GET",
    cache: "no-store",
  });

  const data = (await response.json()) as {
    id?: string;
    username?: string;
    name?: string;
    account_type?: string;
    error?: {
      message?: string;
      type?: string;
      code?: number;
    };
  };

  if (!response.ok || !data.id) {
    throw new Error(
      data.error?.message || "Instagram account lookup failed.",
    );
  }

  if (data.account_type && data.account_type !== "BUSINESS") {
    throw new Error(
      "The connected Instagram account is not an Instagram Business account.",
    );
  }

  return {
    id: data.id,
    username: data.username,
    name: data.name,
    account_type: data.account_type,
  };
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const state = requestUrl.searchParams.get("state");
  const error = requestUrl.searchParams.get("error");
  const errorDescription = requestUrl.searchParams.get("error_description");

  if (error) {
    const message =
      errorDescription || error || "Instagram authorization was cancelled.";

    return NextResponse.redirect(
      new URL(
        `/dashboard/integrations/instagram?error=${encodeURIComponent(message)}`,
        request.url,
      ),
    );
  }

  if (!code || !state) {
    return NextResponse.redirect(
      new URL(
        "/dashboard/integrations/instagram?error=Missing+Instagram+authorization+parameters",
        request.url,
      ),
    );
  }

  const appId = process.env.META_APP_ID;
  const appSecret = process.env.META_APP_SECRET;
  const stateSecret = process.env.AUTH_SECRET;

  if (!appId || !appSecret || !stateSecret) {
    return NextResponse.json(
      {
        error:
          "Instagram OAuth is not configured. Set META_APP_ID, META_APP_SECRET, and AUTH_SECRET.",
      },
      { status: 500 },
    );
  }

  const userId = verifyState(state, stateSecret);

  if (!userId) {
    return NextResponse.json(
      { error: "Invalid or expired Instagram OAuth state." },
      { status: 400 },
    );
  }

  try {
    const redirectUri = getRedirectUri(request);
    const shortLivedToken = await exchangeCodeForToken(
      code,
      appId,
      appSecret,
      redirectUri,
    );

    const longLivedToken = await exchangeForLongLivedToken(
      shortLivedToken.access_token!,
      appSecret,
    );

    const instagramAccount = await getInstagramAccount(
      longLivedToken.access_token!,
    );

    const expiresAt =
      typeof longLivedToken.expires_in === "number"
        ? new Date(Date.now() + longLivedToken.expires_in * 1000)
        : typeof shortLivedToken.expires_in === "number"
          ? new Date(Date.now() + shortLivedToken.expires_in * 1000)
          : null;

    await prisma.metaIntegration.upsert({
      where: {
        userId_platform_externalAccountId: {
          userId,
          platform: "INSTAGRAM",
          externalAccountId: instagramAccount.id,
        },
      },
      update: {
        externalAccountName:
          instagramAccount.username ??
          instagramAccount.name ??
          null,
        accessToken: longLivedToken.access_token!,
        tokenExpiresAt: expiresAt,
        scopes: process.env.META_OAUTH_SCOPES ?? null,
        instagramAccountId: instagramAccount.id,
        pageId: null,
        pageName: null,
      },
      create: {
        userId,
        platform: "INSTAGRAM",
        externalAccountId: instagramAccount.id,
        externalAccountName:
          instagramAccount.username ??
          instagramAccount.name ??
          null,
        accessToken: longLivedToken.access_token!,
        tokenExpiresAt: expiresAt,
        scopes: process.env.META_OAUTH_SCOPES ?? null,
        instagramAccountId: instagramAccount.id,
      },
    });

    return NextResponse.redirect(
      new URL(
        "/dashboard/integrations/instagram?connected=true",
        request.url,
      ),
    );
  } catch (callbackError) {
    console.error("Instagram OAuth callback error:", callbackError);

    return NextResponse.redirect(
      new URL(
        "/dashboard/integrations/instagram?error=Instagram+connection+failed",
        request.url,
      ),
    );
  }
}
