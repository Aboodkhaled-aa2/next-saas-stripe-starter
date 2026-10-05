import { randomBytes } from "node:crypto";

import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/session";

export async function POST() {
  const user = await getCurrentUser();

  if (!user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const appId = process.env.META_APP_ID;
  const configId = process.env.META_WHATSAPP_EMBEDDED_SIGNUP_CONFIG_ID;

  if (!appId || !configId) {
    return NextResponse.json(
      { error: "WhatsApp Embedded Signup is not configured." },
      { status: 500 },
    );
  }

  const state = randomBytes(32).toString("hex");
  const response = NextResponse.json({ appId, configId, state });

  response.cookies.set("meta_whatsapp_oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 10 * 60,
    path: "/",
  });

  return response;
}
