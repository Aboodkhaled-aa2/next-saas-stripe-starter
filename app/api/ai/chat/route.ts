import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/db";
import { openai } from "@/lib/openai";
import { buildEmployeeSystemPrompt } from "@/lib/ai/employee";

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 },
      );
    }

    const body = await req.json();
    const message =
      typeof body.message === "string" ? body.message.trim() : "";

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 },
      );
    }

    const businessProfile = await prisma.businessProfile.findUnique({
      where: {
        userId: user.id,
      },
    });

    if (!businessProfile) {
      return NextResponse.json(
        { error: "Business profile is not configured" },
        { status: 400 },
      );
    }

    const systemPrompt = buildEmployeeSystemPrompt(businessProfile);

    const response = await openai.responses.create({
      model: "gpt-5-mini",
      instructions: systemPrompt,
      input: message,
    });

    return NextResponse.json({
      success: true,
      message: response.output_text,
    });
  } catch (error) {
    console.error("AI chat error:", error);

    return NextResponse.json(
      { error: "Failed to generate AI response" },
      { status: 500 },
    );
  }
}
