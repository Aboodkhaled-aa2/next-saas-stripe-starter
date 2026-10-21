import { createCipheriv, createHash, randomBytes } from "node:crypto";

import { NextResponse } from "next/server";

import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

const GRAPH_VERSION = process.env.META_GRAPH_VERSION || "v26.0";

type PendingFacebookPage = {
  id: string;
  name: string;
  access_token: string;
  instagram_business_account?: { id: string; username?: string };
};

function encryptPendingPages(pages: PendingFacebookPage[], userId: string) {
  const secret = process.env.META_APP_SECRET;
  if (!secret) throw new Error("Facebook integration is not configured.");
  const key = createHash("sha256").update(secret).digest();
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([
    cipher.update(JSON.stringify({ pages, userId }), "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, encrypted]).toString("base64url");
}

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

function renderPageSelection(pages: PendingFacebookPage[]) {
  const options = pages.map((page, index) => {
    const checked = index === 0 ? " checked" : "";
    return `<label class="option"><input type="radio" name="pageId" value="${escapeHtml(page.id)}"${checked} required><span><strong>${escapeHtml(page.name || "Facebook Page")}</strong><small>Business Page</small></span></label>`;
  }).join("");
  return `<!doctype html><html lang="en"><head><meta name="viewport" content="width=device-width,initial-scale=1"><title>Select Facebook Page</title><style>*{box-sizing:border-box}body{margin:0;background:#090d16;color:#f8fafc;font-family:system-ui,-apple-system,sans-serif;padding:24px}.card{max-width:560px;margin:7vh auto;background:#111827;border:1px solid #293548;border-radius:20px;padding:24px}h1{font-size:24px;margin:0 0 8px}p{color:#aab6c8;line-height:1.55}.option{display:flex;gap:12px;align-items:center;padding:16px;border:1px solid #334155;border-radius:12px;margin:12px 0;cursor:pointer}.option input{width:18px;height:18px;accent-color:#2563eb}.option span{display:flex;flex-direction:column;gap:4px}.option small{color:#94a3b8}button{width:100%;margin-top:16px;padding:14px;border:0;border-radius:12px;background:#fff;color:#111827;font-weight:700;font-size:16px;cursor:pointer}</style></head><body><main class="card"><h1>Choose your business Page</h1><p>Select the Facebook Page Smart Cleaning Desk should connect to. Personal profiles cannot be connected by themselves.</p><form method="post" action="/api/integrations/meta/facebook/select">${options}<button type="submit">Connect selected Page</button></form></main></body></html>`;
}


type FacebookCallbackMode = "redirect" | "json";

async function handleFacebookCallback(
  request: Request,
  code: string,
  state: string,
  mode: FacebookCallbackMode,
) {
  const user = await getCurrentUser();

  if (!user?.id) {
    if (mode === "json") {
      return NextResponse.json(
        { error: "Unauthorized." },
        { status: 401 },
      );
    }

    return NextResponse.redirect(new URL("/login", request.url));
  }

  const cookieHeader = request.headers.get("cookie") || "";

  const stateCookie = cookieHeader
    .split(";")
    .map((item) => item.trim())
    .find((item) => item.startsWith("meta_oauth_state="));

  const expectedState = stateCookie
    ? decodeURIComponent(
        stateCookie.substring("meta_oauth_state=".length),
      )
    : null;

  if (!expectedState || state !== expectedState) {
    if (mode === "json") {
      return NextResponse.json(
        { error: "Invalid OAuth state." },
        { status: 400 },
      );
    }

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
    if (mode === "json") {
      return NextResponse.json(
        { error: "Meta Facebook Login is not configured." },
        { status: 500 },
      );
    }

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
      "https://graph.facebook.com/" +
        GRAPH_VERSION +
        "/oauth/access_token",
    );

    tokenUrl.searchParams.set("client_id", appId);
    tokenUrl.searchParams.set("client_secret", appSecret);
    tokenUrl.searchParams.set("redirect_uri", redirectUri);
    tokenUrl.searchParams.set("code", code);

    const tokenResponse = await fetch(tokenUrl, {
      cache: "no-store",
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok || !tokenData.access_token) {
      throw new Error(
        tokenData.error?.message ||
          "Failed to exchange Facebook OAuth code.",
      );
    }

    const pagesUrl = new URL(
      "https://graph.facebook.com/" +
        GRAPH_VERSION +
        "/me/accounts",
    );

    pagesUrl.searchParams.set(
      "fields",
      "id,name,access_token,instagram_business_account{id,username}",
    );
    pagesUrl.searchParams.set(
      "access_token",
      tokenData.access_token,
    );

    const pagesResponse = await fetch(pagesUrl, {
      cache: "no-store",
    });

    const pagesData = await pagesResponse.json();

    if (!pagesResponse.ok) {
      throw new Error(
        pagesData.error?.message ||
          "Failed to load Facebook Pages.",
      );
    }

    const pages = (Array.isArray(pagesData.data) ? pagesData.data : [])
      .filter((page: PendingFacebookPage) => page?.id && page?.access_token);

    if (pages.length === 0) {
      throw new Error(
        "No Facebook Business Page was granted. Sign in with a Facebook account that manages a Page, then grant access to that Page.",
      );
    }

    if (mode === "redirect") {
      const response = new NextResponse(renderPageSelection(pages), {
        headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" },
      });
      response.cookies.set("meta_fb_pending_pages", encryptPendingPages(pages, user.id), {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 10 * 60,
        path: "/",
      });
      return response;
    }

    const page = pages[0];
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

    // Subscribe the connected Facebook Page to Messenger webhook events.
    // This is required so incoming Page messages are delivered to /api/webhooks/meta.
    const subscribeUrl = new URL(
      `https://graph.facebook.com/${GRAPH_VERSION}/${encodeURIComponent(page.id)}/subscribed_apps`,
    );
    subscribeUrl.searchParams.set("subscribed_fields", "messages");
    subscribeUrl.searchParams.set("access_token", page.access_token);

    const subscribeResponse = await fetch(subscribeUrl, {
      method: "POST",
      cache: "no-store",
    });
    const subscribeData = await subscribeResponse.json().catch(() => null);

    if (!subscribeResponse.ok || subscribeData?.success !== true) {
      throw new Error(
        subscribeData?.error?.message ||
          "Failed to subscribe Facebook Page to Messenger webhooks.",
      );
    }

    if (mode === "json") {
      return NextResponse.json({
        connected: true,
        pageId: page.id,
        pageName: page.name,
      });
    }

    const response = NextResponse.redirect(
      new URL(
        "/dashboard/integrations/facebook?connected=1",
        request.url,
      ),
    );

    response.cookies.delete("meta_oauth_state");

    return response;
  } catch (error) {
    console.error("Facebook OAuth callback failed:", error);

    if (mode === "json") {
      return NextResponse.json(
        {
          error:
            error instanceof Error
              ? error.message
              : "Facebook connection failed.",
        },
        { status: 500 },
      );
    }

    return NextResponse.redirect(
      new URL(
        "/dashboard/integrations/facebook?error=connection_failed",
        request.url,
      ),
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const code =
      typeof body?.code === "string" ? body.code : null;

    const state =
      typeof body?.state === "string" ? body.state : null;

    if (!code || !state) {
      return NextResponse.json(
        { error: "Facebook authorization data is missing." },
        { status: 400 },
      );
    }

    return handleFacebookCallback(
      request,
      code,
      state,
      "json",
    );
  } catch (error) {
    console.error("Facebook OAuth POST failed:", error);

    return NextResponse.json(
      { error: "Facebook connection failed." },
      { status: 500 },
    );
  }
}

export async function GET(request: Request) {
  const url = new URL(request.url);

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

  return handleFacebookCallback(
    request,
    code,
    state,
    "redirect",
  );
}
