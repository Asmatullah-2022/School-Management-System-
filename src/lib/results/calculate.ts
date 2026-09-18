import type { GradeBand } from "@/types/database";

export function gradeFor(percentage: number, bands: GradeBand[]): string {
  if (bands.length === 0) return "-";
  const sorted = [...bands].sort((a, b) => b.min - a.min);
  const band = sorted.find((b) => percentage >= b.min && percentage <= b.max);
  return band?.grade ?? sorted[sorted.length - 1].grade;
}

export interface SubjectMark {
  obtained: number;
  total: number;
  passing: number;
}

export interface ComputedResult {
  total_obtained: number;
  total_marks: number;
  percentage: number;
  grade: string;
  is_pass: boolean;
  passed_subjects: number;
  failed_subjects: number;
}

/** Pure aggregation used by both demo mode and the Supabase data layer, so
 * result calculation behaves identically regardless of backend. */
export function computeStudentResult(subjectMarks: SubjectMark[], bands: GradeBand[]): ComputedResult {
  const total_marks = subjectMarks.reduce((sum, m) => sum + m.total, 0);
  const total_obtained = subjectMarks.reduce((sum, m) => sum + m.obtained, 0);
  const percentage = total_marks > 0 ? Math.round((total_obtained / total_marks) * 1000) / 10 : 0;
  const passed_subjects = subjectMarks.filter((m) => m.obtained >= m.passing).length;
  const failed_subjects = subjectMarks.length - passed_subjects;

  return {
    total_obtained,
    total_marks,
    percentage,
    grade: gradeFor(percentage, bands),
    is_pass: failed_subjects === 0 && subjectMarks.length > 0,
    passed_subjects,
    failed_subjects,
  };
}

/** Standard competition ranking (ties share a rank; the next rank skips accordingly). */
export function rankByPercentage<T extends { student_id: string; percentage: number }>(rows: T[]): Map<string, number> {
  const sorted = [...rows].sort((a, b) => b.percentage - a.percentage);
  const ranks = new Map<string, number>();
  let rank = 0;
  let seen = 0;
  let lastPct: number | null = null;
  for (const row of sorted) {
    seen += 1;
    if (lastPct === null || row.percentage !== lastPct) {
      rank = seen;
      lastPct = row.percentage;
    }
    ranks.set(row.student_id, rank);
  }
  return ranks;
}
