import "server-only";
import { isDemoMode } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import { demoStore } from "@/lib/demo/store";
import { listTeachers } from "@/lib/data/teachers";
import { listClasses, listSections } from "@/lib/data/academics";
import { findExamScheduleConflict, type ExamScheduleCandidate } from "@/lib/exams/conflicts";
import { getExam } from "@/lib/data/exams";
import type { ExamSubject } from "@/types/database";

export async function listExamSubjects(): Promise<ExamSubject[]> {
  if (isDemoMode()) return demoStore.listExamSubjects();

  const supabase = await createClient();
  const { data, error } = await supabase.from("exam_subjects").select("*");
  if (error) throw error;
  return data as ExamSubject[];
}

export async function getExamSubject(id: string): Promise<ExamSubject | undefined> {
  if (isDemoMode()) return demoStore.getExamSubject(id);

  const supabase = await createClient();
  const { data, error } = await supabase.from("exam_subjects").select("*").eq("id", id).single();
  if (error) return undefined;
  return data as ExamSubject;
}

async function buildConflictContext() {
  const [classes, sections, teachers] = await Promise.all([listClasses(), listSections(), listTeachers()]);
  return { classes, sections, teachers };
}

export type ScheduleCandidate = ExamScheduleCandidate & {
  total_marks: number;
  passing_marks: number;
  start_time?: string | null;
  end_time?: string | null;
};

export async function saveExamSchedule(candidate: ScheduleCandidate, schoolId: string): Promise<ExamSubject> {
  if (isDemoMode()) return demoStore.saveExamSchedule(candidate);

  const exam = await getExam(candidate.exam_id);
  if (exam?.status === "published") {
    throw new Error("This exam is already published; its schedule can no longer be changed.");
  }

  const existing = await listExamSubjects();
  const ctx = await buildConflictContext();
  const conflict = findExamScheduleConflict(existing, candidate, ctx);
  if (conflict) throw new Error(conflict);

  const supabase = await createClient();
  const row = { ...candidate, school_id: schoolId };

  if (candidate.id) {
    const { data, error } = await supabase.from("exam_subjects").update(row).eq("id", candidate.id).select().single();
    if (error) {
      if (error.code === "23505") throw new Error("Schedule Conflict: this date/room/invigilator slot is already booked.");
      throw error;
    }
    return data as ExamSubject;
  }

  const { data, error } = await supabase.from("exam_subjects").insert(row).select().single();
  if (error) {
    if (error.code === "23505") throw new Error("Schedule Conflict: this date/room/invigilator slot is already booked.");
    throw error;
  }
  return data as ExamSubject;
}

export async function deleteExamSchedule(id: string): Promise<boolean> {
  if (isDemoMode()) return demoStore.deleteExamSchedule(id);

  const supabase = await createClient();
  const { count } = await supabase.from("marks").select("id", { count: "exact", head: true }).eq("exam_subject_id", id);
  if (count && count > 0) {
    throw new Error("Cannot remove a scheduled paper that already has marks entered.");
  }
  const { error } = await supabase.from("exam_subjects").delete().eq("id", id);
  return !error;
}
