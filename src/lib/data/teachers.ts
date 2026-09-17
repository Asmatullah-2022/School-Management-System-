import "server-only";
import { isDemoMode } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import { demoStore } from "@/lib/demo/store";
import type { Teacher } from "@/types/database";

export async function listTeachers(): Promise<Teacher[]> {
  if (isDemoMode()) return demoStore.listTeachers();

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("teachers")
    .select("*")
    .neq("status", "archived")
    .order("full_name");
  if (error) throw error;
  return data as Teacher[];
}

export async function getTeacher(id: string): Promise<Teacher | undefined> {
  if (isDemoMode()) return demoStore.getTeacher(id);

  const supabase = await createClient();
  const { data, error } = await supabase.from("teachers").select("*").eq("id", id).single();
  if (error) return undefined;
  return data as Teacher;
}

export type NewTeacher = Omit<Teacher, "id" | "school_id" | "status">;

export async function createTeacher(input: NewTeacher, schoolId: string): Promise<Teacher> {
  if (isDemoMode()) return demoStore.createTeacher(input);

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("teachers")
    .insert({ ...input, school_id: schoolId, status: "active" })
    .select()
    .single();
  if (error) throw error;
  return data as Teacher;
}

export async function archiveTeacher(id: string): Promise<boolean> {
  if (isDemoMode()) return demoStore.deleteTeacher(id);

  const supabase = await createClient();
  const { error } = await supabase.from("teachers").update({ status: "archived" }).eq("id", id);
  return !error;
}
