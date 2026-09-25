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




async function resolveConfiguredDuration(
  userId: string,
  details: {
    bedrooms?: number | null;
    bathrooms?: number | null;
    propertySize?: string | null;
  },
): Promise<{
  success: boolean;
  durationMinutes?: number;
  needsMoreDetails?: boolean;
  error?: string;
}> {
  const profile = await prisma.businessProfile.findUnique({
    where: { userId },
    select: { bookingRules: true },
  });

  if (!profile) {
    return { success: false, error: "Business profile not found." };
  }

  let configuration: {
    duration?: {
      mode?: "fixed" | "rules";
      fixedDurationMinutes?: number | null;
      rules?: string | null;
    };
  } = {};

  if (typeof profile.bookingRules === "string") {
    try {
      configuration = JSON.parse(profile.bookingRules) as typeof configuration;
    } catch {
      configuration = {};
    }
  } else if (
    profile.bookingRules &&
    typeof profile.bookingRules === "object" &&
    !Array.isArray(profile.bookingRules)
  ) {
    configuration = profile.bookingRules as typeof configuration;
  }

  const duration = configuration.duration;

  if (!duration) {
    return {
      success: false,
      error: "No appointment duration settings are configured for this business.",
    };
  }

  if (duration.mode === "fixed") {
    const minutes =
      typeof duration.fixedDurationMinutes === "number"
        ? duration.fixedDurationMinutes
        : 0;

    return minutes > 0
      ? { success: true, durationMinutes: minutes }
      : {
          success: false,
          error: "The company's fixed appointment duration is invalid.",
        };
  }

  if (duration.mode !== "rules") {
    return {
      success: false,
      error: "Appointment duration mode is not configured correctly.",
    };
  }

  const rules =
    typeof duration.rules === "string" ? duration.rules.trim() : "";

  if (!rules) {
    return {
      success: false,
      error: "Company-defined duration rules are not configured.",
    };
  }

  const bedrooms = details.bedrooms ?? null;
  const bathrooms = details.bathrooms ?? null;

  const bedroomRules: RegExpExecArray[] = [];
  const bedroomRulePattern =
    /(\d+)\s*(?:-|–|to)\s*(\d+)\s*bedrooms?\s*=\s*(\d+(?:\.\d+)?)\s*hours?/gi;
  let bedroomRuleMatch: RegExpExecArray | null;

  while ((bedroomRuleMatch = bedroomRulePattern.exec(rules)) !== null) {
    bedroomRules.push(bedroomRuleMatch);
  }

  let durationHours: number | null = null;

  for (const match of bedroomRules) {
    const min = Number(match[1]);
    const max = Number(match[2]);
    const hours = Number(match[3]);

    if (bedrooms !== null && bedrooms >= min && bedrooms <= max) {
      durationHours = hours;
      break;
    }
  }

  const plusMatch = rules.match(
    /(\d+)\s*\+\s*bedrooms?\s*=\s*(\d+(?:\.\d+)?)\s*hours?/i,
  );

  if (
    durationHours === null &&
    plusMatch &&
    bedrooms !== null &&
    bedrooms >= Number(plusMatch[1])
  ) {
    durationHours = Number(plusMatch[2]);
  }

  if (durationHours === null) {
    return {
      success: false,
      needsMoreDetails: bedrooms === null,
      error:
        "The company-defined rules do not produce a duration from the supplied property details. Do not invent a duration.",
    };
  }

  let minutes = Math.round(durationHours * 60);

  const bathroomMatch = rules.match(
    /add\s+(\d+)\s*minutes?\s+for\s+every\s+(\d+)\s+additional\s+bathrooms?/i,
  );

  if (bathroomMatch && bathrooms !== null) {
    const extraMinutes = Number(bathroomMatch[1]);
    const bathroomStep = Number(bathroomMatch[2]);

    if (bathroomStep > 0 && bathrooms > bathroomStep) {
      minutes +=
        Math.floor((bathrooms - bathroomStep) / bathroomStep) *
        extraMinutes;
    }
  }

  return { success: true, durationMinutes: minutes };
}

async function findAlternativeBookingTimes(
  userId: string,
  requestedStartAt: Date,
  durationMinutes: number,
  employeeId: string | null,
  travelBufferMinutes: number,
) {
  const offsetsMinutes = [30, -30, 60, -60, 90, -90, 120, -120, 180, -180];
  const alternatives: Date[] = [];

  for (const offsetMinutes of offsetsMinutes) {
    const candidateStartAt = new Date(
      requestedStartAt.getTime() + offsetMinutes * 60_000,
    );
    const candidateEndAt = new Date(
      candidateStartAt.getTime() + durationMinutes * 60_000,
    );

    const conflicts = await findBookingConflicts(
      userId,
      { startAt: candidateStartAt, endAt: candidateEndAt },
      employeeId,
      travelBufferMinutes,
    );

    if (candidateStartAt.getTime() > Date.now() && conflicts.length === 0) {
      alternatives.push(candidateStartAt);
    }

    if (alternatives.length >= 3) {
      break;
    }
  }

  return alternatives;
}

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
    name: "get_booking_duration_rules",
    description:
      "Read the cleaning company's configured appointment duration settings. Always use this before choosing durationMinutes for a new booking. Never invent a duration. If the company uses fixed duration, use the returned fixed duration exactly. If the company uses company-defined rules, follow only the returned explicit rules and collect any missing property details needed to apply them.",
    parameters: {
      type: "object",
      properties: {
        bedrooms: {
          type: ["number", "null"],
          description: "Number of bedrooms in the property.",
        },
        bathrooms: {
          type: ["number", "null"],
          description: "Number of bathrooms in the property.",
        },
        propertySize: {
          type: ["string", "null"],
          description: "Approximate property size if relevant to the company's rules.",
        },
      },
      required: ["bedrooms", "bathrooms", "propertySize"],
      additionalProperties: false,
    },
    strict: true,
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
        customerPhone: {
          type: ["string", "null"],
          description: "The customer's phone number used for booking verification.",
        },
        customerEmail: {
          type: ["string", "null"],
          description: "The customer's email address used for booking verification.",
        },
        newStartAt: {
          type: "string",
          description: "New appointment start time as an ISO 8601 datetime.",
        },
      },
      required: ["bookingId", "customerPhone", "customerEmail", "newStartAt"],
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
        customerPhone: {
          type: ["string", "null"],
          description: "The customer's phone number used for booking verification.",
        },
        customerEmail: {
          type: ["string", "null"],
          description: "The customer's email address used for booking verification.",
        },
      },
      required: ["bookingId", "customerPhone", "customerEmail"],
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
        bedrooms: {
          type: ["number", "null"],
          description: "Number of bedrooms in the property.",
        },
        bathrooms: {
          type: ["number", "null"],
          description: "Number of bathrooms in the property.",
        },
        propertySize: {
          type: ["string", "null"],
          description: "Approximate property size if relevant to the company's rules.",
        },
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
    strict: true,
  },
];

function isBookingTool(name: string) {
  return [
    "reschedule_booking",
    "cancel_booking",
    "find_booking",
    "create_booking",
    "check_booking_availability",
  ].includes(name);
}

async function hasActiveBookingAccess(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      role: true,
      stripePriceId: true,
      stripeCurrentPeriodEnd: true,
    },
  });

  if (user?.role === "ADMIN") {
    return true;
  }

  if (!user?.stripePriceId || !user.stripeCurrentPeriodEnd) {
    return false;
  }

  if (user.stripeCurrentPeriodEnd.getTime() + 86_400_000 <= Date.now()) {
    return false;
  }

  return [
    process.env.NEXT_PUBLIC_STRIPE_BUSINESS_MONTHLY_PLAN_ID,
    process.env.NEXT_PUBLIC_STRIPE_BUSINESS_YEARLY_PLAN_ID,
    process.env.NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PLAN_ID,
    process.env.NEXT_PUBLIC_STRIPE_PRO_YEARLY_PLAN_ID,
  ].includes(user.stripePriceId);
}

async function executeCustomerAgentTool(
  name: string,
  argumentsJson: string,
  userId: string,
): Promise<Record<string, unknown>> {
  if (isBookingTool(name) && !(await hasActiveBookingAccess(userId))) {
    return {
      success: false,
      error: "Appointment booking is available on Business and Pro plans only.",
    };
  }

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

  if (name === "get_booking_duration_rules") {
    const resolvedDuration = await resolveConfiguredDuration(userId, {
      bedrooms: typeof args.bedrooms === "number" ? args.bedrooms : null,
      bathrooms: typeof args.bathrooms === "number" ? args.bathrooms : null,
      propertySize:
        typeof args.propertySize === "string" ? args.propertySize.trim() : null,
    });

    if (!resolvedDuration.success) {
      return {
        success: false,
        error:
          resolvedDuration.error ??
          "Unable to determine the appointment duration from company rules.",
        needsMoreDetails: resolvedDuration.needsMoreDetails ?? false,
      };
    }

    return {
      success: true,
      durationMinutes: resolvedDuration.durationMinutes,
      needsMoreDetails: false,
      message:
        "Use the configured company duration exactly. Do not invent or override the duration.",
    };
  }

  if (name === "reschedule_booking") {
    const bookingId =
      typeof args.bookingId === "string" ? args.bookingId.trim() : "";
    const customerPhone =
      typeof args.customerPhone === "string" ? args.customerPhone.trim() : null;
    const customerEmail =
      typeof args.customerEmail === "string"
        ? args.customerEmail.trim().toLowerCase()
        : null;
    const newStartAt =
      typeof args.newStartAt === "string" ? new Date(args.newStartAt) : null;

    if (
      !bookingId ||
      (!customerPhone && !customerEmail) ||
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
        customerPhone: true,
        customerEmail: true,
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

    const identityMatches =
      (customerPhone && booking.customerPhone === customerPhone) ||
      (customerEmail && booking.customerEmail === customerEmail);

    if (!identityMatches) {
      return {
        success: false,
        error: "The booking could not be verified for this customer.",
      };
    }

    if (newStartAt.getTime() <= Date.now()) {
      return {
        success: false,
        error: "The new appointment time must be in the future.",
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
    const customerPhone =
      typeof args.customerPhone === "string" ? args.customerPhone.trim() : null;
    const customerEmail =
      typeof args.customerEmail === "string"
        ? args.customerEmail.trim().toLowerCase()
        : null;

    if (!bookingId || (!customerPhone && !customerEmail)) {
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
        customerPhone: true,
        customerEmail: true,
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

    const identityMatches =
      (customerPhone && booking.customerPhone === customerPhone) ||
      (customerEmail && booking.customerEmail === customerEmail);

    if (!identityMatches) {
      return {
        success: false,
        error: "The booking could not be verified for this customer.",
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

  if (name === "create_booking") {
    const startAt =
      typeof args.startAt === "string" ? new Date(args.startAt) : null;
    let durationMinutes =
      typeof args.durationMinutes === "number" ? args.durationMinutes : 0;
    const employeeId =
      typeof args.employeeId === "string" ? args.employeeId : null;
    const travelBufferMinutes =
      typeof args.travelBufferMinutes === "number"
        ? Math.max(0, args.travelBufferMinutes)
        : 0;

    const resolvedDuration = await resolveConfiguredDuration(userId, {
      bedrooms: typeof args.bedrooms === "number" ? args.bedrooms : null,
      bathrooms: typeof args.bathrooms === "number" ? args.bathrooms : null,
      propertySize:
        typeof args.propertySize === "string" ? args.propertySize : null,
    });

    if (!resolvedDuration.success || !resolvedDuration.durationMinutes) {
      return {
        success: false,
        error:
          resolvedDuration.error ??
          "Unable to determine the appointment duration from company rules.",
        needsMoreDetails: resolvedDuration.needsMoreDetails ?? false,
      };
    }

    durationMinutes = resolvedDuration.durationMinutes;

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

    if (startAt.getTime() <= Date.now()) {
      return {
        success: false,
        error: "The appointment time must be in the future.",
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
      const alternativeStartAt = await findAlternativeBookingTimes(
        userId,
        startAt,
        durationMinutes,
        employeeId,
        travelBufferMinutes,
      );

      return {
        success: false,
        error: "The requested appointment is no longer available.",
        alternativeTimes: alternativeStartAt.map((alternativeStart) => ({
          startAt: alternativeStart.toISOString(),
          endAt: new Date(
            alternativeStart.getTime() + durationMinutes * 60_000,
          ).toISOString(),
        })),
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
            totalBookings: 0,
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

    await prisma.customer.update({
      where: { id: customer.id },
      data: {
        totalBookings: { increment: 1 },
        lastContactAt: new Date(),
      },
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
    const requestedEndAt =
      typeof args.endAt === "string" ? new Date(args.endAt) : null;
    const employeeId =
      typeof args.employeeId === "string" ? args.employeeId : null;
    const travelBufferMinutes =
      typeof args.travelBufferMinutes === "number"
        ? Math.max(0, args.travelBufferMinutes)
        : 0;

    if (
      !startAt ||
      !requestedEndAt ||
      Number.isNaN(startAt.getTime()) ||
      Number.isNaN(requestedEndAt.getTime()) ||
      startAt >= requestedEndAt
    ) {
      return {
        success: false,
        error: "Invalid appointment window.",
      };
    }

    const resolvedDuration = await resolveConfiguredDuration(userId, {
      bedrooms: typeof args.bedrooms === "number" ? args.bedrooms : null,
      bathrooms: typeof args.bathrooms === "number" ? args.bathrooms : null,
      propertySize:
        typeof args.propertySize === "string" ? args.propertySize.trim() : null,
    });

    if (!resolvedDuration.success || !resolvedDuration.durationMinutes) {
      return {
        success: false,
        error:
          resolvedDuration.error ??
          "Unable to determine the appointment duration from company rules.",
        needsMoreDetails: resolvedDuration.needsMoreDetails ?? false,
      };
    }

    if (startAt.getTime() <= Date.now()) {
      return {
        success: false,
        error: "The appointment time must be in the future.",
      };
    }

    const endAt = new Date(
      startAt.getTime() + resolvedDuration.durationMinutes * 60_000,
    );

    const conflicts = await findBookingConflicts(
      userId,
      { startAt, endAt },
      employeeId,
      travelBufferMinutes,
    );

    const available = conflicts.length === 0;
    const alternativeStartAt = available
      ? []
      : await findAlternativeBookingTimes(
          userId,
          startAt,
          resolvedDuration.durationMinutes,
          employeeId,
          travelBufferMinutes,
        );

    return {
      success: true,
      available,
      startAt: startAt.toISOString(),
      endAt: endAt.toISOString(),
      durationMinutes: Math.round(
        (endAt.getTime() - startAt.getTime()) / 60_000,
      ),
      alternativeTimes: alternativeStartAt.map((alternativeStart) => ({
        startAt: alternativeStart.toISOString(),
        endAt: new Date(
          alternativeStart.getTime() + resolvedDuration.durationMinutes! * 60_000,
        ).toISOString(),
      })),
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

  const bookingAccessEnabled = await hasActiveBookingAccess(options.userId);

  let response = await openai.responses.create({
    model: "gpt-5.6-terra",
    reasoning: {
      effort: "low",
    },
    instructions: buildCustomerAgentSystemPrompt(knowledge),
    input: options.message,
    tools: bookingAccessEnabled
      ? customerAgentTools
      : customerAgentTools.filter((tool) => !isBookingTool(tool.name)),
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
      tools: bookingAccessEnabled
        ? customerAgentTools
        : customerAgentTools.filter((tool) => !isBookingTool(tool.name)),
    });
  }

  return {
    responseId: response.id,
    text: response.output_text,
  };
}
