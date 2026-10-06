import { NextResponse } from "next/server";

import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

const GRAPH_VERSION = process.env.META_GRAPH_VERSION || "v26.0";

export async function DELETE() {
  const user = await getCurrentUser();

  if (!user?.id) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const integration = await prisma.metaIntegration.findFirst({
      where: {
        userId: user.id,
        platform: "WHATSAPP",
      },
      select: {
        id: true,
        whatsappBusinessId: true,
        accessToken: true,
      },
    });

    if (!integration) {
      return NextResponse.json(
        { error: "WhatsApp is not connected." },
        { status: 404 },
      );
    }

    if (integration.whatsappBusinessId && integration.accessToken) {
      const unsubscribeUrl = new URL(
        `https://graph.facebook.com/${GRAPH_VERSION}/${encodeURIComponent(
          integration.whatsappBusinessId,
        )}/subscribed_apps`,
      );
      unsubscribeUrl.searchParams.set(
        "access_token",
        integration.accessToken,
      );

      const unsubscribeResponse = await fetch(unsubscribeUrl, {
        method: "DELETE",
        cache: "no-store",
      });

      if (!unsubscribeResponse.ok) {
        const data = await unsubscribeResponse.json().catch(() => null);
        console.error("WhatsApp webhook unsubscribe failed:", data);
      }
    }

    await prisma.metaIntegration.delete({
      where: { id: integration.id },
    });

    return NextResponse.json({ disconnected: true });
  } catch (error) {
    console.error("WhatsApp disconnect failed:", error);

    return NextResponse.json(
      { error: "Failed to disconnect WhatsApp." },
      { status: 500 },
    );
  }
}
