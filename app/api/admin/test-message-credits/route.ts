import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

const allowedPackages = new Set([1000, 5000, 10000]);

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const messages = Number(body?.messages);

  if (!allowedPackages.has(messages)) {
    return NextResponse.json({ error: "Invalid test credit package." }, { status: 400 });
  }

  const user = await prisma.user.update({
    where: { id: session.user.id },
    data: { extraMessageCredits: { increment: messages } },
    select: { extraMessageCredits: true },
  });

  return NextResponse.json({
    success: true,
    extraMessageCredits: user.extraMessageCredits,
    testMode: true,
  });
}
