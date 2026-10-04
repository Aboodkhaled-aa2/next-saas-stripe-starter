import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { env } from "@/env.mjs";

type SignalWireNumber = {
  number?: string;
  region?: string | null;
  city?: string | null;
  rate_center?: string | null;
  capabilities?: {
    voice?: boolean;
    sms?: boolean;
    mms?: boolean;
  };
};

export async function GET(req: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (
      !env.SIGNALWIRE_SPACE_URL ||
      !env.SIGNALWIRE_PROJECT_ID ||
      !env.SIGNALWIRE_API_TOKEN
    ) {
      return NextResponse.json(
        { error: "SignalWire is not configured." },
        { status: 503 },
      );
    }

    const url = new URL(req.url);
    const areaCode = url.searchParams.get("areaCode")?.trim();
    const region = url.searchParams.get("region")?.trim().toUpperCase();
    const city = url.searchParams.get("city")?.trim();
    const requestedLimit = Number(url.searchParams.get("limit") ?? "10");
    const limit = Number.isFinite(requestedLimit)
      ? Math.min(Math.max(Math.floor(requestedLimit), 1), 50)
      : 10;

    if (areaCode && !/^\\d{3}$/.test(areaCode)) {
      return NextResponse.json(
        { error: "Area code must be exactly 3 digits." },
        { status: 400 },
      );
    }

    if (region && !/^[A-Z]{2}$/.test(region)) {
      return NextResponse.json(
        { error: "Region must be a 2-letter US state code." },
        { status: 400 },
      );
    }

    if (city && !region) {
      return NextResponse.json(
        { error: "Region is required when searching by city." },
        { status: 400 },
      );
    }

    const params = new URLSearchParams({
      number_type: "local",
      max_results: String(limit),
    });

    if (areaCode) params.set("areacode", areaCode);
    if (region) params.set("region", region);
    if (city) params.set("city", city);

    const baseUrl = env.SIGNALWIRE_SPACE_URL.replace(/\/$/, "");
    const signalWireResponse = await fetch(
      `${baseUrl}/api/relay/rest/phone_numbers/search?${params.toString()}`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization:
            "Basic " +
            Buffer.from(
              `${env.SIGNALWIRE_PROJECT_ID}:${env.SIGNALWIRE_API_TOKEN}`,
            ).toString("base64"),
        },
        cache: "no-store",
      },
    );

    const payload = await signalWireResponse.json().catch(() => null);

    if (!signalWireResponse.ok) {
      console.error(
        "[SIGNALWIRE PHONE SEARCH ERROR]",
        signalWireResponse.status,
        payload,
      );

      return NextResponse.json(
        { error: "Unable to search available phone numbers." },
        { status: 502 },
      );
    }

    const data = Array.isArray(payload?.data)
      ? (payload.data as SignalWireNumber[])
      : [];

    return NextResponse.json({
      numbers: data.map((item) => ({
        number: item.number ?? null,
        region: item.region ?? null,
        city: item.city ?? null,
        rateCenter: item.rate_center ?? null,
        capabilities: {
          voice: Boolean(item.capabilities?.voice),
          sms: Boolean(item.capabilities?.sms),
          mms: Boolean(item.capabilities?.mms),
        },
      })),
    });
  } catch (error) {
    console.error("[PHONE NUMBER SEARCH ERROR]", error);

    return NextResponse.json(
      { error: "Unable to search available phone numbers." },
      { status: 500 },
    );
  }
}
