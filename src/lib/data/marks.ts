import "server-only";
import { isDemoMode } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import { demoStore } from "@/lib/demo/store";
import type { Mark, MarkRevision } from "@/types/database";

export async function listMarks(): Promise<Mark[]> {
  if (isDemoMode()) return demoStore.listMarks();

  const supabase = await createClient();
  const { data, error } = await supabase.from("marks").select("*");
  if (error) throw error;
  return data as Mark[];
}

export async function getMark(id: string): Promise<Mark | undefined> {
  if (isDemoMode()) return demoStore.getMark(id);

  const supabase = await createClient();
  const { data, error } = await supabase.from("marks").select("*").eq("id", id).single();
  if (error) return undefined;
  return data as Mark;
}

/** Creates/updates one exam subject's marks for a batch of students. */
export async function saveMarksBatch(
  examSubjectId: string,
  rows: { student_id: string; obtained_marks: number }[],
  status: "draft" | "submitted",
  actorProfileId: string,
  schoolId: string
): Promise<Mark[]> {
  if (isDemoMode()) return demoStore.saveMarksBatch(examSubjectId, rows, status, actorProfileId);

  const supabase = await createClient();
  const { data: examSubject } = await supabase.from("exam_subjects").select("total_marks").eq("id", examSubjectId).single();
  if (!examSubject) throw new Error("Exam schedule entry not found.");
  for (const row of rows) {
    if (row.obtained_marks < 0 || row.obtained_marks > examSubject.total_marks) {
      throw new Error(`Obtained marks must be between 0 and ${examSubject.total_marks}.`);
    }
  }

  const now = new Date().toISOString();
  const payload = rows.map((row) => ({
    school_id: schoolId,
    exam_subject_id: examSubjectId,
    student_id: row.student_id,
    obtained_marks: row.obtained_marks,
    status,
    entered_by: actorProfileId,
    submitted_at: status === "submitted" ? now : null,
    submitted_by: status === "submitted" ? actorProfileId : null,
  }));

  const { data, error } = await supabase
    .from("marks")
    .upsert(payload, { onConflict: "exam_subject_id,student_id" })
    .select();
  if (error) throw error;
  return data as Mark[];
}

export async function verifyMarksForExamSubject(examSubjectId: string, verifiedBy: string): Promise<void> {
  if (isDemoMode()) {
    demoStore.verifyMarksForExamSubject(examSubjectId, verifiedBy);
    return;
  }

  const supabase = await createClient();
  const { data: rows } = await supabase.from("marks").select("status").eq("exam_subject_id", examSubjectId);
  if ((rows ?? []).some((r) => r.status === "draft")) {
    throw new Error("All students must have submitted marks before this paper can be verified.");
  }
  const { error } = await supabase
    .from("marks")
    .update({ status: "verified", verified_at: new Date().toISOString(), verified_by: verifiedBy })
    .eq("exam_subject_id", examSubjectId)
    .eq("status", "submitted");
  if (error) throw error;
}

export async function reopenMarksForExamSubject(examSubjectId: string): Promise<void> {
  if (isDemoMode()) {
    demoStore.reopenMarksForExamSubject(examSubjectId);
    return;
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("marks")
    .update({ status: "draft", verified_at: null, verified_by: null })
    .eq("exam_subject_id", examSubjectId)
    .neq("status", "published");
  if (error) throw error;
}

/** Authorized, reasoned change to an already-published mark. */
export async function revisePublishedMark(
  markId: string,
  newMarks: number,
  reason: string,
  actorProfileId: string
): Promise<Mark> {
  if (isDemoMode()) return demoStore.revisePublishedMark(markId, newMarks, reason, actorProfileId);

  if (!reason.trim()) throw new Error("A reason is required to change a published mark.");
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("revise_published_mark", {
    p_mark_id: markId,
    p_new_marks: newMarks,
    p_reason: reason.trim(),
  });
  if (error) throw error;

  const mark = data as Mark;
  const { data: examSubject } = await supabase.from("exam_subjects").select("exam_id").eq("id", mark.exam_subject_id).single();
  if (examSubject) {
    const { computeAndStoreResultsForExam } = await import("@/lib/data/results");
    await computeAndStoreResultsForExam(examSubject.exam_id);
  }
  return mark;
}

export async function listMarkRevisions(markId?: string): Promise<MarkRevision[]> {
  if (isDemoMode()) return demoStore.listMarkRevisions(markId);

  const supabase = await createClient();
  let query = supabase.from("mark_revisions").select("*").order("created_at", { ascending: false });
  if (markId) query = query.eq("mark_id", markId);
  const { data, error } = await query;
  if (error) throw error;
  return data as MarkRevision[];
}
