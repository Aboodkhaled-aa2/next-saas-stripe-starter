import { NextResponse } from "next/server";

import { auth } from "@/auth";

const INBOXSYNC_ACCOUNTS_URL = "https://api.inboxsync.app/v1/accounts";

export async function GET(request: Request) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const apiKey = process.env.INBOXSYNC_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      {
        error:
          "InboxSync is not configured. Set INBOXSYNC_API_KEY in the server environment.",
      },
      { status: 500 },
    );
  }

  try {
    const response = await fetch(INBOXSYNC_ACCOUNTS_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        provider: "instagram",
      }),
      cache: "no-store",
    });

    const data = (await response.json()) as {
      hosted_auth_url?: string;
      error?: {
        code?: string;
        message?: string;
      };
    };

    if (!response.ok || !data.hosted_auth_url) {
      console.error("InboxSync Instagram connection failed:", {
        status: response.status,
        data,
        userId,
      });

      const message =
        data.error?.message ||
        "InboxSync could not create the Instagram authorization session.";

      return NextResponse.json(
        {
          error: message,
          provider: "inboxsync",
          status: response.status,
        },
        { status: response.status >= 400 ? response.status : 502 },
      );
    }

    return NextResponse.redirect(data.hosted_auth_url);
  } catch (error) {
    console.error("InboxSync Instagram connection error:", error);

    return NextResponse.json(
      {
        error: "Unable to start the InboxSync Instagram authorization flow.",
      },
      { status: 500 },
    );
  }
}
