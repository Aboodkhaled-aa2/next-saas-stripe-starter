import { auth } from "@/auth";
import { pricingData } from "@/config/subscriptions";
import { runSalesAgent } from "@/lib/ai/sales-agent-runtime";

const WEBSITE_URL =
  process.env.NEXT_PUBLIC_APP_URL || "https://smartcleaningdesk.com";

function buildSalesKnowledge() {
  return {
    companyName: "Smart Cleaning Desk",
    productName: "Smart Cleaning Desk",
    websiteUrl: WEBSITE_URL,
    targetCustomer:
      "Cleaning companies in the United States that want to automate customer communication, lead handling, bookings, and AI phone support.",
    productSummary:
      "Smart Cleaning Desk is an AI automation platform for cleaning businesses. It helps businesses handle customer conversations, capture leads, manage customers, automate follow-ups, and, on supported plans, use AI voice reception and booking workflows.",
    keyFeatures: Array.from(
      new Set(pricingData.flatMap((plan) => plan.benefits)),
    ),
    pricing: pricingData
      .map(
        (plan) =>
          plan.title +
          ": $" +
          plan.prices.monthly +
          "/month or $" +
          plan.prices.yearly +
          "/year.",
      )
      .join("\n"),
    trial:
      "Use only the trial terms configured in the product. Do not invent trial details.",
    bookingRules:
      "Offer a demo or signup when appropriate. Never claim that a demo or follow-up was booked unless a scheduling tool confirms it.",
    complianceNotes:
      "Follow applicable calling, messaging, privacy, and opt-out requirements. Respect opt-out requests immediately and do not bypass legal or platform restrictions.",
  };
}

export async function POST(req: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  let body: unknown;

  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  const data = body as {
    message?: unknown;
    previousResponseId?: unknown;
  };

  if (typeof data.message !== "string" || !data.message.trim()) {
    return Response.json(
      { error: "A non-empty message is required." },
      { status: 400 },
    );
  }

  const previousResponseId =
    typeof data.previousResponseId === "string" && data.previousResponseId
      ? data.previousResponseId
      : undefined;

  try {
    const result = await runSalesAgent({
      knowledge: buildSalesKnowledge(),
      message: data.message.trim(),
      ownerUserId: session.user.id,
      websiteUrl: WEBSITE_URL,
      previousResponseId,
    });

    return Response.json(result);
  } catch (error) {
    console.error(
      "Sales Agent API error:",
      error instanceof Error ? error.message : String(error),
    );

    return Response.json(
      { error: "Unable to process the Sales Agent request." },
      { status: 500 },
    );
  }
}
