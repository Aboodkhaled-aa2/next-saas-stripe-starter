import { NextResponse } from "next/server";

import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { getUserSubscriptionPlan } from "@/lib/subscription";
import { isAIPhoneTrialTester } from "@/lib/ai-phone-access";

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const isAdmin = user.role === "ADMIN" && user.email?.toLowerCase() === "tawilabood8@gmail.com";
    const isTrialTester = isAIPhoneTrialTester(user.email);
    const subscriptionPlan = isAdmin || isTrialTester ? null : await getUserSubscriptionPlan(user.id);
    const canUseAIPhone = Boolean(
      subscriptionPlan?.isPaid &&
        (subscriptionPlan.title === "Business" || subscriptionPlan.title === "Pro"),
    );

    if (!isAdmin && !isTrialTester && !canUseAIPhone) {
      return NextResponse.json(
        { error: "AI Phone requires an active Business or Pro subscription." },
        { status: 403 },
      );
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
      isAdmin,
      aiPhoneSettings: businessProfile?.aiPhoneSettings ?? null,
      businessProfile: businessProfile
        ? {
            businessName: businessProfile.businessName,
            services: businessProfile.services,
            serviceAreas: businessProfile.serviceAreas,
            pricing: businessProfile.pricing,
            businessHours: businessProfile.businessHours,
            bookingRules: businessProfile.bookingRules,
            aiTone: businessProfile.aiTone,
            humanHandoffInstructions:
              businessProfile.humanHandoffInstructions,
          }
        : null,
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

    const isAdmin = user.role === "ADMIN" && user.email?.toLowerCase() === "tawilabood8@gmail.com";
    const isTrialTester = isAIPhoneTrialTester(user.email);
    const subscriptionPlan = isAdmin || isTrialTester ? null : await getUserSubscriptionPlan(user.id);
    const canUseAIPhone = Boolean(
      subscriptionPlan?.isPaid &&
        (subscriptionPlan.title === "Business" || subscriptionPlan.title === "Pro"),
    );

    if (!isAdmin && !isTrialTester && !canUseAIPhone) {
      return NextResponse.json(
        { error: "AI Phone requires an active Business or Pro subscription." },
        { status: 403 },
      );
    }

    const body = await request.json();

    const requestedPhoneNumber =
      typeof body.phoneNumber === "string" ? body.phoneNumber.trim() : "";

    const assistantName =
      typeof body.assistantName === "string"
        ? body.assistantName.trim()
        : "";
    const greeting =
      typeof body.greeting === "string" ? body.greeting.trim() : "";
    const provider =
      typeof body.provider === "string" ? body.provider.trim() : "Vapi";
    const speakingStyle =
      typeof body.speakingStyle === "string"
        ? body.speakingStyle.trim()
        : "";
    const handoffInstructions =
      typeof body.handoffInstructions === "string"
        ? body.handoffInstructions.trim()
        : "";

    const ownedPhoneNumber = requestedPhoneNumber
      ? await prisma.phoneNumber.findFirst({
          where: {
            userId: user.id,
            phoneNumber: requestedPhoneNumber,
            status: "ACTIVE",
          },
          select: { phoneNumber: true },
        })
      : await prisma.phoneNumber.findFirst({
          where: {
            userId: user.id,
            status: "ACTIVE",
          },
          orderBy: { purchasedAt: "desc" },
          select: { phoneNumber: true },
        });

    if (!ownedPhoneNumber?.phoneNumber) {
      return NextResponse.json(
        {
          error:
            "No active reception number is assigned to your account yet.",
        },
        { status: 409 },
      );
    }

    const phoneNumber = ownedPhoneNumber.phoneNumber;

    if (!assistantName) {
      return NextResponse.json(
        { error: "AI receptionist name is required." },
        { status: 400 },
      );
    }

    if (assistantName.length > 80) {
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
        aiTone: true,
        humanHandoffInstructions: true,
      },
    });

    if (!businessProfile?.onboardingCompleted) {
      return NextResponse.json(
        { error: "Complete your business profile before configuring AI Phone." },
        { status: 400 },
      );
    }

    const existingSettings = await prisma.aIPhoneSettings.findUnique({
      where: { businessProfileId: businessProfile.id },
      select: {
        phoneNumber: true,
        status: true,
        enabled: true,
      },
    });

    const keepNumberActive = Boolean(
      existingSettings?.enabled &&
      existingSettings.status === "ACTIVE" &&
      existingSettings.phoneNumber === phoneNumber
    );

    const aiPhoneSettings = await prisma.aIPhoneSettings.upsert({
      where: {
        businessProfileId: businessProfile.id,
      },
      create: {
        businessProfileId: businessProfile.id,
        status: keepNumberActive ? "ACTIVE" : "READY",
        provider: provider || "Vapi",
        phoneNumber,
        assistantName,
        greeting: greeting || null,
        enabled: keepNumberActive,
      },
      update: {
        status: keepNumberActive ? "ACTIVE" : "READY",
        provider: provider || "Vapi",
        phoneNumber,
        assistantName,
        greeting: greeting || null,
        enabled: keepNumberActive,
      },
    });

    if (speakingStyle || handoffInstructions) {
      await prisma.businessProfile.update({
        where: {
          id: businessProfile.id,
        },
        data: {
          ...(speakingStyle ? { aiTone: speakingStyle } : {}),
          ...(handoffInstructions
            ? { humanHandoffInstructions: handoffInstructions }
            : {}),
        },
      });
    }

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
