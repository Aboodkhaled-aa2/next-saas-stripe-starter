import { randomBytes } from "node:crypto";

import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/session";

const GRAPH_VERSION = process.env.META_GRAPH_VERSION || "v26.0";
const FACEBOOK_LOGIN_CONFIG_ID = "2220941915519031";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const user = await getCurrentUser();

  if (!user?.id) {
    const loginUrl = new URL("/login", request.url);

    loginUrl.searchParams.set(
      "callbackUrl",
      "/dashboard/integrations/facebook",
    );

    return NextResponse.redirect(loginUrl);
  }

  const appId = process.env.META_APP_ID;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;

  if (!appId || !appUrl) {
    return NextResponse.json(
      {
        error:
          "Meta Facebook Login is not configured. Set META_APP_ID and NEXT_PUBLIC_APP_URL.",
      },
      { status: 500 },
    );
  }

  const redirectUri = new URL(
    "/api/integrations/meta/facebook/callback",
    appUrl,
  ).toString();

  const state = randomBytes(32).toString("hex");

  const authUrl = new URL(
    `https://www.facebook.com/${GRAPH_VERSION}/dialog/oauth`,
  );

  authUrl.searchParams.set("client_id", appId);
  authUrl.searchParams.set("redirect_uri", redirectUri);
  authUrl.searchParams.set(
    "config_id",
    FACEBOOK_LOGIN_CONFIG_ID,
  );
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set(
    "override_default_response_type",
    "true",
  );
  authUrl.searchParams.set("state", state);

  if (new URL(request.url).searchParams.get("prepare") === "1") {
    const response = NextResponse.json({
      state,
      configId: FACEBOOK_LOGIN_CONFIG_ID,
    });

    response.cookies.set("meta_oauth_state", state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 10 * 60,
      path: "/",
    });

    return response;
  }

  const response = NextResponse.redirect(authUrl);

  response.cookies.set("meta_oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 10 * 60,
    path: "/",
  });

  return response;
}
