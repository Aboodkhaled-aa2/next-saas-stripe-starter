import { NextResponse } from "next/server";

import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { getUserSubscriptionPlan } from "@/lib/subscription";

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const businessProfile = await prisma.businessProfile.findUnique({
      where: {
        userId: user.id,
      },
      include: {
        aiPhoneSettings: true,
      },
    });

    return NextResponse.json({
      success: true,
      aiPhoneSettings: businessProfile?.aiPhoneSettings ?? null,
    });
  } catch (error) {
    console.error("AI Phone settings fetch error:", error);

    return NextResponse.json(
      { error: "Unable to load AI Phone settings." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();

    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const subscriptionPlan = await getUserSubscriptionPlan(user.id);
    const hasVoice =
      subscriptionPlan.title === "Business" ||
      subscriptionPlan.title === "Pro";

    if (!hasVoice) {
      return NextResponse.json(
        { error: "AI Phone requires a Business or Pro plan." },
        { status: 403 },
      );
    }

    const body = await request.json();

    const phoneNumber =
      typeof body.phoneNumber === "string" ? body.phoneNumber.trim() : "";
    const assistantName =
      typeof body.assistantName === "string"
        ? body.assistantName.trim()
        : "";
    const greeting =
      typeof body.greeting === "string" ? body.greeting.trim() : "";
    const provider =
      typeof body.provider === "string" ? body.provider.trim() : "Vapi";

    if (!phoneNumber || !assistantName) {
      return NextResponse.json(
        { error: "Phone number and AI receptionist name are required." },
        { status: 400 },
      );
    }

    if (phoneNumber.length > 40 || assistantName.length > 80) {
      return NextResponse.json(
        { error: "One or more fields are too long." },
        { status: 400 },
      );
    }

    const businessProfile = await prisma.businessProfile.findUnique({
      where: {
        userId: user.id,
      },
      select: {
        id: true,
        onboardingCompleted: true,
      },
    });

    if (!businessProfile?.onboardingCompleted) {
      return NextResponse.json(
        { error: "Complete your business profile before configuring AI Phone." },
        { status: 400 },
      );
    }

    const aiPhoneSettings = await prisma.aIPhoneSettings.upsert({
      where: {
        businessProfileId: businessProfile.id,
      },
      create: {
        businessProfileId: businessProfile.id,
        status: "READY",
        provider: provider || "Vapi",
        phoneNumber,
        assistantName,
        greeting: greeting || null,
        enabled: false,
      },
      update: {
        status: "READY",
        provider: provider || "Vapi",
        phoneNumber,
        assistantName,
        greeting: greeting || null,
        enabled: false,
      },
    });

    return NextResponse.json({
      success: true,
      aiPhoneSettings,
    });
  } catch (error) {
    console.error("AI Phone settings save error:", error);

    return NextResponse.json(
      { error: "Unable to save AI Phone settings." },
      { status: 500 },
    );
  }
}
