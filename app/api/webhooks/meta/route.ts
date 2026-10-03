import { createHmac, timingSafeEqual } from "crypto";
import { NextResponse } from "next/server";

const GRAPH_VERIFY_MODE = "subscribe";

function verifySignature(body: string, signature: string, appSecret: string) {
  if (!signature.startsWith("sha256=")) {
    console.log("META SIGNATURE DEBUG: invalid prefix");
    return false;
  }

  const received = signature.slice("sha256=".length);

  const expected = createHmac("sha256", appSecret)
    .update(body)
    .digest("hex");

  console.log("META SIGNATURE DEBUG:", {
    bodyLength: body.length,
    bodyFirstChar: body.charAt(0),
    bodyLastChar: body.charAt(body.length - 1),
    receivedLength: received.length,
    expectedLength: expected.length,
    matches: received === expected,
  });

  return received === expected;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const mode = url.searchParams.get("hub.mode");
  const verifyToken = url.searchParams.get("hub.verify_token");
  const challenge = url.searchParams.get("hub.challenge");

  const configuredVerifyToken = process.env.META_WEBHOOK_VERIFY_TOKEN;

  if (
    mode !== GRAPH_VERIFY_MODE ||
    !configuredVerifyToken ||
    verifyToken !== configuredVerifyToken ||
    !challenge
  ) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  return new NextResponse(challenge, { status: 200 });
}

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("x-hub-signature-256");
  const appSecret = process.env.META_APP_SECRET;

  console.log("META WEBHOOK DEBUG:", {
    hasSignature: Boolean(signature),
    signaturePrefix: signature?.slice(0, 7),
    hasAppSecret: Boolean(appSecret),
    bodyLength: body.length,
  });

  console.log("META WEBHOOK RECEIVED:", {
    hasSignature: Boolean(signature),
    contentType: request.headers.get("content-type"),
    bodyLength: body.length,
  });


  try {
    const payload = JSON.parse(body) as {
      object?: string;
      entry?: Array<unknown>;
    };

    console.log(
      "META WEBHOOK PAYLOAD:",
      JSON.stringify(payload, null, 2),
    );

    console.log("Meta webhook event received:", {
      object: payload.object,
      entries: payload.entry?.length ?? 0,
    });

    return new NextResponse("EVENT_RECEIVED", { status: 200 });
  } catch (error) {
    console.error(
      "Meta webhook JSON parse error:",
      error instanceof Error ? error.message : String(error),
    );

    return new NextResponse("Invalid payload", { status: 400 });
  }
}
