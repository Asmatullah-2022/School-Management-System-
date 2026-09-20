"use client";

import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { SimpleReportView } from "@/components/reports/simple-report-view";
import { buildTeacherDirectory, buildTeacherWorkloadReport, type TeacherReportDataset } from "@/lib/reports/teacher-reports";

const REPORTS = [
  { key: "directory", label: "Teacher Directory" },
  { key: "workload", label: "Teacher Workload" },
] as const;

export function TeacherReportsCenter({ data }: { data: TeacherReportDataset }) {
  const [report, setReport] = useState<(typeof REPORTS)[number]["key"]>("directory");

  const view = useMemo(() => {
    if (report === "directory") {
      return { title: "Teacher Directory", rows: buildTeacherDirectory(data), columns: [
        { key: "employeeId", label: "Employee ID" }, { key: "name", label: "Name" }, { key: "designation", label: "Designation" },
        { key: "qualification", label: "Qualification" }, { key: "mobile", label: "Mobile" }, { key: "status", label: "Status" },
      ] };
    }
    return { title: "Teacher Workload Report", rows: buildTeacherWorkloadReport(data), columns: [
      { key: "name", label: "Teacher" }, { key: "classesAssigned", label: "Classes" }, { key: "subjectsAssigned", label: "Subjects" }, { key: "subjects", label: "Subject Names" },
    ] };
  }, [report, data]);

  return (
    <div className="space-y-4">
      <Card className="flex flex-wrap gap-2 p-3">
        {REPORTS.map((r) => (
          <button key={r.key} onClick={() => setReport(r.key)} className={`rounded-lg px-3 py-1.5 text-sm font-medium ${report === r.key ? "bg-primary text-primary-foreground" : "hover:bg-background"}`}>
            {r.label}
          </button>
        ))}
      </Card>
      <SimpleReportView title={view.title} columns={view.columns} rows={view.rows as unknown as Record<string, unknown>[]} filenameBase={`teacher-${report}`} printHref={`/print/teacher-report?key=${report}`} />
    </div>
  );
}
