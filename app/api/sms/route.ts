import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { to, message } = body ?? {};

    if (
      typeof to !== "string" ||
      !to.trim() ||
      typeof message !== "string" ||
      !message.trim()
    ) {
      return NextResponse.json(
        { error: "Missing 'to' or 'message'" },
        { status: 400 }
      );
    }

    if (message.length > 1600) {
      return NextResponse.json(
        { error: "Message is too long." },
        { status: 400 }
      );
    }

    const spaceUrl = process.env.SIGNALWIRE_SPACE_URL;
    const projectId = process.env.SIGNALWIRE_PROJECT_ID;
    const apiToken = process.env.SIGNALWIRE_API_TOKEN;
    const fromNumber = process.env.SIGNALWIRE_FROM_NUMBER;

    if (!spaceUrl || !projectId || !apiToken || !fromNumber) {
      return NextResponse.json(
        { error: "SignalWire environment variables are not configured" },
        { status: 500 }
      );
    }

    const response = await fetch(
      `${spaceUrl.replace(/\/$/, "")}/api/laml/2010-04-01/Accounts/${projectId}/Messages.json`,
      {
        method: "POST",
        headers: {
          Authorization:
            "Basic " +
            Buffer.from(`${projectId}:${apiToken}`).toString("base64"),
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          From: fromNumber,
          To: to.trim(),
          Body: message.trim(),
        }).toString(),
        cache: "no-store",
      }
    );

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      console.error("SignalWire SMS request failed", response.status);
      return NextResponse.json(
        { error: "SignalWire SMS request failed" },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      messageSid: data?.sid ?? data?.message_sid ?? null,
    });
  } catch (error) {
    console.error("SMS error:", error);
    return NextResponse.json(
      { error: "Failed to send SMS" },
      { status: 500 }
    );
  }
}
