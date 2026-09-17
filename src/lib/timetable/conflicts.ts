import type { Period, Section, SchoolClass, Teacher, TimetableEntry } from "@/types/database";

export interface TimetableCandidate {
  id?: string; // present when editing an existing entry (excluded from conflict checks)
  class_id: string;
  section_id: string;
  subject_id: string;
  teacher_id: string | null;
  period_id: string;
  day_of_week: number;
  room?: string | null;
}

export interface ConflictContext {
  teachers: Teacher[];
  sections: Section[];
  classes: SchoolClass[];
  periods: Period[];
}

function labelFor(ctx: ConflictContext, entry: TimetableEntry | TimetableCandidate) {
  const section = ctx.sections.find((s) => s.id === entry.section_id);
  const klass = ctx.classes.find((c) => c.id === (section?.class_id ?? entry.class_id));
  return `${klass?.name ?? "Unknown class"} ${section?.name ? "Section " + section.name : ""}`.trim();
}

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

/**
 * Checks a candidate timetable entry against every existing entry in the
 * same school and returns a human-readable conflict message, or null if
 * the slot is free. Mirrors the DB-level unique indexes in
 * supabase/migrations/0003_phase3_academics.sql (teacher / section / room
 * double-booking for the same day + period) so both demo mode and a real
 * Supabase project reject the same conflicts with the same wording.
 */
export function findTimetableConflict(
  existing: TimetableEntry[],
  candidate: TimetableCandidate,
  ctx: ConflictContext
): string | null {
  const sameSlot = existing.filter(
    (e) => e.id !== candidate.id && e.day_of_week === candidate.day_of_week && e.period_id === candidate.period_id
  );

  const day = DAY_NAMES[candidate.day_of_week] ?? `Day ${candidate.day_of_week}`;
  const period = ctx.periods.find((p) => p.id === candidate.period_id)?.name ?? "this period";

  if (candidate.teacher_id) {
    const teacherClash = sameSlot.find((e) => e.teacher_id === candidate.teacher_id);
    if (teacherClash) {
      const teacherName = ctx.teachers.find((t) => t.id === candidate.teacher_id)?.full_name ?? "This teacher";
      return `Timetable Conflict: ${teacherName} is already assigned to ${labelFor(ctx, teacherClash)} during ${period} on ${day}.`;
    }
  }

  const sectionClash = sameSlot.find((e) => e.section_id === candidate.section_id);
  if (sectionClash) {
    return `Timetable Conflict: ${labelFor(ctx, candidate)} already has a class scheduled during ${period} on ${day}.`;
  }

  if (candidate.room && candidate.room.trim()) {
    const roomClash = sameSlot.find((e) => (e.room ?? "").trim().toLowerCase() === candidate.room!.trim().toLowerCase());
    if (roomClash) {
      return `Timetable Conflict: Room "${candidate.room}" is already booked by ${labelFor(ctx, roomClash)} during ${period} on ${day}.`;
    }
  }

  return null;
}
