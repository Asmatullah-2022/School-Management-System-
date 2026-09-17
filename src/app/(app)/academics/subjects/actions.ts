"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSession, isSchoolAdmin } from "@/lib/auth/session";
import { archiveSubject, createSubject, updateSubject, type NewSubject } from "@/lib/data/subjects";
import type { Subject } from "@/types/database";

function readSubjectForm(formData: FormData): NewSubject {
  return {
    name: String(formData.get("name") ?? "").trim(),
    name_urdu: String(formData.get("name_urdu") ?? "").trim() || null,
    code: String(formData.get("code") ?? "").trim() || null,
    description: String(formData.get("description") ?? "").trim() || null,
    subject_type: (formData.get("subject_type") as Subject["subject_type"]) || "core",
    total_marks: Number(formData.get("total_marks") ?? 100),
    passing_marks: Number(formData.get("passing_marks") ?? 33),
  };
}

export async function createSubjectAction(formData: FormData) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!isSchoolAdmin(session.profile.role)) {
    return { error: "Only administrators can create subjects." };
  }

  const input = readSubjectForm(formData);
  if (!input.name) return { error: "Subject name is required." };
  if (input.passing_marks > input.total_marks) {
    return { error: "Passing marks cannot exceed total marks." };
  }

  try {
    await createSubject(input, session.school.id);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Could not create subject." };
  }
  revalidatePath("/academics/subjects");
  redirect("/academics/subjects");
}

export async function updateSubjectAction(id: string, formData: FormData) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!isSchoolAdmin(session.profile.role)) {
    return { error: "Only administrators can edit subjects." };
  }

  const input = readSubjectForm(formData);
  if (!input.name) return { error: "Subject name is required." };
  if (input.passing_marks > input.total_marks) {
    return { error: "Passing marks cannot exceed total marks." };
  }

  try {
    await updateSubject(id, input);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Could not update subject." };
  }
  revalidatePath("/academics/subjects");
  redirect("/academics/subjects");
}

export async function archiveSubjectAction(id: string) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!isSchoolAdmin(session.profile.role)) return;

  await archiveSubject(id);
  revalidatePath("/academics/subjects");
}
