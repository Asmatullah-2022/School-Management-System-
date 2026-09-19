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
 * student may only ever touch their own student_id. */
export async function submitHomework(homeworkId: string, studentId: string, schoolId: string, submissionUrl: string | null): Promise<HomeworkAssignment> {
  if (isDemoMode()) return demoStore.submitHomework(homeworkId, studentId, submissionUrl);

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
      .update({ status: "submitted", submitted_at: new Date().toISOString(), submission_url: submissionUrl })
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
      status: "submitted",
      submitted_at: new Date().toISOString(),
      submission_url: submissionUrl,
    })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as HomeworkAssignment;
}
