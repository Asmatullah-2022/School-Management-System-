"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { Printer } from "lucide-react";
import { Card, CardHeader, EmptyState } from "@/components/ui/card";
import type { SchoolClass, Section } from "@/types/database";
import type { buildClass360 } from "@/lib/reports/class-360";

const money = (n: number) => `PKR ${Math.round(n).toLocaleString()}`;

export function Class360Selector({
  classes,
  sections,
  classId,
  sectionId,
  report,
}: {
  classes: SchoolClass[];
  sections: Section[];
  classId: string;
  sectionId: string | null;
  report: ReturnType<typeof buildClass360> | undefined;
}) {
  const router = useRouter();
  const availableSections = sections.filter((s) => s.class_id === classId);

  const navigate = (nextClassId: string, nextSectionId: string | null) => {
    const params = new URLSearchParams({ classId: nextClassId });
    if (nextSectionId) params.set("sectionId", nextSectionId);
    router.push(`/reports/class-360?${params.toString()}`);
  };

  return (
    <div className="space-y-4">
      <Card className="flex flex-wrap items-end gap-3 p-4">
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-muted">Class</span>
          <select value={classId} onChange={(e) => navigate(e.target.value, null)} className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm outline-none focus:border-primary">
            {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-muted">Section</span>
          <select value={sectionId ?? ""} onChange={(e) => navigate(classId, e.target.value || null)} className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm outline-none focus:border-primary">
            <option value="">All sections</option>
            {availableSections.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </label>
        <Link href={`/print/class-360?classId=${classId}${sectionId ? `&sectionId=${sectionId}` : ""}`} target="_blank" className="ml-auto inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:bg-background">
          <Printer size={13} /> Generate PDF
        </Link>
      </Card>

      {!report ? (
        <Card><EmptyState label="No class selected." /></Card>
      ) : (
        <div className="space-y-4">
          <Card className="p-5">
            <h2 className="text-lg font-semibold">{report.className}{report.sectionName ? ` - ${report.sectionName}` : ""}</h2>
            <p className="text-sm text-muted">{report.studentCount} students</p>
          </Card>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader title="Attendance" />
              <div className="grid grid-cols-2 gap-3 p-5 text-sm sm:grid-cols-4">
                <div><p className="text-xs text-muted">Present</p><p className="font-semibold text-success">{report.attendance.present}</p></div>
                <div><p className="text-xs text-muted">Absent</p><p className="font-semibold text-danger">{report.attendance.absent}</p></div>
                <div><p className="text-xs text-muted">Late</p><p className="font-semibold text-warning">{report.attendance.late}</p></div>
                <div><p className="text-xs text-muted">Leave</p><p className="font-semibold">{report.attendance.leave}</p></div>
                <div className="col-span-2 sm:col-span-4"><p className="text-xs text-muted">Percentage</p><p className="font-semibold">{report.attendance.percentage}%</p></div>
              </div>
            </Card>

            <Card>
              <CardHeader title="Academic Performance" />
              <div className="grid grid-cols-2 gap-3 p-5 text-sm">
                <div><p className="text-xs text-muted">Average %</p><p className="font-semibold">{report.academic.averagePercentage}%</p></div>
                <div><p className="text-xs text-muted">Pass Rate</p><p className="font-semibold">{report.academic.passRate}%</p></div>
                <div><p className="text-xs text-muted">Passed</p><p className="font-semibold text-success">{report.academic.passCount}</p></div>
                <div><p className="text-xs text-muted">Failed</p><p className="font-semibold text-danger">{report.academic.failCount}</p></div>
              </div>
            </Card>

            <Card>
              <CardHeader title="Fees Summary" />
              <div className="grid grid-cols-3 gap-3 p-5 text-sm">
                <div><p className="text-xs text-muted">Expected</p><p className="font-semibold">{money(report.fees.expected)}</p></div>
                <div><p className="text-xs text-muted">Collected</p><p className="font-semibold text-success">{money(report.fees.collected)}</p></div>
                <div><p className="text-xs text-muted">Outstanding</p><p className="font-semibold text-danger">{money(report.fees.outstanding)}</p></div>
              </div>
            </Card>

            <Card>
              <CardHeader title="Homework Completion" />
              <div className="p-5 text-sm">
                <p>Assigned: <span className="font-semibold">{report.homework.assignedCount}</span></p>
                <p>Completion Rate: <span className="font-semibold">{report.homework.completionRate}%</span></p>
              </div>
            </Card>

            <Card>
              <CardHeader title="Library Summary" />
              <div className="p-5 text-sm">
                <p>Currently Issued: <span className="font-semibold">{report.library.currentlyIssued}</span></p>
                <p>Overdue: <span className="font-semibold text-danger">{report.library.overdue}</span></p>
              </div>
            </Card>

            <Card>
              <CardHeader title="Transport Summary" />
              <div className="p-5 text-sm">
                <p>Assigned to Transport: <span className="font-semibold">{report.transport.assignedCount}</span></p>
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
