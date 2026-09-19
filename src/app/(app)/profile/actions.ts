"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { getStudentIdForProfile } from "@/lib/data/people";
import { updateStudent } from "@/lib/data/students";

/** The only fields a student may self-edit — administrative fields
 * (class, section, roll number, admission number, status) stay
 * administrator-controlled and are additionally guarded by a DB trigger. */
export async function updateStudentProfileAction(formData: FormData): Promise<{ error?: string } | void> {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.profile.role !== "student") return { error: "Only a student can edit their own profile this way." };

  const studentId = await getStudentIdForProfile(session.profile.id);
  if (!studentId) return { error: "No student record is linked to your account." };

  try {
    await updateStudent(studentId, {
      contact_number: String(formData.get("contact_number") ?? "").trim() || null,
      address: String(formData.get("address") ?? "").trim() || null,
      emergency_contact: String(formData.get("emergency_contact") ?? "").trim() || null,
      blood_group: String(formData.get("blood_group") ?? "").trim() || null,
      medical_info: String(formData.get("medical_info") ?? "").trim() || null,
    });
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Could not update your profile." };
  }
  revalidatePath("/profile");
}
