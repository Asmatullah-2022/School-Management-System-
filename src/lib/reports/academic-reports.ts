// Academic reports — all built from already-stored `Result`/`Mark` rows
// (computed once, at publish time, by Phase 4's grading engine). Nothing
// here recalculates a percentage, grade, or pass/fail status; it only
// filters and aggregates what `computeStudentResult` already produced.
import type { Exam, ExamSubject, Mark, Result, SchoolClass, Section, Student, Subject } from "@/types/database";

export interface AcademicReportDataset {
  exams: Exam[];
  examSubjects: ExamSubject[];
  marks: Mark[];
  results: Result[];
  students: Student[];
  classes: SchoolClass[];
  sections: Section[];
  subjects: Subject[];
}

const studentName = (id: string, students: Student[]) => students.find((s) => s.id === id)?.full_name ?? "Unknown student";
const classNameOf = (id: string | null | undefined, classes: SchoolClass[]) => classes.find((c) => c.id === id)?.name ?? "—";

export function buildExamResultReport(data: AcademicReportDataset, examId: string) {
  return data.results
    .filter((r) => r.exam_id === examId)
    .sort((a, b) => b.percentage - a.percentage)
    .map((r) => {
      const student = data.students.find((s) => s.id === r.student_id);
      return {
        student: studentName(r.student_id, data.students),
        class: classNameOf(student?.class_id, data.classes),
        obtained: r.total_obtained,
        total: r.total_marks,
        percentage: r.percentage,
        grade: r.grade ?? "—",
        result: r.is_pass ? "Pass" : "Fail",
        rank: r.class_rank ?? "—",
      };
    });
}

export function buildClassResultReport(data: AcademicReportDataset, examId: string, classId: string) {
  const classStudentIds = new Set(data.students.filter((s) => s.class_id === classId).map((s) => s.id));
  return buildExamResultReport(data, examId).filter((row) => {
    const student = data.students.find((s) => s.full_name === row.student);
    return student && classStudentIds.has(student.id);
  });
}

export function buildSubjectResultReport(data: AcademicReportDataset, examSubjectId: string) {
  return data.marks
    .filter((m) => m.exam_subject_id === examSubjectId && m.status === "published")
    .map((m) => ({
      student: studentName(m.student_id, data.students),
      obtainedMarks: m.obtained_marks,
    }))
    .sort((a, b) => b.obtainedMarks - a.obtainedMarks);
}

export function buildGradeDistribution(data: AcademicReportDataset, examId: string) {
  const results = data.results.filter((r) => r.exam_id === examId);
  const byGrade = new Map<string, number>();
  for (const r of results) {
    const grade = r.grade ?? "Ungraded";
    byGrade.set(grade, (byGrade.get(grade) ?? 0) + 1);
  }
  return Array.from(byGrade.entries()).map(([grade, count]) => ({ grade, count }));
}

export function buildStudentPerformanceHistory(data: AcademicReportDataset, studentId: string) {
  return data.results
    .filter((r) => r.student_id === studentId)
    .map((r) => ({
      exam: data.exams.find((e) => e.id === r.exam_id)?.name ?? "Unknown exam",
      percentage: r.percentage,
      grade: r.grade ?? "—",
      result: r.is_pass ? "Pass" : "Fail",
    }))
    .sort((a, b) => (a.exam < b.exam ? -1 : 1));
}

export function buildFailedStudentsReport(data: AcademicReportDataset, examId: string) {
  return data.results
    .filter((r) => r.exam_id === examId && !r.is_pass)
    .map((r) => {
      const student = data.students.find((s) => s.id === r.student_id);
      return {
        student: studentName(r.student_id, data.students),
        class: classNameOf(student?.class_id, data.classes),
        percentage: r.percentage,
        failedSubjects: r.passed_subjects != null ? "See marks" : "—",
      };
    });
}

export function buildPerformanceAnalysis(data: AcademicReportDataset, examId: string) {
  const results = [...data.results.filter((r) => r.exam_id === examId)].sort((a, b) => b.percentage - a.percentage);
  return {
    highest: results.slice(0, 5).map((r) => ({ student: studentName(r.student_id, data.students), percentage: r.percentage })),
    lowest: results.slice(-5).reverse().map((r) => ({ student: studentName(r.student_id, data.students), percentage: r.percentage })),
    average: results.length ? Math.round(results.reduce((s, r) => s + r.percentage, 0) / results.length) : 0,
  };
}
