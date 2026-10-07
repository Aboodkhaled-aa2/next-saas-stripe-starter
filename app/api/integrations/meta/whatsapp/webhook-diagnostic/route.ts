import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/session";

const GRAPH_VERSION = process.env.META_GRAPH_VERSION || "v26.0";

export async function GET() {
  const user = await getCurrentUser();

  if (!user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const appId = process.env.META_APP_ID;
  const appSecret = process.env.META_APP_SECRET;

  if (!appId || !appSecret) {
    return NextResponse.json(
      { error: "META_APP_ID or META_APP_SECRET is missing." },
      { status: 500 },
    );
  }

  try {
    const appAccessToken = `${appId}|${appSecret}`;
    const response = await fetch(
      `https://graph.facebook.com/${GRAPH_VERSION}/${appId}/subscriptions?access_token=${encodeURIComponent(
        appAccessToken,
      )}`,
      { cache: "no-store" },
    );

    const data = await response.json().catch(() => null);

    return NextResponse.json({
      ok: response.ok,
      status: response.status,
      appId,
      subscriptions: data?.data ?? [],
      metaError: data?.error?.message ?? null,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to query Meta app subscriptions.",
      },
      { status: 500 },
    );
  }
}
