import "server-only";
import { isDemoMode } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import { demoStore } from "@/lib/demo/store";
import { listTeachers } from "@/lib/data/teachers";
import { listClasses, listSections } from "@/lib/data/academics";
import { listPeriods } from "@/lib/data/periods";
import { findTimetableConflict, type TimetableCandidate } from "@/lib/timetable/conflicts";
import type { TimetableEntry } from "@/types/database";

export async function listTimetableEntries(): Promise<TimetableEntry[]> {
  if (isDemoMode()) return demoStore.listTimetableEntries();

  const supabase = await createClient();
  const { data, error } = await supabase.from("timetables").select("*");
  if (error) throw error;
  return data as TimetableEntry[];
}

async function buildConflictContext() {
  const [teachers, sections, classes, periods] = await Promise.all([
    listTeachers(),
    listSections(),
    listClasses(),
    listPeriods(),
  ]);
  return { teachers, sections, classes, periods };
}

/** Creates or updates (when `candidate.id` is set) one timetable entry, rejecting conflicts. */
export async function saveTimetableEntry(
  candidate: TimetableCandidate,
  schoolId: string,
  academicSessionId?: string | null
): Promise<TimetableEntry> {
  if (isDemoMode()) return demoStore.saveTimetableEntry(candidate);

  const existing = await listTimetableEntries();
  const ctx = await buildConflictContext();
  const conflict = findTimetableConflict(existing, candidate, ctx);
  if (conflict) throw new Error(conflict);

  const supabase = await createClient();
  const period = ctx.periods.find((p) => p.id === candidate.period_id);
  const row = {
    school_id: schoolId,
    class_id: candidate.class_id,
    section_id: candidate.section_id,
    subject_id: candidate.subject_id,
    teacher_id: candidate.teacher_id,
    period_id: candidate.period_id,
    period_number: period?.period_number ?? 0,
    day_of_week: candidate.day_of_week,
    room: candidate.room ?? null,
    academic_session_id: academicSessionId ?? null,
  };

  if (candidate.id) {
    const { data, error } = await supabase
      .from("timetables")
      .update(row)
      .eq("id", candidate.id)
      .select()
      .single();
    if (error) {
      if (error.code === "23505") throw new Error("Timetable Conflict: this slot is already booked.");
      throw error;
    }
    return data as TimetableEntry;
  }

  const { data, error } = await supabase.from("timetables").insert(row).select().single();
  if (error) {
    if (error.code === "23505") throw new Error("Timetable Conflict: this slot is already booked.");
    throw error;
  }
  return data as TimetableEntry;
}

export async function deleteTimetableEntry(id: string): Promise<boolean> {
  if (isDemoMode()) return demoStore.deleteTimetableEntry(id);

  const supabase = await createClient();
  const { error } = await supabase.from("timetables").delete().eq("id", id);
  return !error;
}
