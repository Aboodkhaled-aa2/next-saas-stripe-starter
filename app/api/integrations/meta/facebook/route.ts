import { createHmac, randomBytes } from "crypto";
import { NextResponse } from "next/server";

import { auth } from "@/auth";

const FACEBOOK_OAUTH_AUTHORIZE_URL =
  "https://www.facebook.com/v26.0/dialog/oauth";

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
  const scopes = process.env.META_FACEBOOK_OAUTH_SCOPES;

  if (!appId || !stateSecret || !scopes) {
    return NextResponse.json(
      {
        error:
          "Facebook OAuth is not configured. Set META_APP_ID, AUTH_SECRET, and META_FACEBOOK_OAUTH_SCOPES.",
      },
      { status: 500 },
    );
  }

  const redirectUri = new URL(
    "/api/integrations/meta/facebook/callback",
    request.url,
  ).toString();

  const authorizationUrl = new URL(FACEBOOK_OAUTH_AUTHORIZE_URL);

  authorizationUrl.searchParams.set("client_id", appId);
  authorizationUrl.searchParams.set("redirect_uri", redirectUri);
  authorizationUrl.searchParams.set("response_type", "code");
  authorizationUrl.searchParams.set("state", createState(userId, stateSecret));
  authorizationUrl.searchParams.set("scope", scopes);

  return NextResponse.redirect(authorizationUrl);
}
