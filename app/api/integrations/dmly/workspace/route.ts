import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { createDmlyWorkspace } from "@/lib/dmly";

const validPlans = new Set(["STARTER", "BUSINESS", "PRO"]);

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const existing = await prisma.dmlyWorkspace.findUnique({
      where: { userId: session.user.id },
    });

    if (existing) {
      return NextResponse.json({
        success: true,
        workspace: existing,
        created: false,
      });
    }

    const body = await request.json().catch(() => ({}));
    const requestedPlan = String(body.plan || session.user.plan || "STARTER").toUpperCase();
    const plan = validPlans.has(requestedPlan) ? requestedPlan.toLowerCase() : "starter";

    const workspace = await createDmlyWorkspace({
      name: String(body.name || session.user.name || "Cleaning Business").trim(),
      plan,
      brand: {
        color: "#22c55e",
      },
    });

    const workspaceId = String(
      workspace.workspaceId || workspace.id || "",
    ).trim();

    if (!workspaceId) {
      return NextResponse.json(
        { error: "DMLY did not return a workspace ID." },
        { status: 502 },
      );
    }

    const saved = await prisma.dmlyWorkspace.create({
      data: {
        userId: session.user.id,
        workspaceId,
        name: String(workspace.name || body.name || session.user.name || "Cleaning Business"),
        plan: workspace.plan || plan,
        metadata: workspace,
      },
    });

    return NextResponse.json({
      success: true,
      workspace: saved,
      provider: workspace,
      created: true,
    });
  } catch (error) {
    console.error("DMLY workspace provisioning failed:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to provision the messaging workspace.",
      },
      { status: 502 },
    );
  }
}
