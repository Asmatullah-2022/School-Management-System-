"use server";

import { revalidatePath } from "next/cache";
import { getSession, isSchoolAdmin } from "@/lib/auth/session";
import { updateGradingSystem } from "@/lib/data/grading";
import type { GradeBand } from "@/types/database";

export async function updateGradingSystemAction(bands: GradeBand[]) {
  const session = await getSession();
  if (!session) return { error: "Your session has expired. Please sign in again." };
  if (!isSchoolAdmin(session.profile.role)) return { error: "Only administrators can change the grading system." };

  const sorted = [...bands].sort((a, b) => b.min - a.min);
  for (const band of sorted) {
    if (!band.grade.trim()) return { error: "Every grade band needs a grade label." };
    if (band.min > band.max) return { error: `"${band.grade}" has a minimum higher than its maximum.` };
  }
  for (let i = 0; i < sorted.length - 1; i++) {
    if (sorted[i].min <= sorted[i + 1].max) {
      return { error: `Grade bands "${sorted[i].grade}" and "${sorted[i + 1].grade}" overlap.` };
    }
  }

  try {
    await updateGradingSystem(bands, session.school.id);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Could not save the grading system." };
  }
  revalidatePath("/settings");
  return { success: true as const };
}
