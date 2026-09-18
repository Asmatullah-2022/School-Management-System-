"use server";

import { getSession, isFinanceStaff } from "@/lib/auth/session";
import { generateFeeCharges, ensureFeePeriod } from "@/lib/data/finance";
import { listStudents } from "@/lib/data/students";

export async function generateFeesAction(formData: FormData): Promise<{ error?: string; success?: string }> {
  const session = await getSession();
  if (!session) return { error: "Not signed in." };
  if (!isFinanceStaff(session.profile.role)) return { error: "Only Finance staff can generate fee charges." };

  const feeStructureId = String(formData.get("fee_structure_id") ?? "");
  const scope = String(formData.get("scope") ?? "school");
  const classId = String(formData.get("class_id") ?? "");
  const sectionId = String(formData.get("section_id") ?? "");
  const studentId = String(formData.get("student_id") ?? "");
  const dueDate = String(formData.get("due_date") ?? "");
  const usePeriod = formData.get("use_period") === "on";
  const month = Number(formData.get("month") ?? 0);
  const year = Number(formData.get("year") ?? 0);

  if (!feeStructureId) return { error: "Select a fee structure." };
  if (!dueDate) return { error: "Due date is required." };

  const students = await listStudents();
  let targets = students;
  if (scope === "class") targets = students.filter((s) => s.class_id === classId);
  else if (scope === "section") targets = students.filter((s) => s.section_id === sectionId);
  else if (scope === "student") targets = students.filter((s) => s.id === studentId);

  if (scope === "class" && !classId) return { error: "Select a class." };
  if (scope === "section" && !sectionId) return { error: "Select a section." };
  if (scope === "student" && !studentId) return { error: "Select a student." };
  if (targets.length === 0) return { error: "No students match the selected scope." };

  let feePeriodId: string | null = null;
  if (usePeriod && month && year) {
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const period = await ensureFeePeriod(session.school.id, month, year, `${monthNames[month - 1]} ${year}`);
    feePeriodId = period.id;
  }

  try {
    const result = await generateFeeCharges({
      schoolId: session.school.id,
      studentIds: targets.map((s) => s.id),
      feeStructureId,
      feePeriodId,
      dueDate,
      createdBy: session.profile.id,
    });
    return { success: `Generated ${result.created} new charge(s). ${result.skipped} already existed and were skipped.` };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Could not generate fee charges." };
  }
}
