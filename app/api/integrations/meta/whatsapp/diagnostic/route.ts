import { NextResponse } from "next/server";

import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

const GRAPH_VERSION = process.env.META_GRAPH_VERSION || "v26.0";

export async function GET() {
  const user = await getCurrentUser();

  if (!user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const integration = await prisma.metaIntegration.findFirst({
    where: {
      userId: user.id,
      platform: "WHATSAPP",
    },
    orderBy: { updatedAt: "desc" },
    select: {
      whatsappBusinessId: true,
      whatsappPhoneNumberId: true,
      accessToken: true,
    },
  });

  if (
    !integration?.whatsappBusinessId ||
    !integration.whatsappPhoneNumberId ||
    !integration.accessToken
  ) {
    return NextResponse.json(
      { error: "No complete WhatsApp integration found." },
      { status: 404 },
    );
  }

  try {
    const response = await fetch(
      `https://graph.facebook.com/${GRAPH_VERSION}/${encodeURIComponent(
        integration.whatsappBusinessId,
      )}/subscribed_apps`,
      {
        headers: {
          Authorization: `Bearer ${integration.accessToken}`,
        },
        cache: "no-store",
      },
    );

    const data = await response.json().catch(() => null);

    const apps = Array.isArray(data?.data) ? data.data : [];
    const appId = process.env.META_APP_ID;
    const currentApp = apps.find(
      (item: {
        whatsapp_business_api_data?: { id?: string; name?: string; link?: string };
      }) => item?.whatsapp_business_api_data?.id === appId,
    );

    return NextResponse.json({
      ok: response.ok,
      status: response.status,
      wabaId: integration.whatsappBusinessId,
      phoneNumberId: integration.whatsappPhoneNumberId,
      configuredAppId: appId ?? null,
      subscribedApps: apps,
      currentAppSubscribed: Boolean(currentApp),
      currentApp: currentApp ?? null,
      metaError: data?.error?.message ?? null,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to query WhatsApp WABA subscriptions.",
      },
      { status: 500 },
    );
  }
}
