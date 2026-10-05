import { NextResponse } from "next/server";

import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

const GRAPH_VERSION = process.env.META_GRAPH_VERSION || "v26.0";

export async function GET(request: Request) {
  const user = await getCurrentUser();
  const url = new URL(request.url);

  if (!user?.id) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const state = url.searchParams.get("state");
  const code = url.searchParams.get("code");
  const error = url.searchParams.get("error");

  if (error) {
    return NextResponse.redirect(
      new URL(
        "/dashboard/integrations/facebook?error=meta_denied",
        request.url,
      ),
    );
  }

  if (!code || !state) {
    return NextResponse.redirect(
      new URL(
        "/dashboard/integrations/facebook?error=missing_oauth_data",
        request.url,
      ),
    );
  }

  const cookieHeader = request.headers.get("cookie") || "";

  const stateCookie = cookieHeader
    .split(";")
    .map((item) => item.trim())
    .find((item) => item.startsWith("meta_oauth_state="));

  const expectedState = stateCookie
    ? decodeURIComponent(stateCookie.substring("meta_oauth_state=".length))
    : null;

  if (!expectedState || state !== expectedState) {
    return NextResponse.redirect(
      new URL(
        "/dashboard/integrations/facebook?error=invalid_oauth_state",
        request.url,
      ),
    );
  }

  const appId = process.env.META_APP_ID;
  const appSecret = process.env.META_APP_SECRET;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;

  if (!appId || !appSecret || !appUrl) {
    return NextResponse.redirect(
      new URL(
        "/dashboard/integrations/facebook?error=meta_not_configured",
        request.url,
      ),
    );
  }

  const redirectUri = new URL(
    "/api/integrations/meta/facebook/callback",
    appUrl,
  ).toString();

  try {
    const tokenUrl = new URL(
      `https://graph.facebook.com/${GRAPH_VERSION}/oauth/access_token`,
    );

    tokenUrl.searchParams.set("client_id", appId);
    tokenUrl.searchParams.set("client_secret", appSecret);
    tokenUrl.searchParams.set("redirect_uri", redirectUri);
    tokenUrl.searchParams.set("code", code);

    const tokenResponse = await fetch(tokenUrl);

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok || !tokenData.access_token) {
      throw new Error(
        tokenData.error?.message ||
          "Failed to exchange Facebook OAuth code",
      );
    }

    const pagesUrl = new URL(
      `https://graph.facebook.com/${GRAPH_VERSION}/me/accounts`,
    );

    pagesUrl.searchParams.set(
      "fields",
      "id,name,access_token,instagram_business_account{id,username}",
    );

    pagesUrl.searchParams.set(
      "access_token",
      tokenData.access_token,
    );

    const pagesResponse = await fetch(pagesUrl);

    const pagesData = await pagesResponse.json();

    if (!pagesResponse.ok) {
      throw new Error(
        pagesData.error?.message ||
          "Failed to load Facebook Pages",
      );
    }

    const page = pagesData.data?.[0];

    if (!page?.id || !page?.access_token) {
      throw new Error(
        "No Facebook Page was granted to Smart Cleaning Desk",
      );
    }

    const instagram = page.instagram_business_account;

    await prisma.metaIntegration.upsert({
      where: {
        userId_platform_externalAccountId: {
          userId: user.id,
          platform: "FACEBOOK",
          externalAccountId: page.id,
        },
      },
      update: {
        externalAccountName: page.name,
        accessToken: page.access_token,
        scopes:
          "pages_show_list,pages_manage_metadata,pages_messaging,pages_read_engagement",
        pageId: page.id,
        pageName: page.name,
        instagramAccountId: instagram?.id ?? null,
        updatedAt: new Date(),
      },
      create: {
        userId: user.id,
        platform: "FACEBOOK",
        externalAccountId: page.id,
        externalAccountName: page.name,
        accessToken: page.access_token,
        scopes:
          "pages_show_list,pages_manage_metadata,pages_messaging,pages_read_engagement",
        pageId: page.id,
        pageName: page.name,
        instagramAccountId: instagram?.id ?? null,
      },
    });

    const response = NextResponse.redirect(
      new URL(
        "/dashboard/integrations/facebook?connected=1",
        request.url,
      ),
    );

    response.cookies.delete("meta_oauth_state");

    return response;
  } catch (error) {
    console.error(
      "Facebook OAuth callback failed:",
      error,
    );

    return NextResponse.redirect(
      new URL(
        "/dashboard/integrations/facebook?error=connection_failed",
        request.url,
      ),
    );
  }
}
