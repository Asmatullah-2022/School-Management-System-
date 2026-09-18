"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSession, isSchoolAdmin } from "@/lib/auth/session";
import { deleteExamSchedule, saveExamSchedule, type ScheduleCandidate } from "@/lib/data/exam-schedule";

function readScheduleForm(formData: FormData, examId: string, id?: string): ScheduleCandidate {
  return {
    id,
    exam_id: examId,
    class_id: String(formData.get("class_id") ?? ""),
    section_id: String(formData.get("section_id") ?? "") || null,
    subject_id: String(formData.get("subject_id") ?? ""),
    exam_date: String(formData.get("exam_date") ?? "") || null,
    exam_room: String(formData.get("exam_room") ?? "") || null,
    invigilator_id: String(formData.get("invigilator_id") ?? "") || null,
    start_time: String(formData.get("start_time") ?? "") || null,
    end_time: String(formData.get("end_time") ?? "") || null,
    total_marks: Number(formData.get("total_marks") ?? 100),
    passing_marks: Number(formData.get("passing_marks") ?? 33),
  };
}

function validate(input: ScheduleCandidate): string | null {
  if (!input.class_id) return "Please select a class.";
  if (!input.section_id) return "Please select a section.";
  if (!input.subject_id) return "Please select a subject.";
  if (!input.exam_date) return "Please choose an exam date.";
  if (input.total_marks <= 0) return "Total marks must be greater than zero.";
  if (input.passing_marks < 0 || input.passing_marks > input.total_marks) {
    return "Passing marks must be between 0 and the total marks.";
  }
  if (input.start_time && input.end_time && input.start_time >= input.end_time) {
    return "End time must be after start time.";
  }
  return null;
}

export async function createExamScheduleAction(examId: string, formData: FormData) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!isSchoolAdmin(session.profile.role)) return { error: "Only administrators can schedule exams." };

  const input = readScheduleForm(formData, examId);
  const validationError = validate(input);
  if (validationError) return { error: validationError };

  try {
    await saveExamSchedule(input, session.school.id);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Could not save the exam schedule." };
  }
  revalidatePath(`/exams/${examId}`);
  redirect(`/exams/${examId}`);
}

export async function updateExamScheduleAction(examId: string, id: string, formData: FormData) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!isSchoolAdmin(session.profile.role)) return { error: "Only administrators can schedule exams." };

  const input = readScheduleForm(formData, examId, id);
  const validationError = validate(input);
  if (validationError) return { error: validationError };

  try {
    await saveExamSchedule(input, session.school.id);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Could not save the exam schedule." };
  }
  revalidatePath(`/exams/${examId}`);
  redirect(`/exams/${examId}`);
}

export async function deleteExamScheduleAction(examId: string, id: string) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!isSchoolAdmin(session.profile.role)) return { error: "Only administrators can edit the exam schedule." };

  try {
    await deleteExamSchedule(id);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Could not remove this schedule entry." };
  }
  revalidatePath(`/exams/${examId}`);
  return { success: true as const };
}
