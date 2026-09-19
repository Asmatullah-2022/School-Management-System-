"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSession, isSchoolAdmin } from "@/lib/auth/session";
import { getStudentIdForProfile } from "@/lib/data/people";
import { createLeaveRequest, reviewLeaveRequest } from "@/lib/data/leave";

export async function submitLeaveRequestAction(formData: FormData): Promise<{ error?: string } | void> {
  const session = await getSession();
  if (!session) redirect("/login");

  const startDate = String(formData.get("start_date") ?? "");
  const endDate = String(formData.get("end_date") ?? "");
  const reason = String(formData.get("reason") ?? "").trim();

  if (!startDate || !endDate) return { error: "Select a start and end date." };
  if (startDate > endDate) return { error: "Start date must be before the end date." };
  if (!reason) return { error: "Please provide a reason for the leave request." };

  let studentId: string | undefined;
  if (session.profile.role === "student") {
    studentId = await getStudentIdForProfile(session.profile.id);
  } else if (session.profile.role === "parent") {
    studentId = String(formData.get("student_id") ?? "") || undefined;
  }

  try {
    await createLeaveRequest({
      schoolId: session.school.id,
      requesterProfileId: session.profile.id,
      requesterRole: session.profile.role,
      studentId,
      startDate,
      endDate,
      reason,
    });
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Could not submit leave request." };
  }
  revalidatePath("/leave");
}

export async function reviewLeaveRequestAction(id: string, status: "approved" | "rejected", remarks?: string) {
  const session = await getSession();
  if (!session || !isSchoolAdmin(session.profile.role)) return { error: "Only a School Admin can review leave requests." };
  await reviewLeaveRequest(id, status, session.profile.id, remarks);
  revalidatePath("/leave");
}
