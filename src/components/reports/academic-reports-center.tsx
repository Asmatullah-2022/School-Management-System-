"use client";

import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { SimpleReportView } from "@/components/reports/simple-report-view";
import {
  buildClassResultReport,
  buildExamResultReport,
  buildFailedStudentsReport,
  buildGradeDistribution,
  buildPerformanceAnalysis,
  buildStudentPerformanceHistory,
  buildSubjectResultReport,
  type AcademicReportDataset,
} from "@/lib/reports/academic-reports";
import type { SchoolClass, Student } from "@/types/database";

const REPORTS = [
  { key: "exam_result", label: "Examination Result" },
  { key: "class_result", label: "Class Result" },
  { key: "subject_result", label: "Subject Result" },
  { key: "grade_distribution", label: "Grade Distribution" },
  { key: "performance_history", label: "Student Performance History" },
  { key: "failed", label: "Failed Students" },
  { key: "analysis", label: "High/Low Performance" },
] as const;

export function AcademicReportsCenter({ data, classes, students }: { data: AcademicReportDataset; classes: SchoolClass[]; students: Student[] }) {
  const [report, setReport] = useState<(typeof REPORTS)[number]["key"]>("exam_result");
  const [examId, setExamId] = useState(data.exams[0]?.id ?? "");
  const [classId, setClassId] = useState(classes[0]?.id ?? "");
  const [examSubjectId, setExamSubjectId] = useState(data.examSubjects[0]?.id ?? "");
  const [studentId, setStudentId] = useState(students[0]?.id ?? "");

  const printParams = new URLSearchParams({ key: report, examId, classId, examSubjectId, studentId }).toString();

  const view = useMemo(() => {
    if (report === "exam_result") {
      return { title: "Examination Result Report", rows: buildExamResultReport(data, examId), columns: [
        { key: "student", label: "Student" }, { key: "class", label: "Class" }, { key: "obtained", label: "Obtained" }, { key: "total", label: "Total" },
        { key: "percentage", label: "%" }, { key: "grade", label: "Grade" }, { key: "result", label: "Result" }, { key: "rank", label: "Rank" },
      ] };
    }
    if (report === "class_result") {
      return { title: "Class Result", rows: buildClassResultReport(data, examId, classId), columns: [
        { key: "student", label: "Student" }, { key: "obtained", label: "Obtained" }, { key: "total", label: "Total" }, { key: "percentage", label: "%" }, { key: "grade", label: "Grade" }, { key: "result", label: "Result" },
      ] };
    }
    if (report === "subject_result") {
      return { title: "Subject Result", rows: buildSubjectResultReport(data, examSubjectId), columns: [{ key: "student", label: "Student" }, { key: "obtainedMarks", label: "Marks Obtained" }] };
    }
    if (report === "grade_distribution") {
      return { title: "Grade Distribution", rows: buildGradeDistribution(data, examId), columns: [{ key: "grade", label: "Grade" }, { key: "count", label: "Students" }] };
    }
    if (report === "performance_history") {
      return { title: "Student Performance History", rows: buildStudentPerformanceHistory(data, studentId), columns: [
        { key: "exam", label: "Exam" }, { key: "percentage", label: "%" }, { key: "grade", label: "Grade" }, { key: "result", label: "Result" },
      ] };
    }
    if (report === "failed") {
      return { title: "Failed Students", rows: buildFailedStudentsReport(data, examId), columns: [
        { key: "student", label: "Student" }, { key: "class", label: "Class" }, { key: "percentage", label: "%" },
      ] };
    }
    const analysis = buildPerformanceAnalysis(data, examId);
    return { title: "High Performers", rows: analysis.highest, columns: [{ key: "student", label: "Student" }, { key: "percentage", label: "%" }] };
  }, [report, data, examId, classId, examSubjectId, studentId]);

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
        {(report === "exam_result" || report === "class_result" || report === "grade_distribution" || report === "failed" || report === "analysis") && (
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-muted">Exam</span>
            <select value={examId} onChange={(e) => setExamId(e.target.value)} className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm outline-none focus:border-primary">
              {data.exams.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
            </select>
          </label>
        )}
        {report === "class_result" && (
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-muted">Class</span>
            <select value={classId} onChange={(e) => setClassId(e.target.value)} className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm outline-none focus:border-primary">
              {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </label>
        )}
        {report === "subject_result" && (
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-muted">Exam Subject</span>
            <select value={examSubjectId} onChange={(e) => setExamSubjectId(e.target.value)} className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm outline-none focus:border-primary">
              {data.examSubjects.map((es) => (
                <option key={es.id} value={es.id}>
                  {data.exams.find((e) => e.id === es.exam_id)?.name} · {data.subjects.find((s) => s.id === es.subject_id)?.name}
                </option>
              ))}
            </select>
          </label>
        )}
        {report === "performance_history" && (
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-muted">Student</span>
            <select value={studentId} onChange={(e) => setStudentId(e.target.value)} className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm outline-none focus:border-primary">
              {students.map((s) => <option key={s.id} value={s.id}>{s.full_name}</option>)}
            </select>
          </label>
        )}
      </Card>

      <SimpleReportView title={view.title} columns={view.columns} rows={view.rows as unknown as Record<string, unknown>[]} filenameBase={`academic-${report}`} printHref={`/print/academic-report?${printParams}`} />
    </div>
  );
}
