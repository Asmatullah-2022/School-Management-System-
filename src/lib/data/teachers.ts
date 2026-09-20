import "server-only";
import { isDemoMode } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import { demoStore } from "@/lib/demo/store";
import type { Teacher, TeacherDirectoryEntry } from "@/types/database";

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

// PII-free teacher list for display-only contexts (timetable, printable
// schedules) that are reachable by parent/student roles. Selects only
// id/full_name/status at the database level, so CNIC/mobile/email/address
// never leave the server for these pages.
export async function listTeacherNames(): Promise<TeacherDirectoryEntry[]> {
  if (isDemoMode()) return demoStore.listTeachers().map(({ id, full_name, status }) => ({ id, full_name, status }));

  // Queries the `teacher_directory` view (migration 0010), not the
  // `teachers` table directly — the table's own SELECT policy is
  // staff-only, so a parent/student session can only ever see this
  // safe, PII-free projection (id/full_name/status), never CNIC/mobile/
  // email/address, no matter what columns are requested here.
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("teacher_directory")
    .select("id, full_name, status")
    .neq("status", "archived")
    .order("full_name");
  if (error) throw error;
  return data as TeacherDirectoryEntry[];
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
