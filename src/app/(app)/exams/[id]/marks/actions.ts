"use server";

import { revalidatePath } from "next/cache";
import { getSession, isSchoolAdmin } from "@/lib/auth/session";
import { getExamSubject } from "@/lib/data/exam-schedule";
import { getAssignedExamSubjectIds } from "@/lib/data/marks-access";
import { saveMarksBatch, verifyMarksForExamSubject, reopenMarksForExamSubject, revisePublishedMark } from "@/lib/data/marks";

async function assertCanEnterMarks(examSubjectId: string) {
  const session = await getSession();
  if (!session) throw new Error("Your session has expired. Please sign in again.");
  if (isSchoolAdmin(session.profile.role)) return session;
  if (session.profile.role !== "teacher") throw new Error("You are not authorized to enter marks.");

  const allowedIds = await getAssignedExamSubjectIds(session.profile.id);
  if (!allowedIds.has(examSubjectId)) {
    throw new Error("You can only enter marks for subjects assigned to you.");
  }
  return session;
}

export async function saveMarksAction(
  examId: string,
  examSubjectId: string,
  rows: { student_id: string; obtained_marks: number }[],
  status: "draft" | "submitted"
) {
  try {
    const session = await assertCanEnterMarks(examSubjectId);
    const examSubject = await getExamSubject(examSubjectId);
    if (!examSubject) throw new Error("Exam schedule entry not found.");
    for (const row of rows) {
      if (Number.isNaN(row.obtained_marks) || row.obtained_marks < 0 || row.obtained_marks > examSubject.total_marks) {
        throw new Error(`Every mark must be between 0 and ${examSubject.total_marks}.`);
      }
    }
    await saveMarksBatch(examSubjectId, rows, status, session.profile.id, session.school.id);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Could not save marks." };
  }
  revalidatePath(`/exams/${examId}`);
  revalidatePath(`/exams/${examId}/marks/${examSubjectId}`);
  return { success: true as const };
}

export async function verifyMarksAction(examId: string, examSubjectId: string) {
  const session = await getSession();
  if (!session) return { error: "Your session has expired. Please sign in again." };
  if (!isSchoolAdmin(session.profile.role)) return { error: "Only administrators can verify marks." };

  try {
    await verifyMarksForExamSubject(examSubjectId, session.profile.id);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Could not verify marks." };
  }
  revalidatePath(`/exams/${examId}`);
  revalidatePath(`/exams/${examId}/marks/${examSubjectId}`);
  return { success: true as const };
}

export async function reopenMarksAction(examId: string, examSubjectId: string) {
  const session = await getSession();
  if (!session) return { error: "Your session has expired. Please sign in again." };
  if (!isSchoolAdmin(session.profile.role)) return { error: "Only administrators can reopen marks." };

  await reopenMarksForExamSubject(examSubjectId);
  revalidatePath(`/exams/${examId}`);
  revalidatePath(`/exams/${examId}/marks/${examSubjectId}`);
  return { success: true as const };
}

export async function revisePublishedMarkAction(examId: string, markId: string, newMarks: number, reason: string) {
  const session = await getSession();
  if (!session) return { error: "Your session has expired. Please sign in again." };
  if (!isSchoolAdmin(session.profile.role)) return { error: "Only administrators can change a published mark." };
  if (!reason.trim()) return { error: "A reason is required to change a published mark." };

  try {
    await revisePublishedMark(markId, newMarks, reason, session.profile.id);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Could not revise this mark." };
  }
  revalidatePath(`/exams/${examId}`);
  revalidatePath(`/exams/${examId}/results`);
  return { success: true as const };
}
