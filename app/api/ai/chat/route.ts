import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { runCustomerAgent } from "@/lib/ai/customer-agent-runtime";
import { getUserSubscriptionPlan } from "@/lib/subscription";

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
    const previousResponseId =
      typeof body.previousResponseId === "string"
        ? body.previousResponseId.trim()
        : undefined;

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 },
      );
    }

    if (!user.id) {
      return NextResponse.json(
        { error: "User ID is missing" },
        { status: 400 },
      );
    }

    if (user.role !== "ADMIN") {
      const subscriptionPlan = await getUserSubscriptionPlan(user.id);

      if (!subscriptionPlan.isPaid) {
        return NextResponse.json(
          { error: "An active subscription is required to use the AI employee." },
          { status: 402 },
        );
      }
    }

    const result = await runCustomerAgent({
      userId: user.id,
      message,
      ...(previousResponseId ? { previousResponseId } : {}),
    });

    return NextResponse.json({
      success: true,
      message: result.text,
      responseId: result.responseId,
    });
  } catch (error) {
    console.error("AI chat error:", error);

    return NextResponse.json(
      { error: "Failed to generate AI response" },
      { status: 500 },
    );
  }
}
