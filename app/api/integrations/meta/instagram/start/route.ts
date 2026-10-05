import { randomBytes } from "node:crypto";

import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/session";

export async function GET(request: Request) {
  const user = await getCurrentUser();

  if (!user?.id) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const appId = process.env.META_INSTAGRAM_APP_ID;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;

  if (!appId || !appUrl) {
    return NextResponse.json(
      { error: "Instagram Business Login is not configured." },
      { status: 500 },
    );
  }

  const state = randomBytes(32).toString("hex");
  const redirectUri = new URL(
    "/api/integrations/meta/instagram/callback",
    appUrl,
  ).toString();

  const authUrl = new URL("https://www.instagram.com/oauth/authorize");
  authUrl.searchParams.set("force_reauth", "true");
  authUrl.searchParams.set("client_id", appId);
  authUrl.searchParams.set("redirect_uri", redirectUri);
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("state", state);
  authUrl.searchParams.set(
    "scope",
    "instagram_business_basic,instagram_business_manage_comments,instagram_business_manage_messages",
  );

  const response = NextResponse.redirect(authUrl);
  response.cookies.set("meta_instagram_oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 10 * 60,
    path: "/",
  });

  return response;
}
