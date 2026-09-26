import { createHmac, timingSafeEqual } from "crypto";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/db";

const FACEBOOK_GRAPH_API_VERSION = "v26.0";
const FACEBOOK_GRAPH_BASE_URL = "https://graph.facebook.com";

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
    "/api/integrations/meta/facebook/callback",
    request.url,
  ).toString();
}

async function exchangeCodeForUserToken(
  code: string,
  appId: string,
  appSecret: string,
  redirectUri: string,
) {
  const url = new URL(
    `${FACEBOOK_GRAPH_BASE_URL}/${FACEBOOK_GRAPH_API_VERSION}/oauth/access_token`,
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
      data.error?.message || "Facebook authorization code exchange failed.",
    );
  }

  return data;
}

async function getFacebookPages(accessToken: string) {
  const url = new URL(
    `${FACEBOOK_GRAPH_BASE_URL}/${FACEBOOK_GRAPH_API_VERSION}/me/accounts`,
  );

  url.searchParams.set("fields", "id,name,access_token");
  url.searchParams.set("access_token", accessToken);

  const response = await fetch(url, {
    method: "GET",
    cache: "no-store",
  });

  const data = (await response.json()) as {
    data?: Array<{
      id?: string;
      name?: string;
      access_token?: string;
    }>;
    error?: {
      message?: string;
      type?: string;
      code?: number;
    };
  };

  if (!response.ok) {
    throw new Error(
      data.error?.message || "Facebook Page lookup failed.",
    );
  }

  const pages = (data.data || []).filter(
    (page): page is { id: string; name?: string; access_token: string } =>
      Boolean(page.id && page.access_token),
  );

  if (!pages.length) {
    throw new Error(
      "No Facebook Page was found for this account. Make sure you manage at least one Facebook Page and approve the requested permissions.",
    );
  }

  return pages;
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const state = requestUrl.searchParams.get("state");
  const error = requestUrl.searchParams.get("error");
  const errorDescription = requestUrl.searchParams.get("error_description");

  if (error) {
    const message =
      errorDescription || error || "Facebook authorization was cancelled.";

    return NextResponse.redirect(
      new URL(
        `/dashboard/integrations/facebook?error=${encodeURIComponent(message)}`,
        request.url,
      ),
    );
  }

  if (!code || !state) {
    return NextResponse.redirect(
      new URL(
        "/dashboard/integrations/facebook?error=Missing+Facebook+authorization+parameters",
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
          "Facebook OAuth is not configured. Set META_APP_ID, META_APP_SECRET, and AUTH_SECRET.",
      },
      { status: 500 },
    );
  }

  const userId = verifyState(state, stateSecret);

  if (!userId) {
    return NextResponse.json(
      { error: "Invalid or expired Facebook OAuth state." },
      { status: 400 },
    );
  }

  try {
    const redirectUri = getRedirectUri(request);
    const userToken = await exchangeCodeForUserToken(
      code,
      appId,
      appSecret,
      redirectUri,
    );

    const pages = await getFacebookPages(userToken.access_token!);
    const page = pages[0];

    await prisma.metaIntegration.upsert({
      where: {
        userId_platform_externalAccountId: {
          userId,
          platform: "FACEBOOK",
          externalAccountId: page.id,
        },
      },
      update: {
        externalAccountName: page.name ?? null,
        accessToken: page.access_token,
        tokenExpiresAt:
          typeof userToken.expires_in === "number"
            ? new Date(Date.now() + userToken.expires_in * 1000)
            : null,
        scopes:
          process.env.META_FACEBOOK_OAUTH_SCOPES ||
          "pages_show_list,pages_read_engagement,pages_manage_metadata,pages_messaging",
        pageId: page.id,
        pageName: page.name ?? null,
      },
      create: {
        userId,
        platform: "FACEBOOK",
        externalAccountId: page.id,
        externalAccountName: page.name ?? null,
        accessToken: page.access_token,
        tokenExpiresAt:
          typeof userToken.expires_in === "number"
            ? new Date(Date.now() + userToken.expires_in * 1000)
            : null,
        scopes:
          process.env.META_FACEBOOK_OAUTH_SCOPES ||
          "pages_show_list,pages_read_engagement,pages_manage_metadata,pages_messaging",
        pageId: page.id,
        pageName: page.name ?? null,
      },
    });

    return NextResponse.redirect(
      new URL(
        "/dashboard/integrations/facebook?connected=true",
        request.url,
      ),
    );
  } catch (callbackError) {
    console.error("Facebook OAuth callback error:", callbackError);

    return NextResponse.redirect(
      new URL(
        "/dashboard/integrations/facebook?error=Facebook+connection+failed",
        request.url,
      ),
    );
  }
}
