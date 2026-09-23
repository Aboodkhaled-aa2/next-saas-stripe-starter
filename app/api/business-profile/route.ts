import { NextResponse } from "next/server";

import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();

    if (!user?.id) {
      return NextResponse.json(
        { error: "Unauthorized." },
        { status: 401 },
      );
    }

    const body = await request.json();

    const {
      businessName,
      businessPhone,
      businessEmail,
      websiteUrl,
      services,
      serviceAreas,
      pricing,
      businessHours,
      paymentMethods,
      bookingRules,
      cancellationPolicy,
      reschedulingPolicy,
      aiInstructions,
      aiTone,
      humanHandoffInstructions,
    } = body;

    if (
      !businessName?.trim() ||
      !businessPhone?.trim() ||
      !businessEmail?.trim()
    ) {
      return NextResponse.json(
        { error: "Business name, phone, and email are required." },
        { status: 400 },
      );
    }

    if (!Array.isArray(services) || services.length === 0) {
      return NextResponse.json(
        { error: "Please select at least one service." },
        { status: 400 },
      );
    }

    if (!pricing?.trim()) {
      return NextResponse.json(
        { error: "Pricing information is required." },
        { status: 400 },
      );
    }

    if (!serviceAreas?.trim() || !businessHours?.trim()) {
      return NextResponse.json(
        { error: "Service areas and business hours are required." },
        { status: 400 },
      );
    }

    if (!Array.isArray(paymentMethods) || paymentMethods.length === 0) {
      return NextResponse.json(
        { error: "Please select at least one payment method." },
        { status: 400 },
      );
    }

    if (
      !cancellationPolicy?.trim() ||
      !reschedulingPolicy?.trim()
    ) {
      return NextResponse.json(
        { error: "Cancellation and rescheduling policies are required." },
        { status: 400 },
      );
    }

    const businessProfile = await prisma.businessProfile.upsert({
      where: {
        userId: user.id,
      },
      create: {
        userId: user.id,
        businessName: businessName.trim(),
        businessPhone: businessPhone.trim(),
        businessEmail: businessEmail.trim().toLowerCase(),
        websiteUrl: websiteUrl?.trim() || null,
        services,
        serviceAreas: serviceAreas.trim(),
        pricing: pricing.trim(),
        businessHours: businessHours.trim(),
        paymentMethods,
        bookingRules: bookingRules?.trim() || null,
        cancellationPolicy: cancellationPolicy.trim(),
        reschedulingPolicy: reschedulingPolicy.trim(),
        aiInstructions: aiInstructions?.trim() || null,
        aiTone: aiTone?.trim() || "Professional and friendly",
        humanHandoffInstructions:
          humanHandoffInstructions?.trim() || null,
        onboardingCompleted: true,
      },
      update: {
        businessName: businessName.trim(),
        businessPhone: businessPhone.trim(),
        businessEmail: businessEmail.trim().toLowerCase(),
        websiteUrl: websiteUrl?.trim() || null,
        services,
        serviceAreas: serviceAreas.trim(),
        pricing: pricing.trim(),
        businessHours: businessHours.trim(),
        paymentMethods,
        bookingRules: bookingRules?.trim() || null,
        cancellationPolicy: cancellationPolicy.trim(),
        reschedulingPolicy: reschedulingPolicy.trim(),
        aiInstructions: aiInstructions?.trim() || null,
        aiTone: aiTone?.trim() || "Professional and friendly",
        humanHandoffInstructions:
          humanHandoffInstructions?.trim() || null,
        onboardingCompleted: true,
      },
    });

    return NextResponse.json({
      success: true,
      businessProfileId: businessProfile.id,
    });
  } catch (error) {
    console.error("Business profile save error:", error);

    return NextResponse.json(
      { error: "Unable to save your business profile." },
      { status: 500 },
    );
  }
}
