import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { to, message } = body;

    if (!to || !message) {
      return NextResponse.json(
        { error: "Missing 'to' or 'message'" },
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
      `${spaceUrl}/api/laml/2010-04-01/Accounts/${projectId}/Messages.json`,
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
          To: to,
          Body: message,
        }).toString(),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        {
          error: "SignalWire SMS request failed",
          details: data,
        },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      messageSid: data.sid ?? data.message_sid ?? null,
    });
  } catch (error) {
    console.error("SMS error:", error);

    return NextResponse.json(
      { error: "Failed to send SMS" },
      { status: 500 }
    );
  }
}
