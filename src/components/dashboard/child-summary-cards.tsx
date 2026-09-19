"use client";

import { useState } from "react";
import Link from "next/link";
import {
  CalendarClock,
  CheckCircle2,
  ClipboardCheck,
  FileText,
  NotebookPen,
  Wallet,
} from "lucide-react";
import { StatCard } from "@/components/dashboard/stat-card";
import { Card, CardHeader, EmptyState } from "@/components/ui/card";
import type { ChildSummary } from "@/lib/dashboard/child-summary";
import type { NoticeRecord } from "@/types/database";

const ATTENDANCE_TONE: Record<string, "success" | "danger" | "warning" | "primary"> = {
  present: "success",
  absent: "danger",
  late: "warning",
  leave: "warning",
};

export function ChildSummaryCards({
  summaries,
  notices,
  showChildHeader = true,
}: {
  summaries: ChildSummary[];
  notices: NoticeRecord[];
  showChildHeader?: boolean;
}) {
  const [selectedId, setSelectedId] = useState(summaries[0]?.student.id);
  const active = summaries.find((s) => s.student.id === selectedId) ?? summaries[0];

  if (!active) {
    return (
      <Card>
        <EmptyState label="No children are linked to your account yet. Please contact the school office." />
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {summaries.length > 1 && (
        <div>
          <p className="mb-2 text-sm font-medium">My Children</p>
          <div className="flex flex-wrap gap-2">
            {summaries.map((s) => (
              <button
                key={s.student.id}
                onClick={() => setSelectedId(s.student.id)}
                className={`rounded-full px-3.5 py-2 text-sm font-medium transition ${
                  active.student.id === s.student.id ? "bg-primary text-primary-foreground" : "border border-border text-muted hover:bg-background"
                }`}
              >
                {s.student.full_name} — {s.className}
              </button>
            ))}
          </div>
        </div>
      )}

      {showChildHeader && (
        <div>
          <h2 className="text-lg font-semibold">{active.student.full_name}</h2>
          <p className="text-sm text-muted">{active.className} - Section {active.sectionName}</p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        <StatCard
          label="Today's Attendance"
          value={active.todayAttendanceStatus ? active.todayAttendanceStatus[0].toUpperCase() + active.todayAttendanceStatus.slice(1) : "Not marked"}
          icon={ClipboardCheck}
          tone={active.todayAttendanceStatus ? ATTENDANCE_TONE[active.todayAttendanceStatus] : "primary"}
        />
        <StatCard label="Attendance %" value={`${active.attendancePercentage}%`} icon={CheckCircle2} tone={active.attendancePercentage >= 75 ? "success" : "warning"} />
        <StatCard label="Pending Homework" value={active.pendingHomeworkCount} icon={NotebookPen} tone={active.pendingHomeworkCount > 0 ? "warning" : "success"} />
        <StatCard
          label="Outstanding Fees"
          value={`PKR ${active.outstandingBalance.toLocaleString()}`}
          icon={Wallet}
          tone={active.outstandingBalance > 0 ? "danger" : "success"}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title="Today's Timetable" action={<Link href="/timetable" className="text-xs font-medium text-primary hover:underline">Full timetable</Link>} />
          {active.todaySchedule.length === 0 ? (
            <EmptyState label="No classes scheduled for today." />
          ) : (
            <ul className="divide-y divide-border">
              {active.todaySchedule.map(({ entry, period, subjectName, teacherName }) => (
                <li key={entry.id} className="flex items-center justify-between px-5 py-2.5 text-sm">
                  <span className="flex items-center gap-2"><CalendarClock size={14} className="text-muted" /> {subjectName} <span className="text-xs text-muted">· {teacherName}</span></span>
                  <span className="text-muted">{period?.start_time ?? "—"}</span>
                </li>
              ))}
            </ul>
          )}
          {active.nextClass && (
            <p className="border-t border-border px-5 py-3 text-xs text-muted">
              Next class starts at <span className="font-medium text-foreground">{active.nextClass.period.start_time}</span>
            </p>
          )}
        </Card>

        <Card>
          <CardHeader title="Latest Result" action={<Link href="/results" className="text-xs font-medium text-primary hover:underline">All results</Link>} />
          {!active.latestResult ? (
            <EmptyState label="No published results yet." />
          ) : (
            <div className="p-5 text-sm">
              <p className="font-medium">{active.latestResult.exam.name}</p>
              <div className="mt-2 grid grid-cols-3 gap-2 text-center">
                <div><p className="text-xs text-muted">%</p><p className="font-semibold">{active.latestResult.result.percentage}%</p></div>
                <div><p className="text-xs text-muted">Grade</p><p className="font-semibold">{active.latestResult.result.grade}</p></div>
                <div><p className="text-xs text-muted">Result</p><p className={`font-semibold ${active.latestResult.result.is_pass ? "text-success" : "text-danger"}`}>{active.latestResult.result.is_pass ? "Pass" : "Fail"}</p></div>
              </div>
            </div>
          )}
        </Card>

        <Card>
          <CardHeader title="Pending Homework" action={<Link href="/homework" className="text-xs font-medium text-primary hover:underline">View all</Link>} />
          {active.pendingHomework.length === 0 ? (
            <EmptyState label="No homework assigned." />
          ) : (
            <ul className="divide-y divide-border">
              {active.pendingHomework.map(({ homework, submission }) => (
                <li key={homework.id} className="px-5 py-2.5 text-sm">
                  <p className="font-medium">{homework.title}</p>
                  <p className="text-xs text-muted">Due {new Date(homework.due_date).toLocaleDateString()} · {submission?.status ?? "pending"}</p>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <CardHeader title="Upcoming Exams" action={<Link href="/exams" className="text-xs font-medium text-primary hover:underline">View schedule</Link>} />
          {active.upcomingExams.length === 0 ? (
            <EmptyState label="No upcoming exams." />
          ) : (
            <ul className="divide-y divide-border">
              {active.upcomingExams.map(({ exam, examSubject, subjectName }) => (
                <li key={examSubject.id} className="flex items-center justify-between px-5 py-2.5 text-sm">
                  <span className="flex items-center gap-2"><FileText size={14} className="text-muted" /> {exam.name} <span className="text-xs text-muted">· {subjectName}</span></span>
                  <span className="text-muted">{examSubject.exam_date ? new Date(examSubject.exam_date).toLocaleDateString() : "—"}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <Card>
        <CardHeader title="Latest Notices" action={<Link href="/notices" className="text-xs font-medium text-primary hover:underline">View all</Link>} />
        {notices.length === 0 ? (
          <EmptyState label="No notices yet." />
        ) : (
          <ul className="divide-y divide-border">
            {notices.slice(0, 5).map((n) => (
              <li key={n.id} className="px-5 py-3">
                <p className="text-sm font-medium">{n.title}</p>
                <p className="mt-0.5 line-clamp-2 text-xs text-muted">{n.description}</p>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
