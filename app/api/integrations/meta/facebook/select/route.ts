import { createDecipheriv, createHash } from "node:crypto";

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

function decryptPendingPages(value: string) {
  const secret = process.env.META_APP_SECRET;
  if (!secret) throw new Error("Facebook integration is not configured.");

  const packed = Buffer.from(value, "base64url");
  if (packed.length < 29) throw new Error("The pending Facebook selection expired.");

  const iv = packed.subarray(0, 12);
  const tag = packed.subarray(12, 28);
  const encrypted = packed.subarray(28);
  const key = createHash("sha256").update(secret).digest();
  const decipher = createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(tag);

  const decrypted = Buffer.concat([
    decipher.update(encrypted),
    decipher.final(),
  ]).toString("utf8");

  return JSON.parse(decrypted) as {
    pages: PendingFacebookPage[];
    userId: string;
  };
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user?.id) {
    return NextResponse.redirect(new URL("/login", request.url), 303);
  }

  const cookieHeader = request.headers.get("cookie") || "";
  const pendingCookie = cookieHeader
    .split(";")
    .map((item) => item.trim())
    .find((item) => item.startsWith("meta_fb_pending_pages="));

  if (!pendingCookie) {
    return NextResponse.redirect(
      new URL("/dashboard/integrations/facebook?error=selection_expired", request.url),
      303,
    );
  }

  try {
    const encryptedValue = decodeURIComponent(
      pendingCookie.substring("meta_fb_pending_pages=".length),
    );
    const pending = decryptPendingPages(encryptedValue);

    if (pending.userId !== user.id || !Array.isArray(pending.pages)) {
      throw new Error("Invalid Facebook page selection.");
    }

    const form = await request.formData();
    const pageId = form.get("pageId");
    if (typeof pageId !== "string") {
      throw new Error("Select a Facebook Page to continue.");
    }

    const page = pending.pages.find((item) => item.id === pageId);
    if (!page?.id || !page.access_token) {
      throw new Error("That Facebook Page was not part of the authorized selection.");
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
        scopes: "pages_show_list,pages_manage_metadata,pages_messaging,pages_read_engagement",
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
        scopes: "pages_show_list,pages_manage_metadata,pages_messaging,pages_read_engagement",
        pageId: page.id,
        pageName: page.name,
        instagramAccountId: instagram?.id ?? null,
      },
    });

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
      console.error("Facebook Page webhook subscription failed:", subscribeData);
      return NextResponse.redirect(
        new URL("/dashboard/integrations/facebook?error=webhook_subscription_failed", request.url),
        303,
      );
    }

    const response = NextResponse.redirect(
      new URL("/dashboard/integrations/facebook?connected=1", request.url),
      303,
    );
    response.cookies.delete("meta_fb_pending_pages");
    response.cookies.delete("meta_oauth_state");
    return response;
  } catch (error) {
    console.error("Facebook Page selection failed:", error);
    const response = NextResponse.redirect(
      new URL("/dashboard/integrations/facebook?error=page_selection_failed", request.url),
      303,
    );
    response.cookies.delete("meta_fb_pending_pages");
    return response;
  }
}
