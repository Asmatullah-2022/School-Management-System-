"use server";

import { revalidatePath } from "next/cache";
import { getSession, isSchoolAdmin } from "@/lib/auth/session";
import { computeAndStoreResultsForExam } from "@/lib/data/results";

export async function calculateResultsAction(examId: string) {
  const session = await getSession();
  if (!session) return { error: "Your session has expired. Please sign in again." };
  if (!isSchoolAdmin(session.profile.role)) return { error: "Only administrators can calculate results." };

  try {
    await computeAndStoreResultsForExam(examId);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Could not calculate results." };
  }
  revalidatePath(`/exams/${examId}/results`);
  return { success: true as const };
}
