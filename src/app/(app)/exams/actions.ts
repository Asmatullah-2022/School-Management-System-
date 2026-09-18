"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSession, isSchoolAdmin } from "@/lib/auth/session";
import { archiveExam, createExam, publishExam, updateExam, type NewExam } from "@/lib/data/exams";
import type { Exam } from "@/types/database";

function readExamForm(formData: FormData): NewExam {
  return {
    name: String(formData.get("name") ?? "").trim(),
    exam_type: (formData.get("exam_type") as Exam["exam_type"]) || "monthly_test",
    start_date: String(formData.get("start_date") ?? ""),
    end_date: String(formData.get("end_date") ?? ""),
    academic_session_id: null,
  };
}

function validate(input: NewExam): string | null {
  if (!input.name) return "Exam name is required.";
  if (!input.start_date || !input.end_date) return "Start and end dates are required.";
  if (input.start_date > input.end_date) return "End date must be on or after the start date.";
  return null;
}

export async function createExamAction(formData: FormData) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!isSchoolAdmin(session.profile.role)) return { error: "Only administrators can create examinations." };

  const input = readExamForm(formData);
  const validationError = validate(input);
  if (validationError) return { error: validationError };

  const exam = await createExam(input, session.school.id, session.profile.id);
  revalidatePath("/exams");
  redirect(`/exams/${exam.id}`);
}

export async function updateExamAction(id: string, formData: FormData) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!isSchoolAdmin(session.profile.role)) return { error: "Only administrators can edit examinations." };

  const input = readExamForm(formData);
  const validationError = validate(input);
  if (validationError) return { error: validationError };
  const status = formData.get("status");

  try {
    await updateExam(id, { ...input, ...(status ? { status: status as Exam["status"] } : {}) });
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Could not update exam." };
  }
  revalidatePath("/exams");
  revalidatePath(`/exams/${id}`);
  redirect(`/exams/${id}`);
}

export async function archiveExamAction(id: string) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!isSchoolAdmin(session.profile.role)) return;

  await archiveExam(id);
  revalidatePath("/exams");
  redirect("/exams");
}

export async function publishExamAction(id: string) {
  const session = await getSession();
  if (!session) return { error: "Your session has expired. Please sign in again." };
  if (!isSchoolAdmin(session.profile.role)) return { error: "Only administrators can publish results." };

  try {
    await publishExam(id, session.profile.id);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Could not publish this exam." };
  }
  revalidatePath("/exams");
  revalidatePath(`/exams/${id}`);
  return { success: true as const };
}
