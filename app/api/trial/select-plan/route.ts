import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

const validPlans = {
  starter: "STARTER",
  business: "BUSINESS",
  pro: "PRO",
} as const;

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const planKey = String(body.plan ?? "").toLowerCase() as keyof typeof validPlans;
  const plan = validPlans[planKey];

  if (!plan) {
    return NextResponse.json({ error: "Invalid plan selected." }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      stripeSubscriptionId: true,
      trialStartedAt: true,
      trialEndsAt: true,
    },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found." }, { status: 404 });
  }

  if (user.stripeSubscriptionId) {
    return NextResponse.json({ error: "This account already has a subscription." }, { status: 409 });
  }

  if (!user.trialEndsAt || user.trialEndsAt.getTime() <= Date.now()) {
    return NextResponse.json({ error: "Your free trial has ended." }, { status: 410 });
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { plan },
  });

  return NextResponse.json({ success: true, plan: planKey });
}
