import { randomBytes } from "node:crypto";

import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/session";

export const dynamic = "force-dynamic";

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return entities[character] || character;
  });
}

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

  // Submit the authorization request as a browser form navigation rather than
  // a 302 to instagram.com. On iOS, direct navigations to Instagram can be
  // intercepted by the installed Instagram app instead of staying in Safari.
  const fields: Record<string, string> = {
    client_id: appId,
    redirect_uri: redirectUri,
    response_type: "code",
    state,
    scope:
      "instagram_business_basic,instagram_business_manage_comments,instagram_business_manage_messages",
  };

  const hiddenInputs = Object.entries(fields)
    .map(
      ([name, value]) =>
        `<input type="hidden" name="${escapeHtml(name)}" value="${escapeHtml(value)}">`,
    )
    .join("");

  const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Connecting to Instagram</title>
  <style>
    body{font-family:system-ui,-apple-system,sans-serif;background:#090d16;color:#f8fafc;display:grid;place-items:center;min-height:100vh;margin:0;padding:24px}
    main{text-align:center;max-width:420px}
    p{color:#cbd5e1;line-height:1.6}
    button{border:0;border-radius:10px;padding:12px 18px;font-size:16px;font-weight:600;background:#db2777;color:white}
  </style>
</head>
<body>
  <main>
    <p>Opening Instagram securely in your browser…</p>
    <form id="instagram-oauth-form" method="get" action="https://www.instagram.com/oauth/authorize">
      ${hiddenInputs}
      <button type="submit">Continue to Instagram</button>
    </form>
  </main>
  <script>
    document.getElementById("instagram-oauth-form").submit();
  </script>
</body>
</html>`;

  const response = new NextResponse(html, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store, max-age=0",
      "Referrer-Policy": "no-referrer",
    },
  });

  response.cookies.set("meta_instagram_oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 10 * 60,
    path: "/",
  });

  return response;
}
