import "server-only";
import { isDemoMode } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import { demoStore } from "@/lib/demo/store";
import { computeStudentResult, gradeFor, rankByPercentage } from "@/lib/results/calculate";
import { listMarks } from "@/lib/data/marks";
import type { Result } from "@/types/database";

export async function listResults(): Promise<Result[]> {
  if (isDemoMode()) return demoStore.listResults();

  const supabase = await createClient();
  const { data, error } = await supabase.from("results").select("*");
  if (error) throw error;
  return data as Result[];
}

/** Computes every enrolled result for an exam from its marks and grading
 * scale, and upserts the `results` table. Callable any time after marks
 * are verified (a "Calculate Results" review step), and always re-run at
 * publish time so the final numbers reflect the published marks. */
export async function computeAndStoreResultsForExam(examId: string): Promise<Result[]> {
  if (isDemoMode()) return demoStore.computeResultsForExam(examId);

  const supabase = await createClient();
  const { data: examSubjects } = await supabase.from("exam_subjects").select("id, total_marks, passing_marks").eq("exam_id", examId);
  const subjectById = new Map((examSubjects ?? []).map((es) => [es.id, es]));
  const examSubjectIds = Array.from(subjectById.keys());
  if (examSubjectIds.length === 0) return [];

  const { data: marks } = await supabase.from("marks").select("*").in("exam_subject_id", examSubjectIds);
  const { data: school } = await supabase
    .from("schools")
    .select("grading_system, id")
    .limit(1)
    .single();
  const bands = school?.grading_system ?? [];

  const studentIds = Array.from(new Set((marks ?? []).map((m) => m.student_id as string)));
  const computed = studentIds.map((studentId) => {
    const subjectMarks = (marks ?? [])
      .filter((m) => m.student_id === studentId)
      .map((m) => {
        const es = subjectById.get(m.exam_subject_id)!;
        return { obtained: m.obtained_marks as number, total: es.total_marks as number, passing: es.passing_marks as number };
      });
    return { student_id: studentId, ...computeStudentResult(subjectMarks, bands) };
  });
  const ranks = rankByPercentage(computed);

  const rows = computed.map((c) => ({
    school_id: school?.id,
    exam_id: examId,
    student_id: c.student_id,
    total_obtained: c.total_obtained,
    total_marks: c.total_marks,
    percentage: c.percentage,
    grade: c.grade,
    is_pass: c.is_pass,
    passed_subjects: c.passed_subjects,
    failed_subjects: c.failed_subjects,
    class_rank: ranks.get(c.student_id) ?? null,
  }));

  const { data, error } = await supabase.from("results").upsert(rows, { onConflict: "exam_id,student_id" }).select();
  if (error) throw error;
  return data as Result[];
}

export interface SubjectAnalytics {
  exam_subject_id: string;
  subject_id: string;
  entries: number;
  highest: number;
  lowest: number;
  average: number;
  pass_count: number;
  fail_count: number;
  pass_percentage: number;
  grade_distribution: Record<string, number>;
}

/** Per-subject statistics for an exam, computed straight from real marks
 * (highest/lowest/average/pass-fail/grade distribution) — item 9 of the
 * Phase 4 spec. */
export async function getSubjectAnalytics(examId: string): Promise<SubjectAnalytics[]> {
  const { listExamSubjects } = await import("@/lib/data/exam-schedule");
  const [examSubjects, marks] = await Promise.all([listExamSubjects(), listMarks()]);
  const school = await getSchoolGradingBands();

  const rows = examSubjects.filter((es) => es.exam_id === examId);
  return rows.map((es) => {
    const subjectMarks = marks.filter((m) => m.exam_subject_id === es.id && m.status !== "draft");
    const values = subjectMarks.map((m) => m.obtained_marks);
    const pass = subjectMarks.filter((m) => m.obtained_marks >= es.passing_marks);
    const gradeDistribution: Record<string, number> = {};
    for (const m of subjectMarks) {
      const pct = es.total_marks > 0 ? (m.obtained_marks / es.total_marks) * 100 : 0;
      const grade = gradeFor(pct, school);
      gradeDistribution[grade] = (gradeDistribution[grade] ?? 0) + 1;
    }
    return {
      exam_subject_id: es.id,
      subject_id: es.subject_id,
      entries: values.length,
      highest: values.length ? Math.max(...values) : 0,
      lowest: values.length ? Math.min(...values) : 0,
      average: values.length ? Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 10) / 10 : 0,
      pass_count: pass.length,
      fail_count: values.length - pass.length,
      pass_percentage: values.length ? Math.round((pass.length / values.length) * 1000) / 10 : 0,
      grade_distribution: gradeDistribution,
    };
  });
}

async function getSchoolGradingBands() {
  if (isDemoMode()) return demoStore.getSchool().grading_system ?? [];
  const supabase = await createClient();
  const { data } = await supabase.from("schools").select("grading_system").limit(1).single();
  return data?.grading_system ?? [];
}
