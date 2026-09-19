"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CalendarDays, MapPin, List, Grid3x3 } from "lucide-react";
import { Card, EmptyState } from "@/components/ui/card";
import type { EventRecord } from "@/types/database";

function EventGrid({ events, emptyLabel }: { events: EventRecord[]; emptyLabel: string }) {
  if (events.length === 0) return <EmptyState label={emptyLabel} />;
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {events.map((e) => (
        <Link key={e.id} href={`/events/${e.id}`}>
          <Card className="h-full p-4 transition hover:border-primary/50">
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-accent">
                <CalendarDays size={18} />
              </div>
              {e.status === "cancelled" && <span className="rounded-full bg-danger/10 px-2 py-0.5 text-xs font-medium text-danger">Cancelled</span>}
            </div>
            <h3 className="mt-3 text-sm font-semibold">{e.title}</h3>
            <p className="mt-1 line-clamp-2 text-sm text-muted">{e.description}</p>
            <div className="mt-3 space-y-1 text-xs text-muted">
              <p>{new Date(e.start_date).toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}</p>
              {e.location && (
                <p className="flex items-center gap-1">
                  <MapPin size={12} /> {e.location}
                </p>
              )}
            </div>
          </Card>
        </Link>
      ))}
    </div>
  );
}

export function EventCalendar({ upcoming, past }: { upcoming: EventRecord[]; past: EventRecord[] }) {
  const [view, setView] = useState<"list" | "month">("list");
  const [monthOffset, setMonthOffset] = useState(0);
  const all = useMemo(() => [...upcoming, ...past], [upcoming, past]);

  const now = new Date();
  const viewMonth = new Date(now.getFullYear(), now.getMonth() + monthOffset, 1);
  const daysInMonth = new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 0).getDate();
  const firstWeekday = viewMonth.getDay();
  const cells: (string | null)[] = [...Array(firstWeekday).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => `${viewMonth.getFullYear()}-${String(viewMonth.getMonth() + 1).padStart(2, "0")}-${String(i + 1).padStart(2, "0")}`)];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <button onClick={() => setView("list")} className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium ${view === "list" ? "bg-primary text-primary-foreground" : "border border-border hover:bg-background"}`}>
          <List size={14} /> List
        </button>
        <button onClick={() => setView("month")} className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium ${view === "month" ? "bg-primary text-primary-foreground" : "border border-border hover:bg-background"}`}>
          <Grid3x3 size={14} /> Month
        </button>
      </div>

      {view === "month" ? (
        <Card>
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <p className="text-sm font-semibold">{viewMonth.toLocaleString("en", { month: "long", year: "numeric" })}</p>
            <div className="flex gap-1">
              <button onClick={() => setMonthOffset((m) => m - 1)} className="rounded-md border border-border px-2 py-1 text-xs hover:bg-background">‹</button>
              <button onClick={() => setMonthOffset((m) => m + 1)} className="rounded-md border border-border px-2 py-1 text-xs hover:bg-background">›</button>
            </div>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-7 gap-1.5 text-center text-xs text-muted">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => <div key={d}>{d}</div>)}
            </div>
            <div className="mt-1.5 grid grid-cols-7 gap-1.5">
              {cells.map((date, i) => {
                if (!date) return <div key={i} />;
                const dayEvents = all.filter((e) => e.start_date === date);
                return (
                  <div key={date} className={`min-h-[3.5rem] rounded-lg border p-1 text-xs ${dayEvents.length ? "border-primary/40 bg-primary/5" : "border-border"}`}>
                    <p className="text-muted">{Number(date.slice(-2))}</p>
                    {dayEvents.slice(0, 2).map((e) => (
                      <Link key={e.id} href={`/events/${e.id}`} className="mt-0.5 block truncate rounded bg-primary/10 px-1 text-[10px] font-medium text-primary hover:bg-primary/20">
                        {e.title}
                      </Link>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
        </Card>
      ) : (
        <div className="space-y-6">
          <div>
            <h2 className="mb-3 text-sm font-semibold">Upcoming Events</h2>
            <EventGrid events={upcoming} emptyLabel="No upcoming events." />
          </div>
          <div>
            <h2 className="mb-3 text-sm font-semibold">Past Events</h2>
            <EventGrid events={past} emptyLabel="No past events yet." />
          </div>
        </div>
      )}
    </div>
  );
}
