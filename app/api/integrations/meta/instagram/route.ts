import { createHmac, randomBytes } from "crypto";
import { NextResponse } from "next/server";

import { auth } from "@/auth";

const INSTAGRAM_OAUTH_AUTHORIZE_URL = "https://www.instagram.com/oauth/authorize";

const DEFAULT_INSTAGRAM_SCOPES = [
  "instagram_business_basic",
  "instagram_business_content_publish",
  "instagram_business_manage_comments",
  "instagram_business_manage_messages",
].join(",");

function createState(userId: string, secret: string) {
  const nonce = randomBytes(24).toString("hex");
  const payload = Buffer.from(
    JSON.stringify({
      userId,
      nonce,
      createdAt: Date.now(),
    }),
  ).toString("base64url");

  const signature = createHmac("sha256", secret)
    .update(payload)
    .digest("base64url");

  return `${payload}.${signature}`;
}

export async function GET(request: Request) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const appId = process.env.META_APP_ID;
  const stateSecret = process.env.AUTH_SECRET;
  const scopes = process.env.META_OAUTH_SCOPES?.trim() || DEFAULT_INSTAGRAM_SCOPES;

  if (!appId || !stateSecret) {
    return NextResponse.json(
      {
        error:
          "Instagram OAuth is not configured. Set META_APP_ID and AUTH_SECRET.",
      },
      { status: 500 },
    );
  }

  const redirectUri = new URL(
    "/api/integrations/meta/instagram/callback",
    request.url,
  ).toString();

  const authorizationUrl = new URL(INSTAGRAM_OAUTH_AUTHORIZE_URL);

  authorizationUrl.searchParams.set("client_id", appId);
  authorizationUrl.searchParams.set("redirect_uri", redirectUri);
  authorizationUrl.searchParams.set("response_type", "code");
  authorizationUrl.searchParams.set("enable_fb_login", "0");
  authorizationUrl.searchParams.set("force_authentication", "1");
  authorizationUrl.searchParams.set("state", createState(userId, stateSecret));
  authorizationUrl.searchParams.set("scope", scopes);

  return NextResponse.redirect(authorizationUrl);
}
