import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const payload = await request.json();

    console.log("DMLY webhook received", {
      event:
        typeof payload === "object" && payload !== null && "event" in payload
          ? payload.event
          : undefined,
    });

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("DMLY webhook error:", error);
    return NextResponse.json({ error: "Invalid webhook payload" }, { status: 400 });
  }
}
