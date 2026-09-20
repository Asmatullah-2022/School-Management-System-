import { redirect } from "next/navigation";
import { getSession, isSchoolStaff } from "@/lib/auth/session";
import { listExams } from "@/lib/data/exams";
import { listExamSubjects } from "@/lib/data/exam-schedule";
import { listMarks } from "@/lib/data/marks";
import { listResults } from "@/lib/data/results";
import { listStudents } from "@/lib/data/students";
import { listClasses, listSections } from "@/lib/data/academics";
import { listSubjects } from "@/lib/data/subjects";
import { PrintButton } from "@/components/timetable/print-button";
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

const TITLES: Record<string, string> = {
  exam_result: "Examination Result Report", class_result: "Class Result", subject_result: "Subject Result",
  grade_distribution: "Grade Distribution", performance_history: "Student Performance History",
  failed: "Failed Students", analysis: "High/Low Performance Analysis",
};

function Table({ headers, rows }: { headers: string[]; rows: (string | number)[][] }) {
  return (
    <table className="w-full border-collapse text-sm">
      <thead><tr>{headers.map((h) => <th key={h} className="border border-border px-2 py-1.5 text-left">{h}</th>)}</tr></thead>
      <tbody>{rows.map((r, i) => <tr key={i}>{r.map((c, j) => <td key={j} className="border border-border px-2 py-1.5">{c}</td>)}</tr>)}</tbody>
    </table>
  );
}

export default async function PrintAcademicReportPage({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!isSchoolStaff(session.profile.role)) redirect("/dashboard");

  const params = await searchParams;
  const key = params.key ?? "exam_result";
  const [exams, examSubjects, marks, results, students, classes, sections, subjects] = await Promise.all([
    listExams(), listExamSubjects(), listMarks(), listResults(), listStudents(), listClasses(), listSections(), listSubjects(),
  ]);
  const data: AcademicReportDataset = { exams, examSubjects, marks, results, students, classes, sections, subjects };

  let body: React.ReactNode = null;
  if (key === "exam_result") {
    const rows = buildExamResultReport(data, params.examId ?? "");
    body = <Table headers={["Student", "Class", "Obtained", "Total", "%", "Grade", "Result", "Rank"]} rows={rows.map((r) => [r.student, r.class, r.obtained, r.total, r.percentage, r.grade, r.result, r.rank])} />;
  } else if (key === "class_result") {
    const rows = buildClassResultReport(data, params.examId ?? "", params.classId ?? "");
    body = <Table headers={["Student", "Obtained", "Total", "%", "Grade", "Result"]} rows={rows.map((r) => [r.student, r.obtained, r.total, r.percentage, r.grade, r.result])} />;
  } else if (key === "subject_result") {
    const rows = buildSubjectResultReport(data, params.examSubjectId ?? "");
    body = <Table headers={["Student", "Marks Obtained"]} rows={rows.map((r) => [r.student, r.obtainedMarks])} />;
  } else if (key === "grade_distribution") {
    const rows = buildGradeDistribution(data, params.examId ?? "");
    body = <Table headers={["Grade", "Students"]} rows={rows.map((r) => [r.grade, r.count])} />;
  } else if (key === "performance_history") {
    const rows = buildStudentPerformanceHistory(data, params.studentId ?? "");
    body = <Table headers={["Exam", "%", "Grade", "Result"]} rows={rows.map((r) => [r.exam, r.percentage, r.grade, r.result])} />;
  } else if (key === "failed") {
    const rows = buildFailedStudentsReport(data, params.examId ?? "");
    body = <Table headers={["Student", "Class", "%"]} rows={rows.map((r) => [r.student, r.class, r.percentage])} />;
  } else {
    const a = buildPerformanceAnalysis(data, params.examId ?? "");
    body = (
      <>
        <p className="mb-1 text-sm font-medium">Highest Performers</p>
        <Table headers={["Student", "%"]} rows={a.highest.map((r) => [r.student, r.percentage])} />
        <p className="mb-1 mt-4 text-sm font-medium">Lowest Performers</p>
        <Table headers={["Student", "%"]} rows={a.lowest.map((r) => [r.student, r.percentage])} />
        <p className="mt-3 text-sm">Average: {a.average}%</p>
      </>
    );
  }

  return (
    <div className="mx-auto max-w-4xl p-6 print:p-0">
      <div className="mb-4 flex items-center justify-between print:hidden">
        <p className="text-sm text-muted">Print preview</p>
        <PrintButton />
      </div>
      <header className="mb-6 border-b-2 border-border pb-4 text-center">
        <h1 className="text-lg font-bold uppercase tracking-wide">{session.school.name}</h1>
        <p className="mt-2 text-base font-semibold">{TITLES[key] ?? "Academic Report"}</p>
      </header>
      {body}
      <p className="mt-10 text-center text-xs text-muted">Generated by {session.profile.full_name} on {new Date().toLocaleString()} — {session.school.name}</p>
    </div>
  );
}
