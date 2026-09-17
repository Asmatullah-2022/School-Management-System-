import "server-only";
import { isDemoMode } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import { demoStore } from "@/lib/demo/store";
import type { SubjectAssignment } from "@/types/database";

const DUPLICATE_MESSAGE =
  "This subject is already assigned to this class/section. Remove the existing assignment first.";

export async function listAssignments(): Promise<SubjectAssignment[]> {
  if (isDemoMode()) return demoStore.listAssignments();

  const supabase = await createClient();
  const { data, error } = await supabase.from("teacher_subjects").select("*").eq("status", "active");
  if (error) throw error;
  return data as SubjectAssignment[];
}

export async function getAssignment(id: string): Promise<SubjectAssignment | undefined> {
  if (isDemoMode()) return demoStore.getAssignment(id);

  const supabase = await createClient();
  const { data, error } = await supabase.from("teacher_subjects").select("*").eq("id", id).single();
  if (error) return undefined;
  return data as SubjectAssignment;
}

export type NewAssignment = Omit<SubjectAssignment, "id" | "school_id" | "status">;

export async function createAssignment(input: NewAssignment, schoolId: string): Promise<SubjectAssignment> {
  if (isDemoMode()) return demoStore.createAssignment(input);

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("teacher_subjects")
    .insert({ ...input, school_id: schoolId, status: "active" })
    .select()
    .single();
  if (error) {
    if (error.code === "23505") throw new Error(DUPLICATE_MESSAGE);
    throw error;
  }
  return data as SubjectAssignment;
}

export async function updateAssignment(
  id: string,
  input: Partial<SubjectAssignment>
): Promise<SubjectAssignment | undefined> {
  if (isDemoMode()) return demoStore.updateAssignment(id, input);

  const supabase = await createClient();
  const { data, error } = await supabase.from("teacher_subjects").update(input).eq("id", id).select().single();
  if (error) {
    if (error.code === "23505") throw new Error(DUPLICATE_MESSAGE);
    throw error;
  }
  return data as SubjectAssignment;
}

export async function deleteAssignment(id: string): Promise<boolean> {
  if (isDemoMode()) return demoStore.deleteAssignment(id);

  const supabase = await createClient();
  const { error } = await supabase.from("teacher_subjects").delete().eq("id", id);
  return !error;
}
