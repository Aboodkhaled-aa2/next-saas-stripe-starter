import { createHmac, timingSafeEqual } from "crypto";
import { NextResponse } from "next/server";

const GRAPH_VERIFY_MODE = "subscribe";

function verifySignature(body: string, signature: string, appSecret: string) {
  const [algorithm, received] = signature.split("=");

  if (algorithm !== "sha256" || !received) {
    return false;
  }

  const expected = createHmac("sha256", appSecret)
    .update(body, "utf8")
    .digest("hex");

  const receivedBuffer = Buffer.from(received, "hex");
  const expectedBuffer = Buffer.from(expected, "hex");

  return (
    receivedBuffer.length === expectedBuffer.length &&
    timingSafeEqual(receivedBuffer, expectedBuffer)
  );
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

  if (!signature || !appSecret || !verifySignature(body, signature, appSecret)) {
    return new NextResponse("Invalid signature", { status: 403 });
  }

  try {
    const payload = JSON.parse(body) as {
      object?: string;
      entry?: Array<unknown>;
    };

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
