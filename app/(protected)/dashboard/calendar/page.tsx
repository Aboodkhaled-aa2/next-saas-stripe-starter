import {
  CalendarDays,
  Clock3,
  MapPin,
  Plus,
  UserRound,
} from "lucide-react";

import { DashboardHeader } from "@/components/dashboard/header";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

export const dynamic = "force-dynamic";

const statusStyles: Record<string, string> = {
  CONFIRMED:
    "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
  PENDING: "border-amber-500/20 bg-amber-500/10 text-amber-400",
  COMPLETED: "border-blue-500/20 bg-blue-500/10 text-blue-400",
  CANCELLED: "border-red-500/20 bg-red-500/10 text-red-400",
};

const statusLabels: Record<string, string> = {
  CONFIRMED: "Confirmed",
  PENDING: "Pending",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

export default async function CalendarPage() {
  const user = await getCurrentUser();

  if (!user?.id) {
    return null;
  }

  const now = new Date();
  const startOfDay = new Date(now);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(now);
  endOfDay.setHours(23, 59, 59, 999);

  const appointments = await prisma.booking.findMany({
    where: {
      userId: user.id,
      startAt: {
        gte: startOfDay,
        lte: endOfDay,
      },
    },
    orderBy: {
      startAt: "asc",
    },
  });

  const todayAppointments = appointments.filter(
    (appointment) => appointment.status !== "CANCELLED",
  );

  const scheduledMinutes = todayAppointments.reduce(
    (total, appointment) => total + appointment.durationMinutes,
    0,
  );

  const pendingCount = appointments.filter(
    (appointment) => appointment.status === "PENDING",
  ).length;

  const today = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(now);

  return (
    <div className="space-y-6">
      <DashboardHeader
        heading="Calendar"
        text="Manage your cleaning appointments and keep your schedule organized."
      >
        <button
          type="button"
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-blue-500"
        >
          <Plus className="h-4 w-4" />
          Add Appointment
        </button>
      </DashboardHeader>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Today's Appointments"
          value={String(todayAppointments.length)}
          icon={<CalendarDays className="h-5 w-5" />}
        />

        <StatCard
          label="Scheduled Hours"
          value={formatHours(scheduledMinutes)}
          icon={<Clock3 className="h-5 w-5" />}
        />

        <StatCard
          label="Pending Confirmation"
          value={String(pendingCount)}
          icon={<UserRound className="h-5 w-5" />}
        />
      </div>

      <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/70 shadow-xl">
        <div className="flex flex-col gap-4 border-b border-slate-800 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-semibold text-white">Today</h2>
            <p className="mt-1 text-sm text-slate-500">{today}</p>
          </div>

          <div className="flex items-center gap-2">
            <button type="button" className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm font-medium text-slate-400 transition-colors hover:bg-slate-800 hover:text-white">Today</button>
            <button type="button" className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm font-medium text-slate-400 transition-colors hover:bg-slate-800 hover:text-white">Week</button>
          </div>
        </div>

        {todayAppointments.length === 0 ? (
          <div className="flex min-h-[320px] flex-col items-center justify-center px-6 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-800 bg-slate-900">
              <CalendarDays className="h-6 w-6 text-slate-500" />
            </div>
            <h3 className="mt-5 text-base font-semibold text-white">No appointments today</h3>
            <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
              Your confirmed and pending cleaning appointments will appear here as customers book through your AI employee.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-800">
            {todayAppointments.map((appointment) => (
              <div key={appointment.id} className="flex flex-col gap-5 p-5 transition-colors hover:bg-slate-900/30 sm:flex-row">
                <div className="flex w-24 shrink-0 items-start gap-2 pt-1">
                  <Clock3 className="mt-0.5 h-4 w-4 text-slate-600" />
                  <span className="text-sm font-medium text-slate-300">{formatTime(appointment.startAt)}</span>
                </div>
                <div className="h-px w-full bg-slate-800 sm:h-auto sm:w-px" />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-white">{appointment.service}</h3>
                    <span className={`rounded-full border px-2.5 py-1 text-[11px] font-medium ${statusStyles[appointment.status] || "border-slate-800 bg-slate-900 text-slate-400"}`}>
                      {statusLabels[appointment.status] || appointment.status}
                    </span>
                  </div>
                  <div className="mt-3 grid gap-2 text-sm text-slate-500 sm:grid-cols-2">
                    <div className="flex items-center gap-2"><UserRound className="h-4 w-4 text-slate-600" />{appointment.customerName}</div>
                    <div className="flex items-center gap-2"><Clock3 className="h-4 w-4 text-slate-600" />{formatDuration(appointment.durationMinutes)}</div>
                    {appointment.address && <div className="flex items-center gap-2 sm:col-span-2"><MapPin className="h-4 w-4 shrink-0 text-slate-600" />{appointment.address}</div>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-slate-800 bg-slate-950/70 p-5 shadow-xl">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-500/10"><CalendarDays className="h-4 w-4 text-blue-400" /></div>
          <div>
            <h3 className="font-medium text-white">AI Booking</h3>
            <p className="mt-1 text-sm leading-6 text-slate-500">Your AI employee can use the booking data in this calendar when checking availability and helping customers request appointments.</p>
          </div>
        </div>
      </section>
    </div>
  );
}

function StatCard({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-5 shadow-xl"><div className="flex items-center justify-between"><span className="text-sm text-slate-500">{label}</span><div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 text-slate-400">{icon}</div></div><p className="mt-4 text-2xl font-semibold text-white">{value}</p></div>;
}

function formatTime(date: Date) {
  return new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" }).format(date);
}

function formatDuration(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (hours === 0) return remainingMinutes + " min";
  if (remainingMinutes === 0) return hours + (hours === 1 ? " hr" : " hrs");
  return hours + (hours === 1 ? " hr " : " hrs ") + remainingMinutes + " min";
}

function formatHours(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (hours === 0) return remainingMinutes + " min";
  if (remainingMinutes === 0) return hours + " hrs";
  return hours + "h " + remainingMinutes + "m";
}