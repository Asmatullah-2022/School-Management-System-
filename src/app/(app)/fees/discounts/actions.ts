"use server";

import { revalidatePath } from "next/cache";
import { getSession, isFinanceStaff, isSchoolAdmin } from "@/lib/auth/session";
import { createDiscount, toggleDiscount, createScholarship, decideScholarship } from "@/lib/data/finance";
import type { Discount } from "@/types/database";

export async function createDiscountAction(formData: FormData): Promise<{ error?: string } | void> {
  const session = await getSession();
  if (!session || !isFinanceStaff(session.profile.role)) return { error: "Only Finance staff can create discounts." };

  const scope = String(formData.get("scope") ?? "school") as Discount["scope"];
  const value = Number(formData.get("value") ?? 0);
  if (value <= 0) return { error: "Discount value must be greater than zero." };

  try {
    await createDiscount({
      school_id: session.school.id,
      name: String(formData.get("name") ?? "").trim(),
      kind: (formData.get("kind") as Discount["kind"]) ?? "percentage",
      value,
      scope,
      class_id: scope === "class" ? String(formData.get("class_id") ?? "") || null : null,
      section_id: scope === "section" ? String(formData.get("section_id") ?? "") || null : null,
      student_id: scope === "student" ? String(formData.get("student_id") ?? "") || null : null,
      academic_session_id: null,
      created_by: session.profile.id,
    });
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Could not create discount." };
  }
  revalidatePath("/fees/discounts");
}

export async function toggleDiscountAction(id: string, isActive: boolean) {
  const session = await getSession();
  if (!session || !isFinanceStaff(session.profile.role)) return;
  await toggleDiscount(id, isActive);
  revalidatePath("/fees/discounts");
}

export async function createScholarshipAction(formData: FormData): Promise<{ error?: string } | void> {
  const session = await getSession();
  if (!session || !isFinanceStaff(session.profile.role)) return { error: "Only Finance staff can propose scholarships." };

  const value = Number(formData.get("value") ?? 0);
  const studentId = String(formData.get("student_id") ?? "");
  if (!studentId) return { error: "Select a student." };
  if (value <= 0) return { error: "Value must be greater than zero." };

  try {
    await createScholarship({
      school_id: session.school.id,
      student_id: studentId,
      name: String(formData.get("name") ?? "").trim(),
      kind: (formData.get("kind") as Discount["kind"]) ?? "percentage",
      value,
      academic_session_id: null,
      notes: String(formData.get("notes") ?? "").trim() || null,
      created_by: session.profile.id,
    });
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Could not create scholarship." };
  }
  revalidatePath("/fees/discounts");
}

export async function decideScholarshipAction(id: string, status: "approved" | "rejected") {
  const session = await getSession();
  if (!session || !isSchoolAdmin(session.profile.role)) return { error: "Only a School Admin can approve or reject a scholarship." };
  await decideScholarship(id, status, session.profile.id);
  revalidatePath("/fees/discounts");
}
