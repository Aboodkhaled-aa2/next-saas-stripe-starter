import { createHmac } from "crypto";
import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/session";

export async function POST(request: Request) {
  const user = await getCurrentUser();

  if (!user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const appSecret = process.env.META_APP_SECRET;

  if (!appSecret) {
    return NextResponse.json(
      { error: "META_APP_SECRET is missing." },
      { status: 500 },
    );
  }

  const payload = {
    object: "whatsapp_business_account",
    entry: [
      {
        id: "TEST_WABA",
        changes: [
          {
            field: "messages",
            value: {
              metadata: {
                phone_number_id: "TEST_PHONE",
              },
              messages: [
                {
                  id: "TEST_MESSAGE",
                  from: "TEST_SENDER",
                  timestamp: String(Math.floor(Date.now() / 1000)),
                  type: "text",
                  text: { body: "SCD_WEBHOOK_INTERNAL_TEST" },
                },
              ],
            },
          },
        ],
      },
    ],
  };

  const body = JSON.stringify(payload);
  const signature =
    "sha256=" +
    createHmac("sha256", appSecret).update(body).digest("hex");

  const origin = new URL(request.url).origin;

  const response = await fetch(
    `${origin}/api/webhooks/meta`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-hub-signature-256": signature,
        "x-scd-internal-test": "1",
      },
      body,
      cache: "no-store",
    },
  );

  const responseText = await response.text();

  return NextResponse.json({
    testSent: true,
    webhookStatus: response.status,
    webhookResponse: responseText,
    expectedWebhookStatus: 200,
  });
}
