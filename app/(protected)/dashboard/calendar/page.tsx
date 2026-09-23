import {
  CalendarDays,
  Clock3,
  MapPin,
  Plus,
  UserRound,
} from "lucide-react";

import { DashboardHeader } from "@/components/dashboard/header";

export const dynamic = "force-dynamic";

const appointments = [
  {
    time: "09:00 AM",
    customer: "Sarah Johnson",
    service: "Deep Cleaning",
    address: "124 Main Street",
    duration: "2 hrs",
    status: "Confirmed",
  },
  {
    time: "11:30 AM",
    customer: "Michael Brown",
    service: "Move-Out Cleaning",
    address: "87 Oak Avenue",
    duration: "3 hrs",
    status: "Confirmed",
  },
  {
    time: "02:00 PM",
    customer: "Emily Davis",
    service: "Standard Cleaning",
    address: "42 Pine Road",
    duration: "2 hrs",
    status: "Pending",
  },
];

const statusStyles: Record<string, string> = {
  Confirmed:
    "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
  Pending: "border-amber-500/20 bg-amber-500/10 text-amber-400",
};

export default function CalendarPage() {
  const today = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date());

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
          value="3"
          icon={<CalendarDays className="h-5 w-5" />}
        />

        <StatCard
          label="Scheduled Hours"
          value="7 hrs"
          icon={<Clock3 className="h-5 w-5" />}
        />

        <StatCard
          label="Pending Confirmation"
          value="1"
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
            <button
              type="button"
              className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm font-medium text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
            >
              Today
            </button>

            <button
              type="button"
              className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm font-medium text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
            >
              Week
            </button>
          </div>
        </div>

        <div className="divide-y divide-slate-800">
          {appointments.map((appointment) => (
            <div
              key={`${appointment.time}-${appointment.customer}`}
              className="flex flex-col gap-5 p-5 transition-colors hover:bg-slate-900/30 sm:flex-row"
            >
              <div className="flex w-24 shrink-0 items-start gap-2 pt-1">
                <Clock3 className="mt-0.5 h-4 w-4 text-slate-600" />

                <span className="text-sm font-medium text-slate-300">
                  {appointment.time}
                </span>
              </div>

              <div className="h-px w-full bg-slate-800 sm:h-auto sm:w-px" />

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-semibold text-white">
                    {appointment.service}
                  </h3>

                  <span
                    className={`rounded-full border px-2.5 py-1 text-[11px] font-medium ${
                      statusStyles[appointment.status] ||
                      "border-slate-800 bg-slate-900 text-slate-400"
                    }`}
                  >
                    {appointment.status}
                  </span>
                </div>

                <div className="mt-3 grid gap-2 text-sm text-slate-500 sm:grid-cols-2">
                  <div className="flex items-center gap-2">
                    <UserRound className="h-4 w-4 text-slate-600" />
                    {appointment.customer}
                  </div>

                  <div className="flex items-center gap-2">
                    <Clock3 className="h-4 w-4 text-slate-600" />
                    {appointment.duration}
                  </div>

                  <div className="flex items-center gap-2 sm:col-span-2">
                    <MapPin className="h-4 w-4 shrink-0 text-slate-600" />
                    {appointment.address}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-800 bg-slate-950/70 p-5 shadow-xl">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-500/10">
            <CalendarDays className="h-4 w-4 text-blue-400" />
          </div>

          <div>
            <h3 className="font-medium text-white">AI Booking</h3>

            <p className="mt-1 text-sm leading-6 text-slate-500">
              Once your calendar integration is connected, your AI employee
              will be able to check availability, book appointments, and send
              booking confirmations automatically.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-5 shadow-xl">
      <div className="flex items-center justify-between">
        <span className="text-sm text-slate-500">{label}</span>

        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 text-slate-400">
          {icon}
        </div>
      </div>

      <p className="mt-4 text-2xl font-semibold text-white">{value}</p>
    </div>
  );
}
