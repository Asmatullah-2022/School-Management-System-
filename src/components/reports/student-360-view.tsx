import Link from "next/link";
import { Printer } from "lucide-react";
import { Card, CardHeader, EmptyState } from "@/components/ui/card";
import type { Student360Report } from "@/lib/reports/student-360";

const money = (n: number) => `PKR ${Math.round(n).toLocaleString()}`;

export function Student360View({ report }: { report: Student360Report }) {
  const { student, className, sectionName, academic, attendance, homework, finance, library, transport, notices, events } = report;

  return (
    <div className="space-y-4">
      <Card className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">{student.full_name}</h2>
            <p className="text-sm text-muted">{className} - {sectionName} · Admission # {student.admission_number}</p>
          </div>
          <Link href={`/print/student-360?studentId=${student.id}`} target="_blank" className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:bg-background">
            <Printer size={13} /> Generate PDF
          </Link>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title="Academic" />
          <div className="p-5 text-sm">
            {academic.latestResult ? (
              <>
                <p className="font-medium">{academic.latestResult.exam.name}</p>
                <p className="text-muted">Percentage: {academic.latestResult.result.percentage}% · Grade: {academic.latestResult.result.grade ?? "—"} · {academic.latestResult.result.is_pass ? "Pass" : "Fail"}</p>
              </>
            ) : (
              <EmptyState label="No published results yet." />
            )}
            {academic.upcomingExams.length > 0 && (
              <p className="mt-3 text-xs text-muted">{academic.upcomingExams.length} upcoming exam(s) scheduled.</p>
            )}
          </div>
        </Card>

        <Card>
          <CardHeader title="Attendance" />
          <div className="grid grid-cols-2 gap-3 p-5 text-sm sm:grid-cols-4">
            <div><p className="text-xs text-muted">Present</p><p className="font-semibold text-success">{attendance.present}</p></div>
            <div><p className="text-xs text-muted">Absent</p><p className="font-semibold text-danger">{attendance.absent}</p></div>
            <div><p className="text-xs text-muted">Late</p><p className="font-semibold text-warning">{attendance.late}</p></div>
            <div><p className="text-xs text-muted">Leave</p><p className="font-semibold">{attendance.leave}</p></div>
            <div className="col-span-2 sm:col-span-4"><p className="text-xs text-muted">Percentage</p><p className="font-semibold">{attendance.percentage}%</p></div>
          </div>
        </Card>

        <Card>
          <CardHeader title="Finance" />
          <div className="grid grid-cols-2 gap-3 p-5 text-sm">
            <div><p className="text-xs text-muted">Total Charged</p><p className="font-semibold">{money(finance.totalCharged)}</p></div>
            <div><p className="text-xs text-muted">Discount</p><p className="font-semibold">{money(finance.totalDiscount)}</p></div>
            <div><p className="text-xs text-muted">Paid</p><p className="font-semibold text-success">{money(finance.totalPaid)}</p></div>
            <div><p className="text-xs text-muted">Outstanding</p><p className={`font-semibold ${finance.totalBalance > 0 ? "text-danger" : "text-success"}`}>{money(finance.totalBalance)}</p></div>
          </div>
        </Card>

        <Card>
          <CardHeader title="Homework" />
          <div className="p-5 text-sm">
            <p>Pending: <span className="font-semibold">{homework.pendingCount}</span></p>
            {homework.pending.length === 0 && <p className="mt-2 text-muted">No pending homework.</p>}
          </div>
        </Card>

        <Card>
          <CardHeader title="Library" />
          <div className="p-5 text-sm">
            <div className="grid grid-cols-3 gap-3">
              <div><p className="text-xs text-muted">Issued</p><p className="font-semibold">{library.issued}</p></div>
              <div><p className="text-xs text-muted">Returned</p><p className="font-semibold">{library.returned}</p></div>
              <div><p className="text-xs text-muted">Fines</p><p className="font-semibold">{money(library.totalFines)}</p></div>
            </div>
            {library.currentlyIssued.length > 0 && (
              <ul className="mt-3 space-y-1 text-xs text-muted">
                {library.currentlyIssued.map((i, idx) => (
                  <li key={idx}>{i.book?.title ?? "Unknown book"} — due {new Date(i.dueDate).toLocaleDateString()}{i.daysOverdue > 0 ? ` (${i.daysOverdue}d overdue)` : ""}</li>
                ))}
              </ul>
            )}
          </div>
        </Card>

        <Card>
          <CardHeader title="Transport" />
          <div className="p-5 text-sm">
            {transport ? (
              <div className="space-y-1">
                <p>Route: <span className="font-medium">{transport.route?.name ?? "—"}</span></p>
                <p>Vehicle: <span className="font-medium">{transport.vehicle?.vehicle_number ?? "—"}</span></p>
                <p>Stop: <span className="font-medium">{transport.stop?.stop_name ?? "—"}</span></p>
              </div>
            ) : (
              <EmptyState label="Not assigned to school transport." />
            )}
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader title="Relevant Notices & Events" />
        {notices.length === 0 && events.length === 0 ? (
          <EmptyState label="Nothing to show." />
        ) : (
          <ul className="divide-y divide-border">
            {notices.map((n) => <li key={n.id} className="px-5 py-2.5 text-sm">📢 {n.title}</li>)}
            {events.map((e) => <li key={e.id} className="px-5 py-2.5 text-sm">📅 {e.title} — {new Date(e.start_date).toLocaleDateString()}</li>)}
          </ul>
        )}
      </Card>
    </div>
  );
}
