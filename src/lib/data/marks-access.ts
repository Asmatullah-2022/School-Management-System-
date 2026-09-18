import "server-only";
import { getTeacherIdForProfile } from "@/lib/data/people";
import { listAssignments } from "@/lib/data/assignments";
import { listExamSubjects } from "@/lib/data/exam-schedule";

/** Exam-subject ids a teacher profile is authorized to enter marks for,
 * derived from their active subject assignments (mirrors the marks RLS
 * policy in 0004_phase4_examinations.sql). */
export async function getAssignedExamSubjectIds(profileId: string): Promise<Set<string>> {
  const teacherId = await getTeacherIdForProfile(profileId);
  if (!teacherId) return new Set();

  const [assignments, examSubjects] = await Promise.all([listAssignments(), listExamSubjects()]);
  const myAssignments = assignments.filter((a) => a.teacher_id === teacherId && a.status === "active");

  const ids = examSubjects
    .filter((es) =>
      myAssignments.some(
        (a) => a.class_id === es.class_id && a.subject_id === es.subject_id && (a.section_id === es.section_id || a.section_id === null)
      )
    )
    .map((es) => es.id);

  return new Set(ids);
}
