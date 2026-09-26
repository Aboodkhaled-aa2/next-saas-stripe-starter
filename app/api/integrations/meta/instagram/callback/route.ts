import { createHmac, timingSafeEqual } from "crypto";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/db";

const META_GRAPH_API_VERSION = "v26.0";

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
  const url = new URL(
    `https://graph.facebook.com/${META_GRAPH_API_VERSION}/oauth/access_token`,
  );

  url.searchParams.set("client_id", appId);
  url.searchParams.set("client_secret", appSecret);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("code", code);

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
      data.error?.message || "Meta token exchange failed.",
    );
  }

  return data;
}

async function getMetaUser(
  accessToken: string,
) {
  const url = new URL(
    `https://graph.facebook.com/${META_GRAPH_API_VERSION}/me`,
  );

  url.searchParams.set("fields", "id,name");
  url.searchParams.set("access_token", accessToken);

  const response = await fetch(url, {
    method: "GET",
    cache: "no-store",
  });

  const data = (await response.json()) as {
    id?: string;
    name?: string;
    error?: {
      message?: string;
    };
  };

  if (!response.ok || !data.id) {
    throw new Error(data.error?.message || "Meta account lookup failed.");
  }

  return data;
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const state = requestUrl.searchParams.get("state");
  const error = requestUrl.searchParams.get("error");
  const errorDescription = requestUrl.searchParams.get("error_description");

  if (error) {
    const message =
      errorDescription || error || "Meta authorization was cancelled.";

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
        "/dashboard/integrations/instagram?error=Missing+Meta+authorization+parameters",
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
          "Meta OAuth is not configured. Set META_APP_ID, META_APP_SECRET, and AUTH_SECRET.",
      },
      { status: 500 },
    );
  }

  const userId = verifyState(state, stateSecret);

  if (!userId) {
    return NextResponse.json(
      { error: "Invalid or expired Meta OAuth state." },
      { status: 400 },
    );
  }

  try {
    const redirectUri = getRedirectUri(request);
    const token = await exchangeCodeForToken(
      code,
      appId,
      appSecret,
      redirectUri,
    );
    if (!token.access_token) {
      throw new Error("Meta token exchange returned no access token.");
    }

    const metaUser = await getMetaUser(token.access_token);

    if (!metaUser.id) {
      throw new Error("Meta account lookup returned no account ID.");
    }

    const expiresAt =
      typeof token.expires_in === "number"
        ? new Date(Date.now() + token.expires_in * 1000)
        : null;

    await prisma.metaIntegration.upsert({
      where: {
        userId_platform_externalAccountId: {
          userId,
          platform: "INSTAGRAM",
          externalAccountId: metaUser.id,
        },
      },
      update: {
        externalAccountName: metaUser.name ?? null,
        accessToken: token.access_token,
        tokenExpiresAt: expiresAt,
        scopes: process.env.META_OAUTH_SCOPES ?? null,
      },
      create: {
        userId,
        platform: "INSTAGRAM",
        externalAccountId: metaUser.id,
        externalAccountName: metaUser.name ?? null,
        accessToken: token.access_token,
        tokenExpiresAt: expiresAt,
        scopes: process.env.META_OAUTH_SCOPES ?? null,
      },
    });

    return NextResponse.redirect(
      new URL(
        "/dashboard/integrations/instagram?connected=true",
        request.url,
      ),
    );
  } catch (callbackError) {
    console.error("Meta Instagram OAuth callback error:", callbackError);

    return NextResponse.redirect(
      new URL(
        "/dashboard/integrations/instagram?error=Meta+connection+failed",
        request.url,
      ),
    );
  }
}
