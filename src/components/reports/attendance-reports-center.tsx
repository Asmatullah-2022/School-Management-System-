"use client";

import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { SimpleReportView } from "@/components/reports/simple-report-view";
import {
  buildAbsenteeReport,
  buildClassAttendanceReport,
  buildDailyAttendanceReport,
  buildLowAttendanceReport,
  buildMonthlyAttendanceReport,
  buildStudentAttendanceHistory,
  type AttendanceReportDataset,
} from "@/lib/reports/attendance-reports";
import type { Student } from "@/types/database";

const REPORTS = [
  { key: "daily", label: "Daily Attendance" },
  { key: "monthly", label: "Monthly Attendance" },
  { key: "student", label: "Student History" },
  { key: "class", label: "Class Attendance" },
  { key: "low", label: "Low Attendance" },
  { key: "absentee", label: "Absentee Report" },
] as const;

export function AttendanceReportsCenter({ data, students }: { data: AttendanceReportDataset; students: Student[] }) {
  const [report, setReport] = useState<(typeof REPORTS)[number]["key"]>("daily");
  const today = new Date();
  const [date, setDate] = useState(today.toISOString().slice(0, 10));
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [year, setYear] = useState(today.getFullYear());
  const [studentId, setStudentId] = useState(students[0]?.id ?? "");
  const [threshold, setThreshold] = useState(75);

  const printParams = new URLSearchParams({ key: report, date, month: String(month), year: String(year), studentId, threshold: String(threshold) }).toString();

  const view = useMemo(() => {
    if (report === "daily") {
      return { title: "Daily Attendance", rows: buildDailyAttendanceReport(data, date), columns: [
        { key: "student", label: "Student" }, { key: "class", label: "Class" }, { key: "section", label: "Section" }, { key: "status", label: "Status" },
      ] };
    }
    if (report === "monthly") {
      return { title: "Monthly Attendance", rows: buildMonthlyAttendanceReport(data, month, year), columns: [
        { key: "student", label: "Student" }, { key: "present", label: "Present" }, { key: "absent", label: "Absent" }, { key: "late", label: "Late" }, { key: "leave", label: "Leave" }, { key: "percentage", label: "%" },
      ] };
    }
    if (report === "student") {
      return { title: "Student Attendance History", rows: buildStudentAttendanceHistory(data, studentId), columns: [
        { key: "date", label: "Date" }, { key: "status", label: "Status" }, { key: "remarks", label: "Remarks" },
      ] };
    }
    if (report === "class") {
      return { title: "Class Attendance", rows: buildClassAttendanceReport(data, date), columns: [
        { key: "class", label: "Class" }, { key: "present", label: "Present" }, { key: "absent", label: "Absent" }, { key: "late", label: "Late" }, { key: "leave", label: "Leave" }, { key: "total", label: "Total Students" },
      ] };
    }
    if (report === "low") {
      return { title: "Low Attendance Report", rows: buildLowAttendanceReport(data, threshold), columns: [
        { key: "student", label: "Student" }, { key: "class", label: "Class" }, { key: "totalDays", label: "Days Recorded" }, { key: "percentage", label: "%" },
      ] };
    }
    return { title: "Absentee Report", rows: buildAbsenteeReport(data, date), columns: [
      { key: "student", label: "Student" }, { key: "class", label: "Class" }, { key: "contact", label: "Contact" },
    ] };
  }, [report, data, date, month, year, studentId, threshold]);

  return (
    <div className="space-y-4">
      <Card className="flex flex-wrap gap-2 p-3">
        {REPORTS.map((r) => (
          <button key={r.key} onClick={() => setReport(r.key)} className={`rounded-lg px-3 py-1.5 text-sm font-medium ${report === r.key ? "bg-primary text-primary-foreground" : "hover:bg-background"}`}>
            {r.label}
          </button>
        ))}
      </Card>

      <Card className="flex flex-wrap items-end gap-3 p-4">
        {(report === "daily" || report === "class" || report === "absentee") && (
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-muted">Date</span>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm outline-none focus:border-primary" />
          </label>
        )}
        {report === "monthly" && (
          <>
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-muted">Month</span>
              <input type="number" min={1} max={12} value={month} onChange={(e) => setMonth(Number(e.target.value))} className="w-20 rounded-lg border border-border bg-background px-3 py-1.5 text-sm outline-none focus:border-primary" />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-muted">Year</span>
              <input type="number" value={year} onChange={(e) => setYear(Number(e.target.value))} className="w-24 rounded-lg border border-border bg-background px-3 py-1.5 text-sm outline-none focus:border-primary" />
            </label>
          </>
        )}
        {report === "student" && (
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-muted">Student</span>
            <select value={studentId} onChange={(e) => setStudentId(e.target.value)} className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm outline-none focus:border-primary">
              {students.map((s) => <option key={s.id} value={s.id}>{s.full_name}</option>)}
            </select>
          </label>
        )}
        {report === "low" && (
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-muted">Below Threshold (%)</span>
            <input type="number" min={0} max={100} value={threshold} onChange={(e) => setThreshold(Number(e.target.value))} className="w-24 rounded-lg border border-border bg-background px-3 py-1.5 text-sm outline-none focus:border-primary" />
          </label>
        )}
      </Card>

      <SimpleReportView title={view.title} columns={view.columns} rows={view.rows as unknown as Record<string, unknown>[]} filenameBase={`attendance-${report}`} printHref={`/print/attendance-report?${printParams}`} />
    </div>
  );
}
