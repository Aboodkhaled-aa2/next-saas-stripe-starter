import { CalendarDays, Clock3, UserRound } from "lucide-react";

import { DashboardHeader } from "@/components/dashboard/header";
import { CalendarClient } from "@/components/dashboard/calendar-client";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function CalendarPage() {
  const user = await getCurrentUser();

  if (!user?.id) return null;

  const now = new Date();
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);
  const appointments = await prisma.booking.findMany({
    where: {
      userId: user.id,
      status: { not: "CANCELLED" },
    },
    orderBy: { startAt: "asc" },
  });

  const todaysAppointments = appointments.filter((appointment) => {
    const start = new Date(appointment.startAt);
    return start >= startOfToday && start < new Date(startOfToday.getTime() + 86_400_000);
  });
  const scheduledMinutes = todaysAppointments.reduce(
    (total, appointment) => total + appointment.durationMinutes,
    0,
  );
  const pendingCount = todaysAppointments.filter(
    (appointment) => appointment.status === "PENDING",
  ).length;

  return (
    <div className="space-y-6">
      <DashboardHeader
        heading="Calendar"
        text="Manage your cleaning appointments and keep your schedule organized."
      />
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Today's Appointments" value={String(todaysAppointments.length)} icon={<CalendarDays className="h-5 w-5" />} />
        <StatCard label="Scheduled Hours" value={formatHours(scheduledMinutes)} icon={<Clock3 className="h-5 w-5" />} />
        <StatCard label="Pending Confirmation" value={String(pendingCount)} icon={<UserRound className="h-5 w-5" />} />
      </div>
      <CalendarClient appointments={appointments.map((appointment) => ({
        id: appointment.id,
        customerName: appointment.customerName,
        service: appointment.service,
        address: appointment.address,
        startAt: appointment.startAt.toISOString(),
        durationMinutes: appointment.durationMinutes,
        status: appointment.status,
      }))} />
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

function formatHours(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (hours === 0) return minutes + " min";
  if (remainingMinutes === 0) return hours + (hours === 1 ? " hr" : " hrs");
  return hours + "h " + remainingMinutes + "m";
}
