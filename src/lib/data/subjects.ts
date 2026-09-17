import "server-only";
import { isDemoMode } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import { demoStore } from "@/lib/demo/store";
import type { Subject } from "@/types/database";

export async function listSubjects(): Promise<Subject[]> {
  if (isDemoMode()) return demoStore.listSubjects();

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("subjects")
    .select("*")
    .neq("status", "archived")
    .order("name");
  if (error) throw error;
  return data as Subject[];
}

export async function getSubject(id: string): Promise<Subject | undefined> {
  if (isDemoMode()) return demoStore.getSubject(id);

  const supabase = await createClient();
  const { data, error } = await supabase.from("subjects").select("*").eq("id", id).single();
  if (error) return undefined;
  return data as Subject;
}

export type NewSubject = Omit<Subject, "id" | "school_id" | "status">;

function duplicateSubjectError(name: string) {
  return new Error(`A subject named "${name}" already exists.`);
}

export async function createSubject(input: NewSubject, schoolId: string): Promise<Subject> {
  if (isDemoMode()) return demoStore.createSubject(input);

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("subjects")
    .insert({ ...input, school_id: schoolId, status: "active" })
    .select()
    .single();
  if (error) {
    if (error.code === "23505") throw duplicateSubjectError(input.name);
    throw error;
  }
  return data as Subject;
}

export async function updateSubject(id: string, input: Partial<Subject>): Promise<Subject | undefined> {
  if (isDemoMode()) return demoStore.updateSubject(id, input);

  const supabase = await createClient();
  const { data, error } = await supabase.from("subjects").update(input).eq("id", id).select().single();
  if (error) {
    if (error.code === "23505") throw duplicateSubjectError(input.name ?? "");
    throw error;
  }
  return data as Subject;
}

export async function archiveSubject(id: string): Promise<boolean> {
  if (isDemoMode()) return demoStore.archiveSubject(id);

  const supabase = await createClient();
  const { error } = await supabase.from("subjects").update({ status: "archived" }).eq("id", id);
  return !error;
}
