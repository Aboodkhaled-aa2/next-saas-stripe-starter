import { NextResponse } from "next/server";

import { env } from "@/env.mjs";

import { prisma } from "@/lib/db";
import { stripe } from "@/lib/stripe";
import {
  buildCustomerAgentSystemPrompt,
  type CustomerAgentBusinessProfile,
} from "@/lib/ai/customer-agent";
import { executeCustomerAgentToolCall } from "@/lib/ai/customer-agent-runtime";

const APP_BASE_URL =
  process.env.VERCEL_ENV === "preview" && process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : env.NEXT_PUBLIC_APP_URL || "https://www.smartcleaningdesk.com";
const VAPI_WEBHOOK_URL = `${APP_BASE_URL}/api/ai-phone/vapi`;

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
      url: VAPI_WEBHOOK_URL,
      headers: env.VAPI_WEBHOOK_SECRET
        ? { Authorization: `Bearer ${env.VAPI_WEBHOOK_SECRET}` }
        : undefined,
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
      url: VAPI_WEBHOOK_URL,
      headers: env.VAPI_WEBHOOK_SECRET
        ? { Authorization: `Bearer ${env.VAPI_WEBHOOK_SECRET}` }
        : undefined,
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
      url: VAPI_WEBHOOK_URL,
      headers: env.VAPI_WEBHOOK_SECRET
        ? { Authorization: `Bearer ${env.VAPI_WEBHOOK_SECRET}` }
        : undefined,
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
      url: VAPI_WEBHOOK_URL,
      headers: env.VAPI_WEBHOOK_SECRET
        ? { Authorization: `Bearer ${env.VAPI_WEBHOOK_SECRET}` }
        : undefined,
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
      url: VAPI_WEBHOOK_URL,
      headers: env.VAPI_WEBHOOK_SECRET
        ? { Authorization: `Bearer ${env.VAPI_WEBHOOK_SECRET}` }
        : undefined,
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
      url: VAPI_WEBHOOK_URL,
      headers: env.VAPI_WEBHOOK_SECRET
        ? { Authorization: `Bearer ${env.VAPI_WEBHOOK_SECRET}` }
        : undefined,
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
      url: VAPI_WEBHOOK_URL,
      headers: env.VAPI_WEBHOOK_SECRET
        ? { Authorization: `Bearer ${env.VAPI_WEBHOOK_SECRET}` }
        : undefined,
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
      id?: string | null;
      number?: string | null;
    } | null;
    phoneNumberId?: string | null;
  } | null;
  startedAt?: string | null;
  endedAt?: string | null;
  phoneNumber?: {
    id?: string | null;
    number?: string | null;
  } | null;
  phoneNumberId?: string | null;
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
      function?: {
        name?: string;
        arguments?: Record<string, unknown> | string;
      };
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

function getVapiPhoneNumberId(message: VapiMessage) {
  return (
    message.call?.phoneNumber?.id?.trim() ||
    message.call?.phoneNumberId?.trim() ||
    message.phoneNumber?.id?.trim() ||
    message.phoneNumberId?.trim() ||
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

async function getBusinessByVapiPhoneNumberId(vapiPhoneNumberId: string) {
  if (!vapiPhoneNumberId) {
    return null;
  }

  const phone = await prisma.phoneNumber.findFirst({
    where: {
      status: "ACTIVE",
      metadata: {
        path: ["vapiPhoneNumberId"],
        equals: vapiPhoneNumberId,
      },
    },
    select: {
      phoneNumber: true,
    },
  });

  if (!phone?.phoneNumber) {
    return null;
  }

  return getBusinessByPhone(phone.phoneNumber);
}

async function getBusinessForMessage(message: VapiMessage) {
  const vapiPhoneNumberId = getVapiPhoneNumberId(message);
  if (vapiPhoneNumberId) {
    const configuration = await getBusinessByVapiPhoneNumberId(vapiPhoneNumberId);
    if (configuration?.businessProfile) {
      return configuration;
    }
  }

  return getBusinessByPhone(getCalledNumber(message));
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

  const wrappedCalls = (message.toolWithToolCallList ?? []).map((item) => {
    const rawArguments =
      item.toolCall?.function?.arguments ?? item.toolCall?.parameters ?? {};

    return {
      id: item.toolCall?.id ?? "",
      name: item.name ?? item.toolCall?.function?.name ?? "",
      parameters:
        typeof rawArguments === "string"
          ? safeJsonObject(rawArguments)
          : rawArguments,
    };
  });

  const calls = [...directCalls, ...wrappedCalls].filter(
    (call) => call.id && call.name,
  );

  // Vapi payloads can expose the same call in both supported shapes.
  // Deduplicate by call ID to prevent executing a booking twice.
  return Array.from(new Map(calls.map((call) => [call.id, call])).values());
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
      email: true,
      stripeSubscriptionId: true,
      extraVoiceMinutes: true,
      trialStartedAt: true,
      trialEndsAt: true,
    },
  });

  const isAdminAccount = user?.email?.toLowerCase() === "tawilabood8@gmail.com";

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
      _sum: { billedMinutes: true },
    });

    const usedTrialMinutes = usage._sum.billedMinutes ?? 0;
    const remaining = Math.max(trialVoiceMinutes - usedTrialMinutes, 0);

    return {
      allowed: remaining >= 10 / 60,
      remaining,
      maxDurationSeconds: Math.max(10, Math.floor(remaining * 60)),
      reason:
        remaining < 10 / 60
          ? "Trial voice minutes exhausted. Choose a plan to continue."
          : null,
    };
  }

  const planSupportsVoice = plan === "PRO" || plan === "BUSINESS";
  if (!planSupportsVoice) {
    return {
      allowed: false,
      reason: "AI Phone requires a Business or Pro plan.",
    };
  }

  const extraVoiceMinutes = Math.max(user?.extraVoiceMinutes ?? 0, 0);
  let includedRemaining = 0;

  if (isAdminAccount && !user?.stripeSubscriptionId) {
    const includedVoiceMinutes = plan === "PRO" ? 500 : 200;
    const periodStart = new Date(now);
    periodStart.setDate(1);
    periodStart.setHours(0, 0, 0, 0);
    const periodEnd = new Date(periodStart);
    periodEnd.setMonth(periodEnd.getMonth() + 1);
    const usage = await prisma.voiceUsage.aggregate({
      where: {
        userId,
        source: "VAPI_CALL",
        startedAt: { gte: periodStart, lt: periodEnd },
      },
      _sum: { includedMinutesUsed: true },
    });
    includedRemaining = Math.max(
      includedVoiceMinutes - (usage._sum.includedMinutesUsed ?? 0),
      0,
    );
  } else if (user?.stripeSubscriptionId) {
    try {
      const subscription = await stripe.subscriptions.retrieve(
        user.stripeSubscriptionId,
      );

      if (["active", "trialing"].includes(subscription.status)) {
        const includedVoiceMinutes = plan === "PRO" ? 500 : 200;
        const periodStart = new Date(subscription.current_period_start * 1000);
        const periodEnd = new Date(subscription.current_period_end * 1000);
        const usage = await prisma.voiceUsage.aggregate({
          where: {
            userId,
            source: "VAPI_CALL",
            startedAt: {
              gte: periodStart,
              lt: periodEnd,
            },
          },
          _sum: { includedMinutesUsed: true },
        });

        includedRemaining = Math.max(
          includedVoiceMinutes - (usage._sum.includedMinutesUsed ?? 0),
          0,
        );
      }
    } catch (error) {
      console.error("Unable to verify subscription for included AI Phone minutes:", error);
      // Purchased minutes remain independently usable if Stripe is unavailable.
    }
  }

  const remaining = includedRemaining + extraVoiceMinutes;

  return {
    allowed: remaining >= 10 / 60,
    remaining,
    maxDurationSeconds: Math.max(10, Math.floor(remaining * 60)),
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
    const webhookSecret = env.VAPI_WEBHOOK_SECRET;
    if (!webhookSecret) {
      return NextResponse.json(
        { error: "Vapi webhook authentication is not configured." },
        { status: 503 },
      );
    }

    const authorization = request.headers.get("authorization");
    const legacySecret = request.headers.get("x-vapi-secret");
    const suppliedSecret = authorization?.startsWith("Bearer ")
      ? authorization.slice(7).trim()
      : legacySecret?.trim();

    if (!suppliedSecret || suppliedSecret !== webhookSecret) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const body = (await request.json()) as { message?: VapiMessage };
    const message = body.message;

    if (!message?.type) {
      return NextResponse.json(
        { error: "Invalid Vapi webhook payload." },
        { status: 400 },
      );
    }

    // Resolve the tenant from Vapi's immutable imported phone-number ID first.
    // Fall back to the E.164 number for older webhook payloads.
    const calledNumber = getCalledNumber(message);
    const vapiPhoneNumberId = getVapiPhoneNumberId(message);
    const configuration = await getBusinessForMessage(message);

    if (!configuration?.businessProfile) {
      console.error("[VAPI WEBHOOK UNMATCHED PHONE]", {
        messageType: message.type,
        callId: message.call?.id ?? null,
        vapiPhoneNumberId: vapiPhoneNumberId || null,
        hasCalledNumber: Boolean(calledNumber),
      });

      return NextResponse.json(
        { error: "AI Phone configuration was not found." },
        { status: 404 },
      );
    }

    if (message.type === "assistant-request") {
      const voiceUser = await prisma.user.findUnique({
        where: { id: configuration.businessProfile.userId },
        select: { plan: true, stripeSubscriptionId: true },
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
      const phoneSystemPrompt = `${systemPrompt}

PHONE CALL OPENING AND SERVICE RULES:
- At the start of every call, clearly say the exact business name: ${knowledge.businessName || "the company name configured for this business"}. Do not introduce yourself without identifying the company.
- Use a warm, natural greeting, then ask how you can help. Do not skip the company name even if a custom greeting is configured.
- Never end a call immediately after the caller states a request. First understand the request, answer what you can, and ask the next necessary question.
- Ask one clear question at a time. Do not make the caller repeat information already provided.
- If the caller asks whether the company can come today, asks for an appointment today, or asks for same-day availability, treat it as a live availability request. Do not guess, say "probably", or answer from business hours.
- For every availability or booking request, use get_booking_duration_rules first when duration depends on property details; collect only the missing details needed to calculate duration.
- Then call check_booking_availability for the exact requested date and time using a valid startAt and endAt. If the caller asks for any time today but gives no time, ask what time they prefer, then check that time. If the caller asks whether there is any availability today without a preferred time, check suitable slots during the business hours returned in the business context; if the exact business timezone or hours cannot be determined, ask a clarifying question rather than inventing a slot.
- If the requested slot is unavailable, offer only alternative times returned by the availability tool. If available and the caller asked you to book it, proceed to create_booking when all required details are collected.
- Never end the call until you have either answered the caller's question, completed the requested action, or clearly explained what information/action is still needed and offered an appropriate next step.

PHONE CALL ENDING RULES:
- When the caller clearly says goodbye or confirms they have nothing else to ask, call the endCall tool immediately, but only after addressing the caller's request.
- Do not say goodbye yourself; the endCall tool provides the final goodbye.
- Never repeat goodbye or continue a goodbye loop.
- Do not call endCall while the caller is answering, asking a follow-up question, or asking you to wait.
- Never claim an appointment is booked unless create_booking returned success: true.
- If check_booking_availability returns success: false, do not say the requested time is available.
- If create_booking returns success: false, clearly tell the caller the booking was NOT completed; offer an alternative time or human follow-up.
- Only confirm the exact date and time returned by a successful create_booking result. Do not treat an availability check as a booking.
- Never negotiate, discount, or change a price unless the configured business pricing explicitly authorizes it.
`;
      const maxDurationSeconds = Math.min(
        180,
        voiceBalance.maxDurationSeconds ?? 180,
      );

      console.info("[VAPI ASSISTANT CONFIGURED]", {
        callId: message.call?.id ?? null,
        toolNames: [...toolSchemas.map((tool) => tool.function.name), "endCall"],
        maxDurationSeconds,
      });

      return NextResponse.json({
        assistant: {
          name: configuration.assistantName || "Smart Cleaning Desk Receptionist",
          firstMessage: (() => {
            const businessName =
              configuration.businessProfile.businessName?.trim() || "our cleaning company";
            const configuredGreeting = configuration.greeting?.trim();
            const greeting = configuredGreeting || "How can I help you today?";
            return greeting.toLowerCase().includes(businessName.toLowerCase())
              ? greeting
              : `Thank you for calling ${businessName}. ${greeting}`;
          })(),
          maxDurationSeconds,
          model: {
            provider: "openai",
            model: "gpt-4o",
            messages: [
              {
                role: "system",
                content: phoneSystemPrompt,
              },
            ],
            tools: [...toolSchemas, { type: "endCall" }],
          },
          serverMessages: [
            "end-of-call-report",
            "tool-calls",
          ],
          server: {
            url: VAPI_WEBHOOK_URL,
            headers: env.VAPI_WEBHOOK_SECRET
              ? { Authorization: `Bearer ${env.VAPI_WEBHOOK_SECRET}` }
              : undefined,
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
        console.info("[VAPI USAGE DUPLICATE IGNORED]", { callId });
        return NextResponse.json({ ok: true, duplicate: true });
      }

      const user = await prisma.user.findUnique({
        where: { id: configuration.businessProfile.userId },
        select: {
          email: true,
          plan: true,
          stripeSubscriptionId: true,
          trialStartedAt: true,
          trialEndsAt: true,
          extraVoiceMinutes: true,
        },
      });

      const isAdminAccount =
        user?.email?.toLowerCase() === "tawilabood8@gmail.com";
      const trialActive =
        !isAdminAccount &&
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

      if (isAdminAccount && !trialActive && includedVoiceMinutes > 0) {
        const periodStart = new Date();
        periodStart.setDate(1);
        periodStart.setHours(0, 0, 0, 0);
        const periodEnd = new Date(periodStart);
        periodEnd.setMonth(periodEnd.getMonth() + 1);

        const usage = await prisma.voiceUsage.aggregate({
          where: {
            userId: configuration.businessProfile.userId,
            source: "VAPI_CALL",
            startedAt: { gte: periodStart, lt: periodEnd },
          },
          _sum: { includedMinutesUsed: true },
        });

        includedRemaining = Math.max(
          includedVoiceMinutes - (usage._sum.includedMinutesUsed ?? 0),
          0,
        );
      } else if (!trialActive && user?.stripeSubscriptionId && includedVoiceMinutes > 0) {
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
              _sum: { includedMinutesUsed: true },
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

      let chargeableExtraMinutes = extraMinutesUsed;
      try {
        await prisma.$transaction(async (tx) => {
        const currentUsage = await tx.voiceUsage.findUnique({
          where: { callId },
          select: { id: true },
        });

        if (currentUsage) {
          return;
        }

        if (chargeableExtraMinutes > 0) {
          const deducted = await tx.user.updateMany({
            where: {
              id: configuration.businessProfile.userId,
              extraVoiceMinutes: {
                gte: chargeableExtraMinutes,
              },
            },
            data: {
              extraVoiceMinutes: {
                decrement: chargeableExtraMinutes,
              },
            },
          });

          if (deducted.count === 0) {
            const latestUser = await tx.user.findUnique({
              where: { id: configuration.businessProfile.userId },
              select: { extraVoiceMinutes: true },
            });

            const availableExtraMinutes = Math.max(
              latestUser?.extraVoiceMinutes ?? 0,
              0,
            );

            chargeableExtraMinutes = Math.min(
              chargeableExtraMinutes,
              availableExtraMinutes,
            );

            if (chargeableExtraMinutes > 0) {
              const retryDeduction = await tx.user.updateMany({
                where: {
                  id: configuration.businessProfile.userId,
                  extraVoiceMinutes: {
                    gte: chargeableExtraMinutes,
                  },
                },
                data: {
                  extraVoiceMinutes: {
                    decrement: chargeableExtraMinutes,
                  },
                },
              });

              if (retryDeduction.count === 0) {
                chargeableExtraMinutes = 0;
              }
            }
          }
        }

        await tx.voiceUsage.create({
          data: {
            userId: configuration.businessProfile.userId,
            callId,
            source: "VAPI_CALL",
            durationSeconds,
            billedMinutes,
            includedMinutesUsed,
            extraMinutesUsed: chargeableExtraMinutes,
            startedAt: message.call?.startedAt
              ? new Date(message.call.startedAt)
              : message.startedAt
                ? new Date(message.startedAt)
                : message.call?.endedAt
                  ? new Date(message.call.endedAt)
                  : message.endedAt
                    ? new Date(message.endedAt)
                    : new Date(),
            endedAt: message.call?.endedAt
              ? new Date(message.call.endedAt)
              : message.endedAt
                ? new Date(message.endedAt)
                : null,
            metadata: {
              billingPeriod: trialActive ? "trial" : "subscription",
              trialMinutesUsed,
              endedReason:
                typeof (message as { endedReason?: unknown }).endedReason === "string"
                  ? (message as { endedReason: string }).endedReason
                  : null,
            },
          },
        });
        });
      } catch (error) {
        if (
          error &&
          typeof error === "object" &&
          "code" in error &&
          error.code === "P2002"
        ) {
          console.info("[VAPI USAGE DUPLICATE RACE IGNORED]", { callId });
          return NextResponse.json({ ok: true, duplicate: true });
        }
        throw error;
      }

      console.info("[VAPI USAGE RECORDED]", {
        callId,
        durationSeconds,
        billedMinutes,
        includedMinutesUsed,
        trialMinutesUsed,
        extraMinutesUsed: chargeableExtraMinutes,
      });
      return NextResponse.json({ ok: true });
    }

    if (message.type === "tool-calls") {
      const toolCalls = normalizeToolCalls(message);
      const results: Array<{
        toolCallId: string;
        result: string;
      }> = [];

      console.info("[VAPI TOOL CALLS RECEIVED]", {
        callId: message.call?.id ?? null,
        count: toolCalls.length,
        toolNames: toolCalls.map((toolCall) => toolCall.name),
      });

      for (const toolCall of toolCalls) {
        let result: Record<string, unknown>;

        try {
          result = await executeCustomerAgentToolCall({
            name: toolCall.name,
            arguments: toolCall.parameters,
            userId: configuration.businessProfile.userId,
          });

          if (toolCall.name === "check_booking_availability") {
            console.info("[VAPI BOOKING AVAILABILITY RESULT]", {
              callId: message.call?.id ?? null,
              success: result.success === true,
              available: result.available === true,
              durationMinutes:
                typeof result.durationMinutes === "number" ? result.durationMinutes : null,
              conflictCount: Array.isArray(result.conflicts) ? result.conflicts.length : 0,
              alternativeCount: Array.isArray(result.alternativeTimes)
                ? result.alternativeTimes.length
                : 0,
              error: typeof result.error === "string" ? result.error : null,
            });
          }

          if (toolCall.name === "create_booking") {
            console.info("[VAPI BOOKING CREATE RESULT]", {
              callId: message.call?.id ?? null,
              success: result.success === true,
              startAt:
                result.booking && typeof result.booking === "object" &&
                "startAt" in result.booking
                  ? result.booking.startAt
                  : null,
              error: typeof result.error === "string" ? result.error : null,
            });
          }

          console.info("[VAPI TOOL CALL COMPLETED]", {
            callId: message.call?.id ?? null,
            toolName: toolCall.name,
            success: result.success === true,
          });
        } catch (error) {
          console.error("[VAPI TOOL EXECUTION FAILED]", {
            callId: message.call?.id ?? null,
            toolName: toolCall.name,
            errorName: error instanceof Error ? error.name : "UnknownError",
          });

          result = {
            success: false,
            error: "The requested action could not be completed. Please offer a human follow-up.",
          };
        }

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