"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSession, isSchoolAdmin } from "@/lib/auth/session";
import { createAssignment, deleteAssignment, updateAssignment, type NewAssignment } from "@/lib/data/assignments";

function readAssignmentForm(formData: FormData): NewAssignment {
  return {
    class_id: String(formData.get("class_id") ?? ""),
    section_id: String(formData.get("section_id") ?? "") || null,
    subject_id: String(formData.get("subject_id") ?? ""),
    teacher_id: String(formData.get("teacher_id") ?? ""),
    weekly_periods: Number(formData.get("weekly_periods") ?? 5),
    academic_session_id: null,
  };
}

function validate(input: NewAssignment): string | null {
  if (!input.class_id) return "Please select a class.";
  if (!input.section_id) return "Please select a section.";
  if (!input.subject_id) return "Please select a subject.";
  if (!input.teacher_id) return "Please select a teacher.";
  if (input.weekly_periods < 1) return "Weekly periods must be at least 1.";
  return null;
}

export async function createAssignmentAction(formData: FormData) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!isSchoolAdmin(session.profile.role)) return { error: "Only administrators can manage assignments." };

  const input = readAssignmentForm(formData);
  const validationError = validate(input);
  if (validationError) return { error: validationError };

  try {
    await createAssignment(input, session.school.id);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Could not create assignment." };
  }
  revalidatePath("/academics/assignments");
  redirect("/academics/assignments");
}

export async function updateAssignmentAction(id: string, formData: FormData) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!isSchoolAdmin(session.profile.role)) return { error: "Only administrators can manage assignments." };

  const input = readAssignmentForm(formData);
  const validationError = validate(input);
  if (validationError) return { error: validationError };

  try {
    await updateAssignment(id, input);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Could not update assignment." };
  }
  revalidatePath("/academics/assignments");
  redirect("/academics/assignments");
}

export async function deleteAssignmentAction(id: string) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!isSchoolAdmin(session.profile.role)) return;

  await deleteAssignment(id);
  revalidatePath("/academics/assignments");
}
