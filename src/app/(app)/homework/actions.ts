"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { getStudentIdForProfile } from "@/lib/data/people";
import { submitHomework } from "@/lib/data/homework-submissions";

export async function submitHomeworkAction(homeworkId: string, formData: FormData): Promise<{ error?: string } | void> {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.profile.role !== "student") return { error: "Only a student can submit their own homework." };

  const studentId = await getStudentIdForProfile(session.profile.id);
  if (!studentId) return { error: "No student record is linked to your account." };

  const submissionUrl = String(formData.get("submission_url") ?? "").trim() || null;

  try {
    await submitHomework(homeworkId, studentId, session.school.id, submissionUrl);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Could not submit homework." };
  }
  revalidatePath("/homework");
}
