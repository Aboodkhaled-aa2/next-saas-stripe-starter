"use client";

import { useMemo, useState } from "react";
import { CalendarDays, Clock3, MapPin, ChevronLeft, ChevronRight, UserRound } from "lucide-react";

type Appointment = {
  id: string;
  customerName: string;
  service: string;
  address: string | null;
  startAt: string;
  durationMinutes: number;
  status: string;
};

const statusStyles: Record<string, string> = {
  CONFIRMED: "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
  PENDING: "border-amber-500/20 bg-amber-500/10 text-amber-400",
  COMPLETED: "border-blue-500/20 bg-blue-500/10 text-blue-400",
};

export function CalendarClient({ appointments }: { appointments: Appointment[] }) {
  const [view, setView] = useState<"today" | "week">("today");
  const [weekOffset, setWeekOffset] = useState(0);

  const days = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = new Date(today);
    start.setDate(start.getDate() - start.getDay() + weekOffset * 7);
    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date(start);
      date.setDate(start.getDate() + index);
      const end = new Date(date);
      end.setDate(end.getDate() + 1);
      return {
        date,
        items: appointments.filter((item) => {
          const time = new Date(item.startAt);
          return time >= date && time < end;
        }),
      };
    });
  }, [appointments, weekOffset]);

  const todayKey = new Date().toDateString();
  const visibleDays = view === "today"
    ? days.filter((day) => day.date.toDateString() === todayKey)
    : days;

  function shiftWeek(direction: number) {
    setWeekOffset((current) => current + direction);
    setView("week");
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/70 shadow-xl">
      <div className="flex flex-col gap-4 border-b border-slate-800 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-semibold text-white">{view === "today" ? "Today" : "This Week"}</h2>
          <p className="mt-1 text-sm text-slate-500">
            {view === "today"
              ? new Intl.DateTimeFormat("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" }).format(new Date())
              : days.length ? new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(days[0].date) + " – " + new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(days[6].date) : ""}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={() => { setWeekOffset(0); setView("today"); }} className={`rounded-lg border px-3 py-2 text-sm font-medium ${view === "today" ? "border-blue-500/40 bg-blue-500/10 text-blue-300" : "border-slate-800 bg-slate-900 text-slate-400 hover:text-white"}`}>Today</button>
          <button type="button" onClick={() => setView("week")} className={`rounded-lg border px-3 py-2 text-sm font-medium ${view === "week" ? "border-blue-500/40 bg-blue-500/10 text-blue-300" : "border-slate-800 bg-slate-900 text-slate-400 hover:text-white"}`}>Week</button>
          {view === "week" && <>
            <button type="button" aria-label="Previous week" onClick={() => shiftWeek(-1)} className="rounded-lg border border-slate-800 bg-slate-900 p-2 text-slate-400 hover:text-white"><ChevronLeft className="h-4 w-4" /></button>
            <button type="button" aria-label="Next week" onClick={() => shiftWeek(1)} className="rounded-lg border border-slate-800 bg-slate-900 p-2 text-slate-400 hover:text-white"><ChevronRight className="h-4 w-4" /></button>
          </>}
        </div>
      </div>
      {visibleDays.every((day) => day.items.length === 0) ? (
        <div className="flex min-h-[280px] flex-col items-center justify-center px-6 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-800 bg-slate-900"><CalendarDays className="h-6 w-6 text-slate-500" /></div>
          <h3 className="mt-5 text-base font-semibold text-white">No appointments {view === "today" ? "today" : "this week"}</h3>
          <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">Confirmed and pending cleaning appointments will appear here when customers book through your AI employee.</p>
        </div>
      ) : (
        <div className="divide-y divide-slate-800">
          {visibleDays.map((day) => (
            <div key={day.date.toISOString()}>
              {view === "week" && <div className="border-b border-slate-800/70 bg-slate-900/40 px-5 py-3 text-sm font-semibold text-slate-300">{new Intl.DateTimeFormat("en-US", { weekday: "long", month: "short", day: "numeric" }).format(day.date)} <span className="ml-2 text-slate-500">({day.items.length})</span></div>}
              {day.items.length === 0 ? (
                view === "week" && <p className="px-5 py-4 text-sm text-slate-600">No appointments</p>
              ) : day.items.map((item) => (
                <div key={item.id} className="flex flex-col gap-4 p-5 transition-colors hover:bg-slate-900/30 sm:flex-row">
                  <div className="flex w-24 shrink-0 items-start gap-2 pt-1"><Clock3 className="mt-0.5 h-4 w-4 text-slate-600" /><span className="text-sm font-medium text-slate-300">{new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" }).format(new Date(item.startAt))}</span></div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2"><h3 className="font-semibold text-white">{item.service}</h3><span className={`rounded-full border px-2.5 py-1 text-[11px] font-medium ${statusStyles[item.status] || "border-slate-800 bg-slate-900 text-slate-400"}`}>{item.status}</span></div>
                    <div className="mt-3 grid gap-2 text-sm text-slate-500 sm:grid-cols-2">
                      <div className="flex items-center gap-2"><UserRound className="h-4 w-4 text-slate-600" />{item.customerName}</div>
                      <div className="flex items-center gap-2"><Clock3 className="h-4 w-4 text-slate-600" />{formatDuration(item.durationMinutes)}</div>
                      {item.address && <div className="flex items-center gap-2 sm:col-span-2"><MapPin className="h-4 w-4 shrink-0 text-slate-600" />{item.address}</div>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function formatDuration(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const remaining = minutes % 60;
  if (!hours) return minutes + " min";
  if (!remaining) return hours + (hours === 1 ? " hr" : " hrs");
  return hours + "h " + remaining + "m";
}
