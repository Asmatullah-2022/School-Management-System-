import type { ExamSubject, SchoolClass, Section, Teacher } from "@/types/database";

export interface ExamScheduleCandidate {
  id?: string;
  exam_id: string;
  class_id: string;
  section_id: string | null;
  subject_id: string;
  exam_date: string | null;
  exam_room?: string | null;
  invigilator_id?: string | null;
}

export interface ExamConflictContext {
  classes: SchoolClass[];
  sections: Section[];
  teachers: Teacher[];
}

function classSectionLabel(ctx: ExamConflictContext, classId: string, sectionId: string | null) {
  const klass = ctx.classes.find((c) => c.id === classId)?.name ?? "Unknown class";
  const section = ctx.sections.find((s) => s.id === sectionId);
  return section ? `${klass} Section ${section.name}` : klass;
}

/** Mirrors the DB-level unique indexes in 0004_phase4_examinations.sql
 * (class/section, room, and invigilator can each only have one exam paper
 * on a given date) so demo mode and Supabase reject the same conflicts. */
export function findExamScheduleConflict(
  existing: ExamSubject[],
  candidate: ExamScheduleCandidate,
  ctx: ExamConflictContext
): string | null {
  if (!candidate.exam_date) return null;
  const sameDate = existing.filter((e) => e.id !== candidate.id && e.exam_date === candidate.exam_date);

  if (candidate.section_id) {
    const clash = sameDate.find((e) => e.class_id === candidate.class_id && e.section_id === candidate.section_id);
    if (clash) {
      return `Schedule Conflict: ${classSectionLabel(ctx, candidate.class_id, candidate.section_id)} already has an exam paper scheduled on ${candidate.exam_date}.`;
    }
  }

  if (candidate.exam_room && candidate.exam_room.trim()) {
    const clash = sameDate.find((e) => (e.exam_room ?? "").trim().toLowerCase() === candidate.exam_room!.trim().toLowerCase());
    if (clash) {
      return `Schedule Conflict: Room "${candidate.exam_room}" is already booked on ${candidate.exam_date} for ${classSectionLabel(ctx, clash.class_id, clash.section_id ?? null)}.`;
    }
  }

  if (candidate.invigilator_id) {
    const clash = sameDate.find((e) => e.invigilator_id === candidate.invigilator_id);
    if (clash) {
      const teacher = ctx.teachers.find((t) => t.id === candidate.invigilator_id)?.full_name ?? "This invigilator";
      return `Schedule Conflict: ${teacher} is already invigilating ${classSectionLabel(ctx, clash.class_id, clash.section_id ?? null)} on ${candidate.exam_date}.`;
    }
  }

  return null;
}
