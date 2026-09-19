import "server-only";
import { isDemoMode } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import { demoStore } from "@/lib/demo/store";
import type { HomeworkAssignment } from "@/types/database";

/** All homework-submission rows visible to the caller (RLS scopes this to
 * the school for staff, or the caller's own/child's rows for parent/student). */
export async function listHomeworkAssignments(): Promise<HomeworkAssignment[]> {
  if (isDemoMode()) return demoStore.listHomeworkAssignments();
  const supabase = await createClient();
  const { data, error } = await supabase.from("assignments").select("*");
  if (error) throw error;
  return data as HomeworkAssignment[];
}

/** The only sanctioned way for a student to submit their own homework —
 * inserts the row on first submission, or updates it on resubmission
 * (rejected once a teacher has marked it "checked"). RLS enforces that a
 * student may only ever touch their own student_id, and a DB trigger
 * blocks a student from setting their own marks/feedback. */
export async function submitHomework(
  homeworkId: string,
  studentId: string,
  schoolId: string,
  submissionUrl: string | null,
  comment: string | null,
  isLate: boolean
): Promise<HomeworkAssignment> {
  if (isDemoMode()) return demoStore.submitHomework(homeworkId, studentId, submissionUrl, comment, isLate);

  const status = isLate ? "late" : "submitted";
  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("assignments")
    .select("*")
    .eq("homework_id", homeworkId)
    .eq("student_id", studentId)
    .maybeSingle();

  if (existing) {
    if (existing.status === "checked") throw new Error("This homework has already been checked and can no longer be resubmitted.");
    const { data, error } = await supabase
      .from("assignments")
      .update({ status, submitted_at: new Date().toISOString(), submission_url: submissionUrl, comment })
      .eq("id", existing.id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data as HomeworkAssignment;
  }

  const { data, error } = await supabase
    .from("assignments")
    .insert({
      school_id: schoolId,
      homework_id: homeworkId,
      student_id: studentId,
      status,
      submitted_at: new Date().toISOString(),
      submission_url: submissionUrl,
      comment,
    })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as HomeworkAssignment;
}

/** The only sanctioned way for a teacher to review a submission — sets
 * marks/feedback and marks it "checked". A student can never call this
 * path (their own update policy + trigger reject marks/feedback changes). */
export async function reviewHomeworkSubmission(
  id: string,
  data: { marks?: number | null; remarks?: string | null },
  checkedBy: string
): Promise<HomeworkAssignment | undefined> {
  if (isDemoMode()) return demoStore.reviewHomeworkSubmission(id, { ...data, checkedBy });

  const supabase = await createClient();
  const { data: row, error } = await supabase
    .from("assignments")
    .update({ marks: data.marks, remarks: data.remarks, status: "checked", checked_by: checkedBy })
    .eq("id", id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return row as HomeworkAssignment;
}
