import "server-only";
import { isDemoMode } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import { demoStore } from "@/lib/demo/store";
import type { Exam } from "@/types/database";

export async function listExams(): Promise<Exam[]> {
  if (isDemoMode()) return demoStore.listExams();

  const supabase = await createClient();
  const { data, error } = await supabase.from("exams").select("*").neq("status", "archived").order("start_date", { ascending: false });
  if (error) throw error;
  return data as Exam[];
}

export async function getExam(id: string): Promise<Exam | undefined> {
  if (isDemoMode()) return demoStore.getExam(id);

  const supabase = await createClient();
  const { data, error } = await supabase.from("exams").select("*").eq("id", id).single();
  if (error) return undefined;
  return data as Exam;
}

export type NewExam = Omit<Exam, "id" | "school_id" | "status" | "created_by" | "published_at" | "published_by">;

export async function createExam(input: NewExam, schoolId: string, createdBy: string): Promise<Exam> {
  if (isDemoMode()) return demoStore.createExam(input, createdBy);

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("exams")
    .insert({ ...input, school_id: schoolId, status: "draft", created_by: createdBy })
    .select()
    .single();
  if (error) throw error;
  return data as Exam;
}

export async function updateExam(id: string, input: Partial<Exam>): Promise<Exam | undefined> {
  if (isDemoMode()) return demoStore.updateExam(id, input);

  const supabase = await createClient();
  const { data, error } = await supabase.from("exams").update(input).eq("id", id).select().single();
  if (error) throw error;
  return data as Exam;
}

export async function archiveExam(id: string): Promise<boolean> {
  if (isDemoMode()) return demoStore.archiveExam(id);

  const supabase = await createClient();
  const { error } = await supabase.from("exams").update({ status: "archived" }).eq("id", id);
  return !error;
}

/** Publishes an exam: requires every mark under it to be verified first,
 * flips those marks (and the exam) to published, and (re)computes results. */
export async function publishExam(id: string, publishedBy: string): Promise<Exam> {
  if (isDemoMode()) return demoStore.publishExam(id, publishedBy);

  const supabase = await createClient();
  const { data: examSubjects } = await supabase.from("exam_subjects").select("id").eq("exam_id", id);
  const ids = (examSubjects ?? []).map((r) => r.id as string);
  if (ids.length > 0) {
    const { data: marks } = await supabase.from("marks").select("id, status").in("exam_subject_id", ids);
    const notVerified = (marks ?? []).filter((m) => m.status !== "verified" && m.status !== "published");
    if (notVerified.length > 0) {
      throw new Error("All marks must be verified before this exam can be published.");
    }
    const now = new Date().toISOString();
    await supabase
      .from("marks")
      .update({ status: "published", published_at: now })
      .in("exam_subject_id", ids)
      .eq("status", "verified");
  }

  const { data, error } = await supabase
    .from("exams")
    .update({ status: "published", published_at: new Date().toISOString(), published_by: publishedBy })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;

  const { computeAndStoreResultsForExam } = await import("@/lib/data/results");
  await computeAndStoreResultsForExam(id);

  return data as Exam;
}
