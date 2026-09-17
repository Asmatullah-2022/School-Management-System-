import "server-only";
import { isDemoMode } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import { demoStore } from "@/lib/demo/store";
import type { Student } from "@/types/database";

export async function listStudents(): Promise<Student[]> {
  if (isDemoMode()) return demoStore.listStudents();

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("students")
    .select("*")
    .neq("status", "archived")
    .order("full_name");
  if (error) throw error;
  return data as Student[];
}

export async function getStudent(id: string): Promise<Student | undefined> {
  if (isDemoMode()) return demoStore.getStudent(id);

  const supabase = await createClient();
  const { data, error } = await supabase.from("students").select("*").eq("id", id).single();
  if (error) return undefined;
  return data as Student;
}

export type NewStudent = Omit<Student, "id" | "school_id" | "status">;

export async function createStudent(input: NewStudent, schoolId: string): Promise<Student> {
  if (isDemoMode()) return demoStore.createStudent(input);

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("students")
    .insert({ ...input, school_id: schoolId, status: "active" })
    .select()
    .single();
  if (error) throw error;
  return data as Student;
}

export async function updateStudent(id: string, input: Partial<Student>): Promise<Student | undefined> {
  if (isDemoMode()) return demoStore.updateStudent(id, input);

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("students")
    .update(input)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as Student;
}

export async function archiveStudent(id: string): Promise<boolean> {
  if (isDemoMode()) return demoStore.deleteStudent(id);

  const supabase = await createClient();
  const { error } = await supabase.from("students").update({ status: "archived" }).eq("id", id);
  return !error;
}
