import "server-only";

import { prisma } from "@/lib/db";
import { BookingStatus } from "@prisma/client";

export type BookingWindow = {
  startAt: Date;
  endAt: Date;
};

export type CreateBookingInput = {
  userId: string;
  customerId?: string | null;
  customerName: string;
  customerPhone?: string | null;
  customerEmail?: string | null;
  address?: string | null;
  service: string;
  propertyType?: string | null;
  bedrooms?: number | null;
  bathrooms?: number | null;
  propertySize?: string | null;
  notes?: string | null;
  startAt: Date;
  durationMinutes: number;
  travelBufferMinutes?: number;
  employeeId?: string | null;
  status?: BookingStatus;
};

export async function getBookingsForDay(userId: string, date: Date) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(startOfDay);
  endOfDay.setDate(endOfDay.getDate() + 1);

  return prisma.booking.findMany({
    where: {
      userId,
      startAt: {
        lt: endOfDay,
      },
      endAt: {
        gt: startOfDay,
      },
      status: {
        not: "CANCELLED",
      },
    },
    orderBy: {
      startAt: "asc",
    },
  });
}

export async function findBookingConflicts(
  userId: string,
  window: BookingWindow,
  employeeId?: string | null,
  travelBufferMinutes = 0,
) {
  const bufferMs = Math.max(0, travelBufferMinutes) * 60_000;

  const candidates = await prisma.booking.findMany({
    where: {
      userId,
      status: {
        not: "CANCELLED",
      },
      startAt: {
        lt: new Date(window.endAt.getTime() + bufferMs),
      },
      endAt: {
        gt: new Date(window.startAt.getTime() - bufferMs),
      },
      ...(employeeId ? { employeeId } : { employeeId: null }),
    },
    orderBy: {
      startAt: "asc",
    },
  });

  return candidates.filter((booking) => {
    const existingEndWithBuffer =
      booking.endAt.getTime() +
      Math.max(0, booking.travelBufferMinutes) * 60_000;
    const requestedEndWithBuffer = window.endAt.getTime() + bufferMs;

    return (
      booking.startAt.getTime() < requestedEndWithBuffer &&
      existingEndWithBuffer > window.startAt.getTime()
    );
  });
}

export async function createBooking(input: CreateBookingInput) {
  if (input.durationMinutes <= 0) {
    throw new Error("Booking duration must be greater than zero.");
  }

  if (input.startAt >= new Date(input.startAt.getTime() + input.durationMinutes * 60_000)) {
    throw new Error("Booking start time must be before its end time.");
  }

  const endAt = new Date(
    input.startAt.getTime() + input.durationMinutes * 60_000,
  );

  const conflicts = await findBookingConflicts(
    input.userId,
    {
      startAt: input.startAt,
      endAt,
    },
    input.employeeId,
    input.travelBufferMinutes ?? 0,
  );

  if (conflicts.length > 0) {
    throw new Error("The requested booking time conflicts with an existing booking.");
  }

  if (input.employeeId) {
    const employee = await prisma.employee.findFirst({
      where: {
        id: input.employeeId,
        userId: input.userId,
        active: true,
      },
      select: { id: true },
    });

    if (!employee) {
      throw new Error("The selected employee is not available.");
    }
  }

  return prisma.booking.create({
    data: {
      userId: input.userId,
      customerId: input.customerId ?? null,
      customerName: input.customerName,
      customerPhone: input.customerPhone ?? null,
      customerEmail: input.customerEmail ?? null,
      address: input.address ?? null,
      service: input.service,
      propertyType: input.propertyType ?? null,
      bedrooms: input.bedrooms ?? null,
      bathrooms: input.bathrooms ?? null,
      propertySize: input.propertySize ?? null,
      notes: input.notes ?? null,
      startAt: input.startAt,
      endAt,
      durationMinutes: input.durationMinutes,
      travelBufferMinutes: input.travelBufferMinutes ?? 0,
      employeeId: input.employeeId ?? null,
      status: input.status ?? BookingStatus.PENDING,
    },
  });
}
