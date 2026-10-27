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
    return NextResponse.redirect(new URL("/pricing?trial=expired", request.url));
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { plan },
  });

  return NextResponse.redirect(new URL("/dashboard", request.url));
}


export async function GET(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    const url = new URL("/login", request.url);
    url.searchParams.set("callbackUrl", new URL(request.url).pathname + new URL(request.url).search);
    return NextResponse.redirect(url);
  }

  const requestUrl = new URL(request.url);
  const planKey = String(requestUrl.searchParams.get("plan") ?? "").toLowerCase() as keyof typeof validPlans;
  const plan = validPlans[planKey];

  if (!plan) {
    return NextResponse.redirect(new URL("/pricing?error=invalid-plan", request.url));
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      stripeSubscriptionId: true,
      trialEndsAt: true,
    },
  });

  if (!user || user.stripeSubscriptionId) {
    return NextResponse.redirect(new URL("/pricing", request.url));
  }

  if (!user.trialEndsAt || user.trialEndsAt.getTime() <= Date.now()) {
    return NextResponse.redirect(new URL("/pricing?trial=expired", request.url));
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { plan },
  });

  return NextResponse.redirect(new URL("/dashboard", request.url));
}
