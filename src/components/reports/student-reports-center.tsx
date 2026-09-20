"use client";

import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { SimpleReportView } from "@/components/reports/simple-report-view";
import {
  buildAdmissionReport,
  buildClassWiseStudentReport,
  buildDemographicReport,
  buildEnrollmentReport,
  buildPromotionReport,
  buildSectionWiseStudentReport,
  buildStudentDirectory,
  buildWithdrawalReport,
  type StudentReportDataset,
} from "@/lib/reports/student-reports";

const REPORTS = [
  { key: "directory", label: "Student Directory" },
  { key: "enrollment", label: "Enrollment" },
  { key: "class_wise", label: "Class-wise" },
  { key: "section_wise", label: "Section-wise" },
  { key: "admission", label: "Admission" },
  { key: "promotion", label: "Promotion" },
  { key: "withdrawal", label: "Withdrawal/Leaving" },
  { key: "demographic", label: "Demographic" },
] as const;

export function StudentReportsCenter({ data }: { data: StudentReportDataset }) {
  const [report, setReport] = useState<(typeof REPORTS)[number]["key"]>("directory");

  const view = useMemo(() => {
    if (report === "directory") {
      return { title: "Student Directory", rows: buildStudentDirectory(data), columns: [
        { key: "admissionNumber", label: "Admission #" }, { key: "name", label: "Name" }, { key: "fatherName", label: "Father's Name" },
        { key: "class", label: "Class" }, { key: "section", label: "Section" }, { key: "rollNumber", label: "Roll #" }, { key: "contact", label: "Contact" }, { key: "status", label: "Status" },
      ] };
    }
    if (report === "enrollment") {
      return { title: "Enrollment Report", rows: buildEnrollmentReport(data), columns: [{ key: "month", label: "Month" }, { key: "newAdmissions", label: "New Admissions" }] };
    }
    if (report === "class_wise") {
      return { title: "Class-wise Student Report", rows: buildClassWiseStudentReport(data), columns: [{ key: "class", label: "Class" }, { key: "studentCount", label: "Students" }] };
    }
    if (report === "section_wise") {
      return { title: "Section-wise Student Report", rows: buildSectionWiseStudentReport(data), columns: [
        { key: "class", label: "Class" }, { key: "section", label: "Section" }, { key: "studentCount", label: "Students" }, { key: "capacity", label: "Capacity" },
      ] };
    }
    if (report === "admission") {
      return { title: "Student Admission Report", rows: buildAdmissionReport(data), columns: [
        { key: "admissionNumber", label: "Admission #" }, { key: "name", label: "Name" }, { key: "admissionDate", label: "Admission Date" }, { key: "class", label: "Class" }, { key: "section", label: "Section" },
      ] };
    }
    if (report === "promotion") {
      return { title: "Student Promotion Report", rows: buildPromotionReport(data), columns: [{ key: "session", label: "Academic Session" }, { key: "studentCount", label: "Students" }] };
    }
    if (report === "withdrawal") {
      return { title: "Student Withdrawal/Leaving Report", rows: buildWithdrawalReport(data), columns: [
        { key: "admissionNumber", label: "Admission #" }, { key: "name", label: "Name" }, { key: "class", label: "Class" }, { key: "section", label: "Section" }, { key: "status", label: "Status" },
      ] };
    }
    const demo = buildDemographicReport(data);
    return { title: "Student Demographic Report — by Gender", rows: demo.byGender, columns: [{ key: "gender", label: "Gender" }, { key: "count", label: "Count" }] };
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
      <SimpleReportView title={view.title} columns={view.columns} rows={view.rows as unknown as Record<string, unknown>[]} filenameBase={`student-${report}`} printHref={`/print/student-report?key=${report}`} />
    </div>
  );
}
