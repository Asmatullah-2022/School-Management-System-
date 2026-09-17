"use server";

import { revalidatePath } from "next/cache";
import { getSession, isSchoolAdmin } from "@/lib/auth/session";
import { deleteTimetableEntry, saveTimetableEntry } from "@/lib/data/timetable";
import type { TimetableCandidate } from "@/lib/timetable/conflicts";

export async function saveTimetableEntryAction(candidate: TimetableCandidate) {
  const session = await getSession();
  if (!session) return { error: "Your session has expired. Please sign in again." };
  if (!isSchoolAdmin(session.profile.role)) return { error: "Only administrators can edit the timetable." };

  try {
    await saveTimetableEntry(candidate, session.school.id);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Could not save timetable entry." };
  }
  revalidatePath("/timetable");
  return { success: true as const };
}

export async function deleteTimetableEntryAction(id: string) {
  const session = await getSession();
  if (!session) return { error: "Your session has expired. Please sign in again." };
  if (!isSchoolAdmin(session.profile.role)) return { error: "Only administrators can edit the timetable." };

  await deleteTimetableEntry(id);
  revalidatePath("/timetable");
  return { success: true as const };
}
