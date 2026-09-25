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
    name: "save_customer_lead",
    description:
      "Save or update a cleaning business lead when a customer provides contact information or requests a service. Use this during customer qualification.",
    parameters: {
      type: "object",
      properties: {
        name: { type: ["string", "null"] },
        phone: { type: ["string", "null"] },
        email: { type: ["string", "null"] },
        service: { type: ["string", "null"] },
        location: { type: ["string", "null"] },
        notes: { type: ["string", "null"] }
      },
      required: ["name", "phone", "email", "service", "location", "notes"],
      additionalProperties: false
    },
    strict: true
  },
  {
    type: "function" as const,
    name: "reschedule_booking",
    description:
      "Move an existing customer booking to a new appointment time after checking the new time for conflicts.",
    parameters: {
      type: "object",
      properties: {
        bookingId: {
          type: "string",
          description: "The booking ID to reschedule.",
        },
        newStartAt: {
          type: "string",
          description: "New appointment start time as an ISO 8601 datetime.",
        },
      },
      required: ["bookingId", "newStartAt"],
      additionalProperties: false,
    },
    strict: true,
  },
  {
    type: "function" as const,
    name: "cancel_booking",
    description:
      "Cancel an existing customer booking after the booking has been identified. Use only when the customer clearly asks to cancel.",
    parameters: {
      type: "object",
      properties: {
        bookingId: {
          type: "string",
          description: "The booking ID to cancel.",
        },
      },
      required: ["bookingId"],
      additionalProperties: false,
    },
    strict: true,
  },
  {
    type: "function" as const,
    name: "find_booking",
    description:
      "Find a customer's non-cancelled booking using their phone number or email. Use this before changing or cancelling a booking.",
    parameters: {
      type: "object",
      properties: {
        customerPhone: {
          type: ["string", "null"],
          description: "Customer phone number.",
        },
        customerEmail: {
          type: ["string", "null"],
          description: "Customer email address.",
        },
      },
      required: ["customerPhone", "customerEmail"],
      additionalProperties: false,
    },
    strict: true,
  },
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
        travelBufferMinutes: {
          type: "number",
          description: "Minutes of buffer needed before or after the appointment.",
        },
      },
      required: ["startAt", "endAt", "employeeId", "travelBufferMinutes"],
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

  if (name === "save_customer_lead") {
    const nameValue =
      typeof args.name === "string" ? args.name.trim() : null;
    const phone =
      typeof args.phone === "string" ? args.phone.trim() : null;
    const email =
      typeof args.email === "string"
        ? args.email.trim().toLowerCase()
        : null;
    const service =
      typeof args.service === "string" ? args.service.trim() : null;
    const location =
      typeof args.location === "string" ? args.location.trim() : null;
    const notes =
      typeof args.notes === "string" ? args.notes.trim() : null;

    if (!nameValue && !phone && !email) {
      return {
        success: false,
        error: "A customer name, phone number, or email is required.",
      };
    }

    const existingLead = await prisma.lead.findFirst({
      where: {
        userId,
        OR: [
          ...(phone ? [{ phone }] : []),
          ...(email ? [{ email }] : []),
        ],
      },
    });

    const lead = existingLead
      ? await prisma.lead.update({
          where: { id: existingLead.id },
          data: {
            name: nameValue ?? existingLead.name,
            phone: phone ?? existingLead.phone,
            email: email ?? existingLead.email,
            service: service ?? existingLead.service,
            location: location ?? existingLead.location,
            notes: notes ?? existingLead.notes,
            lastMessage: "Customer captured by AI employee",
            status:
              existingLead.status === "BOOKED"
                ? existingLead.status
                : "QUALIFIED",
          },
        })
      : await prisma.lead.create({
          data: {
            userId,
            name: nameValue,
            phone,
            email,
            service,
            location,
            notes,
            source: "ai_employee",
            lastMessage: "Customer captured by AI employee",
            status: "QUALIFIED",
          },
        });

    return {
      success: true,
      leadId: lead.id,
      status: lead.status,
      message: "Customer lead saved successfully.",
    };
  }

  if (name === "reschedule_booking") {
    const bookingId =
      typeof args.bookingId === "string" ? args.bookingId.trim() : "";
    const newStartAt =
      typeof args.newStartAt === "string" ? new Date(args.newStartAt) : null;

    if (
      !bookingId ||
      !newStartAt ||
      Number.isNaN(newStartAt.getTime())
    ) {
      return {
        success: false,
        error: "Booking ID and a valid new start time are required.",
      };
    }

    const booking = await prisma.booking.findFirst({
      where: {
        id: bookingId,
        userId,
        status: {
          not: "CANCELLED",
        },
      },
      select: {
        id: true,
        customerName: true,
        service: true,
        durationMinutes: true,
        travelBufferMinutes: true,
        employeeId: true,
      },
    });

    if (!booking) {
      return {
        success: false,
        error: "Booking not found or already cancelled.",
      };
    }

    const newEndAt = new Date(
      newStartAt.getTime() + booking.durationMinutes * 60_000,
    );

    const conflicts = await findBookingConflicts(
      userId,
      {
        startAt: newStartAt,
        endAt: newEndAt,
      },
      booking.employeeId,
      booking.travelBufferMinutes,
    );

    const conflictsWithoutCurrentBooking = conflicts.filter(
      (conflict) => conflict.id !== booking.id,
    );

    if (conflictsWithoutCurrentBooking.length > 0) {
      return {
        success: false,
        error: "The new appointment time is not available.",
        conflicts: conflictsWithoutCurrentBooking.map((conflict) => ({
          id: conflict.id,
          customerName: conflict.customerName,
          service: conflict.service,
          startAt: conflict.startAt.toISOString(),
          endAt: conflict.endAt.toISOString(),
          employeeId: conflict.employeeId,
        })),
      };
    }

    const updatedBooking = await prisma.booking.update({
      where: {
        id: booking.id,
      },
      data: {
        startAt: newStartAt,
        endAt: newEndAt,
      },
      select: {
        id: true,
        customerName: true,
        service: true,
        startAt: true,
        endAt: true,
        status: true,
      },
    });

    return {
      success: true,
      message: "Booking rescheduled successfully.",
      booking: {
        id: updatedBooking.id,
        customerName: updatedBooking.customerName,
        service: updatedBooking.service,
        startAt: updatedBooking.startAt.toISOString(),
        endAt: updatedBooking.endAt.toISOString(),
        status: updatedBooking.status,
      },
    };
  }

  if (name === "cancel_booking") {
    const bookingId =
      typeof args.bookingId === "string" ? args.bookingId.trim() : "";

    if (!bookingId) {
      return {
        success: false,
        error: "Booking ID is required.",
      };
    }

    const booking = await prisma.booking.findFirst({
      where: {
        id: bookingId,
        userId,
        status: {
          not: "CANCELLED",
        },
      },
      select: {
        id: true,
        customerName: true,
        service: true,
        startAt: true,
        endAt: true,
        status: true,
      },
    });

    if (!booking) {
      return {
        success: false,
        error: "Booking not found or already cancelled.",
      };
    }

    const cancelledBooking = await prisma.booking.update({
      where: {
        id: booking.id,
      },
      data: {
        status: "CANCELLED",
      },
      select: {
        id: true,
        customerName: true,
        service: true,
        startAt: true,
        endAt: true,
        status: true,
      },
    });

    return {
      success: true,
      message: "Booking cancelled successfully.",
      booking: {
        id: cancelledBooking.id,
        customerName: cancelledBooking.customerName,
        service: cancelledBooking.service,
        startAt: cancelledBooking.startAt.toISOString(),
        endAt: cancelledBooking.endAt.toISOString(),
        status: cancelledBooking.status,
      },
    };
  }

  if (name === "find_booking") {
    const customerPhone =
      typeof args.customerPhone === "string" ? args.customerPhone.trim() : null;
    const customerEmail =
      typeof args.customerEmail === "string"
        ? args.customerEmail.trim().toLowerCase()
        : null;

    if (!customerPhone && !customerEmail) {
      return {
        success: false,
        error: "A phone number or email address is required.",
      };
    }

    const bookings = await prisma.booking.findMany({
      where: {
        userId,
        status: {
          not: "CANCELLED",
        },
        OR: [
          ...(customerPhone ? [{ customerPhone }] : []),
          ...(customerEmail ? [{ customerEmail }] : []),
        ],
      },
      orderBy: {
        startAt: "asc",
      },
      take: 10,
    });

    return {
      success: true,
      bookings: bookings.map((booking) => ({
        id: booking.id,
        customerName: booking.customerName,
        customerPhone: booking.customerPhone,
        customerEmail: booking.customerEmail,
        service: booking.service,
        address: booking.address,
        startAt: booking.startAt.toISOString(),
        endAt: booking.endAt.toISOString(),
        durationMinutes: booking.durationMinutes,
        status: booking.status,
        employeeId: booking.employeeId,
      })),
    };
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
    const travelBufferMinutes =
      typeof args.travelBufferMinutes === "number"
        ? Math.max(0, args.travelBufferMinutes)
        : 0;

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

    const customerPhone =
      typeof args.customerPhone === "string" ? args.customerPhone.trim() : null;
    const customerEmail =
      typeof args.customerEmail === "string"
        ? args.customerEmail.trim().toLowerCase()
        : null;
    const customerName =
      typeof args.customerName === "string" ? args.customerName.trim() : "Customer";
    const address =
      typeof args.address === "string" ? args.address.trim() : null;
    const service =
      typeof args.service === "string" ? args.service.trim() : "Cleaning";

    const existingCustomer = await prisma.customer.findFirst({
      where: {
        userId,
        OR: [
          ...(customerPhone ? [{ phone: customerPhone }] : []),
          ...(customerEmail ? [{ email: customerEmail }] : []),
        ],
      },
    });

    const customer = existingCustomer
      ? await prisma.customer.update({
          where: { id: existingCustomer.id },
          data: {
            name: customerName || existingCustomer.name,
            phone: customerPhone ?? existingCustomer.phone,
            email: customerEmail ?? existingCustomer.email,
            address: address ?? existingCustomer.address,
            source: existingCustomer.source ?? "ai_employee",
            lastContactAt: new Date(),
            totalBookings: { increment: 1 },
          },
        })
      : await prisma.customer.create({
          data: {
            userId,
            name: customerName,
            phone: customerPhone,
            email: customerEmail,
            address,
            source: "ai_employee",
            lastContactAt: new Date(),
            totalBookings: 1,
          },
        });

    const lead = await prisma.lead.findFirst({
      where: {
        userId,
        OR: [
          ...(customerPhone ? [{ phone: customerPhone }] : []),
          ...(customerEmail ? [{ email: customerEmail }] : []),
        ],
      },
    });

    const booking = await createBooking({
      userId,
      customerId: customer.id,
      customerName,
      customerPhone,
      customerEmail,
      address,
      service,
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

    if (lead) {
      await prisma.lead.update({
        where: { id: lead.id },
        data: {
          customerId: customer.id,
          status: "BOOKED",
          lastMessage: "Booking created by AI employee",
        },
      });
    }

    return {
      success: true,
      customerId: customer.id,
      leadId: lead?.id ?? null,
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
      travelBufferMinutes,
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
