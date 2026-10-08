import { NextResponse } from "next/server";

import { prisma } from "@/lib/db";
import { stripe } from "@/lib/stripe";
import {
  buildCustomerAgentSystemPrompt,
  type CustomerAgentBusinessProfile,
} from "@/lib/ai/customer-agent";
import { executeCustomerAgentToolCall } from "@/lib/ai/customer-agent-runtime";

const toolSchemas = [
  {
    type: "function",
    function: {
      name: "save_customer_lead",
      description:
        "Save or update a cleaning business lead when a caller provides contact information or requests a service.",
      strict: true,
      parameters: {
        type: "object",
        properties: {
          name: { type: ["string", "null"] },
          phone: { type: ["string", "null"] },
          email: { type: ["string", "null"] },
          service: { type: ["string", "null"] },
          location: { type: ["string", "null"] },
          notes: { type: ["string", "null"] },
        },
        required: ["name", "phone", "email", "service", "location", "notes"],
        additionalProperties: false,
      },
    },
    server: {
      url: "https://www.smartcleaningdesk.com/api/ai-phone/vapi",
    },
  },
  {
    type: "function",
    function: {
      name: "get_booking_duration_rules",
      description:
        "Read the company's configured cleaning appointment duration. Never invent a duration.",
      strict: true,
      parameters: {
        type: "object",
        properties: {
          bedrooms: { type: ["number", "null"] },
          bathrooms: { type: ["number", "null"] },
          propertySize: { type: ["string", "null"] },
        },
        required: ["bedrooms", "bathrooms", "propertySize"],
        additionalProperties: false,
      },
    },
    server: {
      url: "https://www.smartcleaningdesk.com/api/ai-phone/vapi",
    },
  },
  {
    type: "function",
    function: {
      name: "find_booking",
      description:
        "Find a caller's non-cancelled booking using phone or email. Use this before changing or cancelling a booking.",
      strict: true,
      parameters: {
        type: "object",
        properties: {
          customerPhone: { type: ["string", "null"] },
          customerEmail: { type: ["string", "null"] },
        },
        required: ["customerPhone", "customerEmail"],
        additionalProperties: false,
      },
    },
    server: {
      url: "https://www.smartcleaningdesk.com/api/ai-phone/vapi",
    },
  },
  {
    type: "function",
    function: {
      name: "check_booking_availability",
      description:
        "Check whether a requested appointment window is available. Always use this before promising an appointment time.",
      strict: true,
      parameters: {
        type: "object",
        properties: {
          startAt: { type: "string" },
          endAt: { type: "string" },
          employeeId: { type: ["string", "null"] },
          travelBufferMinutes: { type: "number" },
          bedrooms: { type: ["number", "null"] },
          bathrooms: { type: ["number", "null"] },
          propertySize: { type: ["string", "null"] },
        },
        required: [
          "startAt",
          "endAt",
          "employeeId",
          "travelBufferMinutes",
          "bedrooms",
          "bathrooms",
          "propertySize",
        ],
        additionalProperties: false,
      },
    },
    server: {
      url: "https://www.smartcleaningdesk.com/api/ai-phone/vapi",
    },
  },
  {
    type: "function",
    function: {
      name: "create_booking",
      description:
        "Create a cleaning appointment only after the requested time has been checked and confirmed as available.",
      strict: true,
      parameters: {
        type: "object",
        properties: {
          customerName: { type: "string" },
          customerPhone: { type: ["string", "null"] },
          customerEmail: { type: ["string", "null"] },
          address: { type: ["string", "null"] },
          service: { type: "string" },
          propertyType: { type: ["string", "null"] },
          bedrooms: { type: ["number", "null"] },
          bathrooms: { type: ["number", "null"] },
          propertySize: { type: ["string", "null"] },
          notes: { type: ["string", "null"] },
          startAt: { type: "string" },
          durationMinutes: { type: "number" },
          travelBufferMinutes: { type: "number" },
          employeeId: { type: ["string", "null"] },
        },
        required: [
          "customerName",
          "customerPhone",
          "customerEmail",
          "address",
          "service",
          "propertyType",
          "bedrooms",
          "bathrooms",
          "propertySize",
          "notes",
          "startAt",
          "durationMinutes",
          "travelBufferMinutes",
          "employeeId",
        ],
        additionalProperties: false,
      },
    },
    server: {
      url: "https://www.smartcleaningdesk.com/api/ai-phone/vapi",
    },
  },
  {
    type: "function",
    function: {
      name: "reschedule_booking",
      description:
        "Move an existing customer booking to a new appointment time after checking the new time for conflicts.",
      strict: true,
      parameters: {
        type: "object",
        properties: {
          bookingId: { type: "string" },
          customerPhone: { type: ["string", "null"] },
          customerEmail: { type: ["string", "null"] },
          newStartAt: { type: "string" },
        },
        required: ["bookingId", "customerPhone", "customerEmail", "newStartAt"],
        additionalProperties: false,
      },
    },
    server: {
      url: "https://www.smartcleaningdesk.com/api/ai-phone/vapi",
    },
  },
  {
    type: "function",
    function: {
      name: "cancel_booking",
      description:
        "Cancel an existing customer booking only when the caller clearly asks to cancel.",
      strict: true,
      parameters: {
        type: "object",
        properties: {
          bookingId: { type: "string" },
          customerPhone: { type: ["string", "null"] },
          customerEmail: { type: ["string", "null"] },
        },
        required: ["bookingId", "customerPhone", "customerEmail"],
        additionalProperties: false,
      },
    },
    server: {
      url: "https://www.smartcleaningdesk.com/api/ai-phone/vapi",
    },
  },
];

type VapiMessage = {
  type?: string;
  call?: {
    id?: string;
    status?: string;
    startedAt?: string | null;
    endedAt?: string | null;
    duration?: number | null;
    phoneNumber?: {
      number?: string | null;
    } | null;
  } | null;
  startedAt?: string | null;
  endedAt?: string | null;
  phoneNumber?: {
    number?: string | null;
  } | null;
  toolCallList?: Array<{
    id?: string;
    name?: string;
    parameters?: Record<string, unknown>;
    function?: {
      name?: string;
      arguments?: Record<string, unknown> | string;
    };
  }>;
  toolWithToolCallList?: Array<{
    name?: string;
    toolCall?: {
      id?: string;
      parameters?: Record<string, unknown>;
    };
  }>;
};

function getCalledNumber(message: VapiMessage) {
  return (
    message.call?.phoneNumber?.number?.trim() ||
    message.phoneNumber?.number?.trim() ||
    ""
  );
}

async function getBusinessByPhone(phoneNumber: string) {
  if (!phoneNumber) {
    return null;
  }

  return prisma.aIPhoneSettings.findFirst({
    where: {
      phoneNumber,
      status: {
        in: ["READY", "ACTIVE"],
      },
      enabled: true,
    },
    include: {
      businessProfile: true,
    },
  });
}

function buildKnowledge(
  businessProfile: NonNullable<
    Awaited<ReturnType<typeof getBusinessByPhone>>
  >["businessProfile"],
): CustomerAgentBusinessProfile {
  return {
    businessName: businessProfile.businessName,
    businessPhone: businessProfile.businessPhone,
    businessEmail: businessProfile.businessEmail,
    websiteUrl: businessProfile.websiteUrl,
    services: businessProfile.services,
    serviceAreas: businessProfile.serviceAreas,
    pricing: businessProfile.pricing,
    businessHours: businessProfile.businessHours,
    paymentMethods: businessProfile.paymentMethods,
    bookingRules: businessProfile.bookingRules,
    cancellationPolicy: businessProfile.cancellationPolicy,
    reschedulingPolicy: businessProfile.reschedulingPolicy,
    aiInstructions: businessProfile.aiInstructions,
    aiTone: businessProfile.aiTone,
    humanHandoffInstructions: businessProfile.humanHandoffInstructions,
    additionalNotes: businessProfile.additionalNotes,
  };
}

function normalizeToolCalls(message: VapiMessage) {
  const directCalls = (message.toolCallList ?? []).map((call) => ({
    id: call.id ?? "",
    name: call.name ?? call.function?.name ?? "",
    parameters:
      typeof call.function?.arguments === "string"
        ? safeJsonObject(call.function.arguments)
        : call.parameters ?? call.function?.arguments ?? {},
  }));

  const wrappedCalls = (message.toolWithToolCallList ?? []).map((item) => ({
    id: item.toolCall?.id ?? "",
    name: item.name ?? "",
    parameters: item.toolCall?.parameters ?? {},
  }));

  return [...directCalls, ...wrappedCalls].filter(
    (call) => call.id && call.name,
  );
}



function getCallDurationSeconds(message: VapiMessage) {
  const duration = message.call?.duration;

  if (typeof duration === "number" && Number.isFinite(duration) && duration >= 0) {
    return Math.round(duration);
  }

  const startedAt = message.call?.startedAt ?? message.startedAt;
  const endedAt = message.call?.endedAt ?? message.endedAt;

  if (!startedAt || !endedAt) {
    return null;
  }

  const start = new Date(startedAt).getTime();
  const end = new Date(endedAt).getTime();

  if (!Number.isFinite(start) || !Number.isFinite(end) || end < start) {
    return null;
  }

  return Math.round((end - start) / 1000);
}

async function hasVoiceMinutesAvailable(userId: string, plan: string | null | undefined) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      stripeSubscriptionId: true,
      extraVoiceMinutes: true,
      trialStartedAt: true,
      trialEndsAt: true,
    },
  });

  const now = Date.now();
  const trialActive =
    !user?.stripeSubscriptionId &&
    Boolean(user?.trialEndsAt && user.trialEndsAt.getTime() > now);

  const trialVoiceMinutes =
    plan === "PRO" ? 30 : plan === "BUSINESS" ? 15 : 0;

  if (trialActive) {
    if (trialVoiceMinutes <= 0) {
      return {
        allowed: false,
        reason: "AI Phone requires a Business or Pro plan.",
      };
    }

    const trialStart = user?.trialStartedAt ?? new Date(now);
    const usage = await prisma.voiceUsage.aggregate({
      where: {
        userId,
        source: "VAPI_CALL",
        startedAt: {
          gte: trialStart,
          lt: user?.trialEndsAt ?? new Date(now),
        },
        metadata: {
          path: ["billingPeriod"],
          equals: "trial",
        },
      },
      _sum: {
        billedMinutes: true,
      },
    });

    const usedTrialMinutes = usage._sum.billedMinutes ?? 0;
    const remaining = Math.max(trialVoiceMinutes - usedTrialMinutes, 0);

    return {
      allowed: remaining >= 10 / 60,
      remaining,
      maxDurationSeconds: Math.max(
        10,
        Math.floor(remaining * 60),
      ),
      reason:
        remaining < 10 / 60
          ? "Trial voice minutes exhausted. Choose a plan to continue."
          : null,
    };
  }

  const includedVoiceMinutes =
    plan === "PRO" ? 500 : plan === "BUSINESS" ? 200 : 0;

  if (includedVoiceMinutes <= 0) {
    return {
      allowed: false,
      reason: "AI Phone requires a Business or Pro plan.",
    };
  }

  if (!user?.stripeSubscriptionId) {
    return {
      allowed: false,
      reason: "An active Stripe subscription is required for AI Phone.",
    };
  }

  let periodStart: Date;
  let periodEnd: Date;

  try {
    const subscription = await stripe.subscriptions.retrieve(
      user.stripeSubscriptionId,
    );

    if (!["active", "trialing"].includes(subscription.status)) {
      return {
        allowed: false,
        reason: "Your subscription is not active.",
      };
    }

    periodStart = new Date(subscription.current_period_start * 1000);
    periodEnd = new Date(subscription.current_period_end * 1000);
  } catch (error) {
    console.error("Failed to retrieve Stripe subscription for AI Phone:", error);

    return {
      allowed: false,
      reason: "Unable to verify your voice balance right now.",
    };
  }

  const usage = await prisma.voiceUsage.aggregate({
    where: {
      userId,
      source: "VAPI_CALL",
      startedAt: {
        gte: periodStart,
        lt: periodEnd,
      },
    },
    _sum: {
      includedMinutesUsed: true,
    },
  });

  const usedIncludedMinutes = usage._sum.includedMinutesUsed ?? 0;
  const includedRemaining = Math.max(
    includedVoiceMinutes - usedIncludedMinutes,
    0,
  );
  const extraVoiceMinutes = user.extraVoiceMinutes ?? 0;

  const remaining = includedRemaining + extraVoiceMinutes;

  return {
    allowed: remaining >= 10 / 60,
    remaining,
    maxDurationSeconds: Math.max(
      10,
      Math.floor(remaining * 60),
    ),
    reason:
      remaining < 10 / 60
        ? "Voice minutes exhausted. Please add more minutes to continue."
        : null,
  };
}
function safeJsonObject(value: string): Record<string, unknown> {
  try {
    const parsed = JSON.parse(value) as unknown;

    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed as Record<string, unknown>;
    }
  } catch {
    return {};
  }

  return {};
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { message?: VapiMessage };
    const message = body.message;

    if (!message?.type) {
      return NextResponse.json(
        { error: "Invalid Vapi webhook payload." },
        { status: 400 },
      );
    }

    const calledNumber = getCalledNumber(message);
    const configuration = await getBusinessByPhone(calledNumber);

    if (!configuration?.businessProfile) {
      return NextResponse.json(
        { error: "AI Phone configuration was not found." },
        { status: 404 },
      );
    }

    if (message.type === "assistant-request") {
      const voiceUser = await prisma.user.findUnique({
        where: { id: configuration.businessProfile.userId },
        select: { plan: true },
      });

      const voiceBalance = await hasVoiceMinutesAvailable(
        configuration.businessProfile.userId,
        voiceUser?.plan,
      );

      if (!voiceBalance.allowed) {
        return NextResponse.json(
          {
            error: voiceBalance.reason ?? "Voice minutes are unavailable.",
          },
          { status: 402 },
        );
      }

      const knowledge = buildKnowledge(configuration.businessProfile);
      const systemPrompt = buildCustomerAgentSystemPrompt(knowledge);

      return NextResponse.json({
        assistant: {
          name: configuration.assistantName || "Smart Cleaning Desk Receptionist",
          firstMessage:
            configuration.greeting ||
            `Hi, thanks for calling ${configuration.businessProfile.businessName || "our cleaning company"}. How can I help you today?`,
          maxDurationSeconds: voiceBalance.maxDurationSeconds,
          model: {
            provider: "openai",
            model: "gpt-4o",
            messages: [
              {
                role: "system",
                content: systemPrompt,
              },
            ],
            tools: toolSchemas,
          serverMessages: [
            "end-of-call-report",
            "tool-calls",
          ],
          },
          server: {
            url: "https://www.smartcleaningdesk.com/api/ai-phone/vapi",
          },
        },
      });
    }

    if (message.type === "end-of-call-report") {
      const callId = message.call?.id?.trim();

      if (!callId) {
        return NextResponse.json({ error: "Missing Vapi call ID." }, { status: 400 });
      }

      const durationSeconds = getCallDurationSeconds(message);

      if (durationSeconds === null) {
        return NextResponse.json(
          { error: "Missing Vapi call duration." },
          { status: 400 },
        );
      }

      const billedMinutes = durationSeconds / 60;

      const existingUsage = await prisma.voiceUsage.findUnique({
        where: { callId },
        select: { id: true },
      });

      if (existingUsage) {
        return NextResponse.json({ ok: true });
      }

      const user = await prisma.user.findUnique({
        where: { id: configuration.businessProfile.userId },
        select: {
          plan: true,
          stripeSubscriptionId: true,
          trialStartedAt: true,
          trialEndsAt: true,
          extraVoiceMinutes: true,
        },
      });

      const trialActive =
        !user?.stripeSubscriptionId &&
        Boolean(user?.trialEndsAt && user.trialEndsAt.getTime() > Date.now());

      const includedVoiceMinutes =
        user?.plan === "PRO" ? 500 : user?.plan === "BUSINESS" ? 200 : 0;
      const trialVoiceMinutes =
        user?.plan === "PRO" ? 30 : user?.plan === "BUSINESS" ? 15 : 0;

      let includedRemaining = 0;
      let trialUsageMinutes = 0;

      if (trialActive && trialVoiceMinutes > 0) {
        const trialStart = user?.trialStartedAt ?? new Date();
        const trialUsage = await prisma.voiceUsage.aggregate({
          where: {
            userId: configuration.businessProfile.userId,
            source: "VAPI_CALL",
            startedAt: {
              gte: trialStart,
              lt: user?.trialEndsAt ?? new Date(),
            },
            metadata: {
              path: ["billingPeriod"],
              equals: "trial",
            },
          },
          _sum: {
            billedMinutes: true,
          },
        });

        trialUsageMinutes = trialUsage._sum.billedMinutes ?? 0;
        includedRemaining = Math.max(
          trialVoiceMinutes - trialUsageMinutes,
          0,
        );
      }

      if (!trialActive && user?.stripeSubscriptionId && includedVoiceMinutes > 0) {
        try {
          const subscription = await stripe.subscriptions.retrieve(
            user.stripeSubscriptionId,
          );

          if (["active", "trialing"].includes(subscription.status)) {
            const periodStart = new Date(subscription.current_period_start * 1000);
            const periodEnd = new Date(subscription.current_period_end * 1000);

            const usage = await prisma.voiceUsage.aggregate({
              where: {
                userId: configuration.businessProfile.userId,
                source: "VAPI_CALL",
                startedAt: {
                  gte: periodStart,
                  lt: periodEnd,
                },
              },
              _sum: {
                includedMinutesUsed: true,
              },
            });

            includedRemaining = Math.max(
              includedVoiceMinutes - (usage._sum.includedMinutesUsed ?? 0),
              0,
            );
          }
        } catch (error) {
          console.error(
            "Failed to retrieve Stripe subscription while recording AI Phone usage:",
            error,
          );
        }
      }

      const includedMinutesUsed = trialActive
        ? 0
        : Math.min(billedMinutes, includedRemaining);
      const trialMinutesUsed = trialActive
        ? Math.min(billedMinutes, includedRemaining)
        : 0;
      const extraMinutesUsed = trialActive
        ? 0
        : Math.max(billedMinutes - includedMinutesUsed, 0);

      await prisma.$transaction(async (tx) => {
        const currentUsage = await tx.voiceUsage.findUnique({
          where: { callId },
          select: { id: true },
        });

        if (currentUsage) {
          return;
        }

        await tx.voiceUsage.create({
          data: {
            userId: configuration.businessProfile.userId,
            callId,
            source: "VAPI_CALL",
            durationSeconds,
            billedMinutes,
            includedMinutesUsed,
            extraMinutesUsed,
            startedAt: message.call?.startedAt
              ? new Date(message.call.startedAt)
              : message.startedAt
                ? new Date(message.startedAt)
                : null,
            endedAt: message.call?.endedAt
              ? new Date(message.call.endedAt)
              : message.endedAt
                ? new Date(message.endedAt)
                : null,
            metadata: {
              billingPeriod: trialActive ? "trial" : "subscription",
              trialMinutesUsed: trialMinutesUsed,
              endedReason:
                typeof (message as { endedReason?: unknown }).endedReason === "string"
                  ? (message as { endedReason: string }).endedReason
                  : null,
            },
          },
        });

        if (extraMinutesUsed > 0) {
          await tx.user.update({
            where: { id: configuration.businessProfile.userId },
            data: {
              extraVoiceMinutes: {
                decrement: extraMinutesUsed,
              },
            },
          });
        }
      });

      return NextResponse.json({ ok: true });
    }

    if (message.type === "tool-calls") {
      const toolCalls = normalizeToolCalls(message);
      const results: Array<{
        toolCallId: string;
        result: string;
      }> = [];

      for (const toolCall of toolCalls) {
        const result = await executeCustomerAgentToolCall({
          name: toolCall.name,
          arguments: toolCall.parameters,
          userId: configuration.businessProfile.userId,
        });

        results.push({
          toolCallId: toolCall.id,
          result: JSON.stringify(result),
        });
      }

      return NextResponse.json({ results });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Vapi AI Phone webhook error:", error);

    return NextResponse.json(
      {
        error: "Vapi AI Phone webhook failed.",
      },
      { status: 500 },
    );
  }
}
