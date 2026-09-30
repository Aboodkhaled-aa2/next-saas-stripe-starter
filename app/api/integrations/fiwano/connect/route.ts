import { auth } from "@/auth";
import {
  addFiwanoRedirect,
  createFiwanoSetupUrl,
  type FiwanoChannelType,
  listFiwanoRedirects,
} from "@/lib/fiwano";
import { NextResponse } from "next/server";

const ALLOWED_CHANNELS: FiwanoChannelType[] = [
  "whatsapp",
  "instagram",
  "facebook",
];

function getAppUrl() {
  const configured =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.AUTH_URL ||
    (process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "https://www.smartcleaningdesk.com");

  return configured.replace(/\/$/, "");
}

export async function GET(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const channelType = searchParams.get("channel");

  if (!channelType || !ALLOWED_CHANNELS.includes(channelType as FiwanoChannelType)) {
    return NextResponse.json(
      { error: "Invalid channel. Use whatsapp, instagram, or facebook." },
      { status: 400 },
    );
  }

  const appUrl = getAppUrl();
  const redirectUri = `${appUrl}/api/integrations/fiwano/callback`;

  try {
    const redirects = await listFiwanoRedirects();

    if (!redirects.redirects.some((item) => item.uri_pattern === redirectUri)) {
      await addFiwanoRedirect(redirectUri);
    }

    const setup = await createFiwanoSetupUrl(
      channelType as FiwanoChannelType,
      redirectUri,
    );

    return NextResponse.redirect(setup.setup_url);
  } catch (error) {
    console.error("Fiwano connect error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to start Fiwano connection",
      },
      { status: 502 },
    );
  }
}
