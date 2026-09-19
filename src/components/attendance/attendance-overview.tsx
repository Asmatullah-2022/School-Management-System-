"use client";

import { useMemo, useState } from "react";
import { CalendarCheck, CalendarX, Clock, UserX } from "lucide-react";
import { StatCard } from "@/components/dashboard/stat-card";
import { Card, CardHeader, EmptyState } from "@/components/ui/card";
import { AttendanceChart } from "@/components/dashboard/charts";
import type { AttendanceRecord, Student } from "@/types/database";

const STATUS_COLORS: Record<string, string> = {
  present: "bg-success text-white",
  absent: "bg-danger text-white",
  late: "bg-warning text-white",
  leave: "bg-accent text-white",
};

type ViewMode = "daily" | "weekly" | "monthly" | "session";

function computeStats(records: AttendanceRecord[]) {
  const present = records.filter((r) => r.status === "present").length;
  const absent = records.filter((r) => r.status === "absent").length;
  const late = records.filter((r) => r.status === "late").length;
  const leave = records.filter((r) => r.status === "leave").length;
  const total = records.length;
  const percentage = total > 0 ? Math.round(((present + late) / total) * 100) : 0;
  return { present, absent, late, leave, total, percentage };
}

export function AttendanceOverview({ students, attendance }: { students: Student[]; attendance: AttendanceRecord[] }) {
  const [selectedId, setSelectedId] = useState(students[0]?.id);
  const [view, setView] = useState<ViewMode>("monthly");
  const [monthOffset, setMonthOffset] = useState(0);

  const student = students.find((s) => s.id === selectedId) ?? students[0];
  const records = useMemo(() => attendance.filter((a) => a.student_id === student?.id).sort((a, b) => (a.date < b.date ? -1 : 1)), [attendance, student]);

  const now = useMemo(() => new Date(), []);
  const viewMonth = useMemo(() => new Date(now.getFullYear(), now.getMonth() + monthOffset, 1), [now, monthOffset]);

  const scoped = useMemo(() => {
    if (view === "daily") {
      const todayISO = now.toISOString().slice(0, 10);
      return records.filter((r) => r.date === todayISO);
    }
    if (view === "weekly") {
      const weekAgo = new Date(now);
      weekAgo.setDate(now.getDate() - 6);
      const weekAgoISO = weekAgo.toISOString().slice(0, 10);
      return records.filter((r) => r.date >= weekAgoISO);
    }
    if (view === "monthly") {
      const prefix = `${viewMonth.getFullYear()}-${String(viewMonth.getMonth() + 1).padStart(2, "0")}`;
      return records.filter((r) => r.date.startsWith(prefix));
    }
    return records; // academic session = all records
  }, [records, view, now, viewMonth]);

  const stats = computeStats(scoped);

  const trendData = useMemo(() => {
    const last7 = Array.from(new Set(records.map((r) => r.date))).sort().slice(-7);
    return last7.map((d) => {
      const dayRecords = records.filter((r) => r.date === d);
      return {
        date: new Date(d).toLocaleDateString("en-US", { weekday: "short" }),
        present: dayRecords.filter((r) => r.status === "present" || r.status === "late").length,
        absent: dayRecords.filter((r) => r.status === "absent").length,
      };
    });
  }, [records]);

  if (!student) {
    return (
      <Card>
        <EmptyState label="No children are linked to your account yet." />
      </Card>
    );
  }

  // Calendar grid for the viewed month
  const daysInMonth = new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 0).getDate();
  const firstWeekday = viewMonth.getDay();
  const calendarCells: (string | null)[] = [...Array(firstWeekday).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => `${viewMonth.getFullYear()}-${String(viewMonth.getMonth() + 1).padStart(2, "0")}-${String(i + 1).padStart(2, "0")}`)];

  return (
    <div className="space-y-4">
      {students.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {students.map((s) => (
            <button
              key={s.id}
              onClick={() => setSelectedId(s.id)}
              className={`rounded-full px-3.5 py-2 text-sm font-medium transition ${student.id === s.id ? "bg-primary text-primary-foreground" : "border border-border text-muted hover:bg-background"}`}
            >
              {s.full_name}
            </button>
          ))}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {(["daily", "weekly", "monthly", "session"] as ViewMode[]).map((v) => (
          <button
            key={v}
            onClick={() => setView(v)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium capitalize transition ${view === v ? "bg-primary text-primary-foreground" : "border border-border text-muted hover:bg-background"}`}
          >
            {v === "session" ? "Academic Session" : v}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Present" value={stats.present} icon={CalendarCheck} tone="success" />
        <StatCard label="Absent" value={stats.absent} icon={CalendarX} tone="danger" />
        <StatCard label="Late" value={stats.late} icon={Clock} tone="warning" />
        <StatCard label="Leave" value={stats.leave} icon={UserX} tone="accent" />
      </div>
      <div className="rounded-2xl border border-border bg-surface p-4 shadow-sm">
        <p className="text-xs text-muted">Attendance Percentage ({view === "session" ? "Academic Session" : view})</p>
        <p className={`mt-1 text-2xl font-semibold ${stats.percentage >= 75 ? "text-success" : "text-danger"}`}>{stats.percentage}%</p>
      </div>

      {view === "monthly" && (
        <Card>
          <CardHeader
            title={viewMonth.toLocaleString("en", { month: "long", year: "numeric" })}
            action={
              <div className="flex gap-1">
                <button onClick={() => setMonthOffset((m) => m - 1)} className="rounded-md border border-border px-2 py-1 text-xs hover:bg-background">‹</button>
                <button onClick={() => setMonthOffset((m) => m + 1)} className="rounded-md border border-border px-2 py-1 text-xs hover:bg-background">›</button>
              </div>
            }
          />
          <div className="p-4">
            <div className="grid grid-cols-7 gap-1.5 text-center text-xs text-muted">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => <div key={d}>{d}</div>)}
            </div>
            <div className="mt-1.5 grid grid-cols-7 gap-1.5">
              {calendarCells.map((date, i) => {
                if (!date) return <div key={i} />;
                const rec = records.find((r) => r.date === date);
                return (
                  <div
                    key={date}
                    className={`flex aspect-square items-center justify-center rounded-lg text-xs font-medium ${rec ? STATUS_COLORS[rec.status] : "bg-background text-muted"}`}
                    title={rec?.status ?? "No record"}
                  >
                    {Number(date.slice(-2))}
                  </div>
                );
              })}
            </div>
          </div>
        </Card>
      )}

      <Card>
        <CardHeader title="Attendance Trend (Last 7 Recorded Days)" />
        <div className="p-4">{trendData.length === 0 ? <EmptyState label="No attendance recorded yet." /> : <AttendanceChart data={trendData} />}</div>
      </Card>
    </div>
  );
}
