import "server-only";

import { openai } from "@/lib/openai";
import { prisma } from "@/lib/db";
import {
  buildCustomerAgentSystemPrompt,
  type CustomerAgentBusinessProfile,
} from "@/lib/ai/customer-agent";
import {
  findBookingConflicts,
  getBookingsForDay,
} from "@/lib/bookings/service";

export type CustomerAgentRunOptions = {
  userId: string;
  message: string;
  previousResponseId?: string;
};

export type CustomerAgentRunResult = {
  responseId: string;
  text: string;
};


const customerAgentTools = [
  {
    type: "function" as const,
    name: "get_bookings_for_date",
    description:
      "Get all non-cancelled bookings for this cleaning business on a specific calendar date. Use this when the user asks about bookings, appointments, or the schedule for a date.",
    parameters: {
      type: "object",
      properties: {
        date: {
          type: "string",
          description: "Calendar date in YYYY-MM-DD format.",
        },
      },
      required: ["date"],
      additionalProperties: false,
    },
    strict: true,
  },
  {
    type: "function" as const,
    name: "create_booking",
    description:
      "Create a customer appointment after the requested time has been checked and confirmed as available. Use only when all required booking details are known.",
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
        employeeId: { type: ["string", "null"] }
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
        "employeeId"
      ],
      additionalProperties: false
    },
    strict: true
  },
  {
    type: "function" as const,
    name: "check_booking_availability",
    description:
      "Check whether a requested appointment window conflicts with existing bookings. Use this before promising an appointment time.",
    parameters: {
      type: "object",
      properties: {
        startAt: {
          type: "string",
          description: "Requested start time as an ISO 8601 datetime.",
        },
        endAt: {
          type: "string",
          description: "Requested end time as an ISO 8601 datetime.",
        },
        employeeId: {
          type: ["string", "null"],
          description: "Optional employee ID to check for that employee specifically.",
        },
      },
      required: ["startAt", "endAt", "employeeId"],
      additionalProperties: false,
    },
    strict: true,
  },
];

async function executeCustomerAgentTool(
  name: string,
  argumentsJson: string,
  userId: string,
): Promise<Record<string, unknown>> {
  let args: Record<string, unknown>;

  try {
    args = JSON.parse(argumentsJson) as Record<string, unknown>;
  } catch {
    return { success: false, error: "Invalid tool arguments." };
  }

  if (name === "get_bookings_for_date") {
    const date = typeof args.date === "string" ? args.date : "";

    if (!/^\\d{4}-\\d{2}-\\d{2}$/.test(date)) {
      return {
        success: false,
        error: "Date must use YYYY-MM-DD format.",
      };
    }

    const bookings = await getBookingsForDay(
      userId,
      new Date(date + "T12:00:00"),
    );

    return {
      success: true,
      date,
      bookings: bookings.map((booking) => ({
        id: booking.id,
        customerName: booking.customerName,
        customerPhone: booking.customerPhone,
        service: booking.service,
        address: booking.address,
        propertyType: booking.propertyType,
        bedrooms: booking.bedrooms,
        bathrooms: booking.bathrooms,
        propertySize: booking.propertySize,
        startAt: booking.startAt.toISOString(),
        endAt: booking.endAt.toISOString(),
        durationMinutes: booking.durationMinutes,
        travelBufferMinutes: booking.travelBufferMinutes,
        status: booking.status,
        employeeId: booking.employeeId,
        notes: booking.notes,
      })),
    };
  }

  if (name === "create_booking") {
    const startAt =
      typeof args.startAt === "string" ? new Date(args.startAt) : null;
    const durationMinutes =
      typeof args.durationMinutes === "number" ? args.durationMinutes : 0;
    const travelBufferMinutes =
      typeof args.travelBufferMinutes === "number"
        ? args.travelBufferMinutes
        : 0;
    const employeeId =
      typeof args.employeeId === "string" ? args.employeeId : null;

    if (
      !startAt ||
      Number.isNaN(startAt.getTime()) ||
      durationMinutes <= 0
    ) {
      return {
        success: false,
        error: "Invalid booking time or duration.",
      };
    }

    const endAt = new Date(
      startAt.getTime() + durationMinutes * 60_000,
    );

    const conflicts = await findBookingConflicts(
      userId,
      { startAt, endAt },
      employeeId,
      travelBufferMinutes,
    );

    if (conflicts.length > 0) {
      return {
        success: false,
        error: "The requested appointment is no longer available.",
        conflicts: conflicts.map((booking) => ({
          id: booking.id,
          customerName: booking.customerName,
          startAt: booking.startAt.toISOString(),
          endAt: booking.endAt.toISOString(),
          employeeId: booking.employeeId,
        })),
      };
    }

    const { createBooking } = await import("@/lib/bookings/service");

    const booking = await createBooking({
      userId,
      customerName:
        typeof args.customerName === "string" ? args.customerName : "Customer",
      customerPhone:
        typeof args.customerPhone === "string" ? args.customerPhone : null,
      customerEmail:
        typeof args.customerEmail === "string" ? args.customerEmail : null,
      address: typeof args.address === "string" ? args.address : null,
      service: typeof args.service === "string" ? args.service : "Cleaning",
      propertyType:
        typeof args.propertyType === "string" ? args.propertyType : null,
      bedrooms: typeof args.bedrooms === "number" ? args.bedrooms : null,
      bathrooms: typeof args.bathrooms === "number" ? args.bathrooms : null,
      propertySize:
        typeof args.propertySize === "string" ? args.propertySize : null,
      notes: typeof args.notes === "string" ? args.notes : null,
      startAt,
      durationMinutes,
      travelBufferMinutes,
      employeeId,
    });

    return {
      success: true,
      booking: {
        id: booking.id,
        customerName: booking.customerName,
        service: booking.service,
        startAt: booking.startAt.toISOString(),
        endAt: booking.endAt.toISOString(),
        status: booking.status,
        employeeId: booking.employeeId,
      },
    };
  }

  if (name === "check_booking_availability") {
    const startAt =
      typeof args.startAt === "string" ? new Date(args.startAt) : null;
    const endAt =
      typeof args.endAt === "string" ? new Date(args.endAt) : null;
    const employeeId =
      typeof args.employeeId === "string" ? args.employeeId : null;

    if (
      !startAt ||
      !endAt ||
      Number.isNaN(startAt.getTime()) ||
      Number.isNaN(endAt.getTime()) ||
      startAt >= endAt
    ) {
      return {
        success: false,
        error: "Invalid appointment window.",
      };
    }

    const conflicts = await findBookingConflicts(
      userId,
      { startAt, endAt },
      employeeId,
    );

    return {
      success: true,
      available: conflicts.length === 0,
      conflicts: conflicts.map((booking) => ({
        id: booking.id,
        customerName: booking.customerName,
        service: booking.service,
        startAt: booking.startAt.toISOString(),
        endAt: booking.endAt.toISOString(),
        employeeId: booking.employeeId,
        status: booking.status,
      })),
    };
  }

  return {
    success: false,
    error: "Unknown customer agent tool.",
  };
}

export async function runCustomerAgent(
  options: CustomerAgentRunOptions,
): Promise<CustomerAgentRunResult> {
  const businessProfile = await prisma.businessProfile.findUnique({
    where: {
      userId: options.userId,
    },
  });

  if (!businessProfile) {
    throw new Error("Business profile not found.");
  }

  const knowledge: CustomerAgentBusinessProfile = {
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

  let response = await openai.responses.create({
    model: "gpt-5.6-terra",
    reasoning: {
      effort: "low",
    },
    instructions: buildCustomerAgentSystemPrompt(knowledge),
    input: options.message,
    tools: customerAgentTools,
    ...(options.previousResponseId
      ? { previous_response_id: options.previousResponseId }
      : {}),
  });

  for (let iteration = 0; iteration < 5; iteration += 1) {
    const functionCalls = response.output.filter(
      (item) => item.type === "function_call",
    );

    if (functionCalls.length === 0) {
      break;
    }

    const toolOutputs: Array<{
      type: "function_call_output";
      call_id: string;
      output: string;
    }> = [];

    for (const call of functionCalls) {
      const result = await executeCustomerAgentTool(
        call.name,
        call.arguments,
        options.userId,
      );

      toolOutputs.push({
        type: "function_call_output" as const,
        call_id: call.call_id,
        output: JSON.stringify(result),
      });
    }

    response = await openai.responses.create({
      model: "gpt-5.6-terra",
      reasoning: {
        effort: "low",
      },
      instructions: buildCustomerAgentSystemPrompt(knowledge),
      previous_response_id: response.id,
      input: toolOutputs,
      tools: customerAgentTools,
    });
  }

  return {
    responseId: response.id,
    text: response.output_text,
  };
}
