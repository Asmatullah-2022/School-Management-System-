import "server-only";
import { isDemoMode } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import { demoTeachers, demoStudents, demoParentChildren } from "@/lib/demo/data";

/** Resolves the teachers.id row linked to a signed-in teacher's profile. */
export async function getTeacherIdForProfile(profileId: string): Promise<string | undefined> {
  if (isDemoMode()) return demoTeachers.find((t) => t.profile_id === profileId)?.id;

  const supabase = await createClient();
  const { data } = await supabase.from("teachers").select("id").eq("profile_id", profileId).maybeSingle();
  return data?.id;
}

/** Resolves the students.id row linked to a signed-in student's profile. */
export async function getStudentIdForProfile(profileId: string): Promise<string | undefined> {
  if (isDemoMode()) return demoStudents.find((s) => s.profile_id === profileId)?.id;

  const supabase = await createClient();
  const { data } = await supabase.from("students").select("id").eq("profile_id", profileId).maybeSingle();
  return data?.id;
}

/** Resolves the students.id rows for a signed-in parent's children. */
export async function getChildStudentIdsForProfile(profileId: string): Promise<string[]> {
  if (isDemoMode()) return demoParentChildren[profileId] ?? [];

  const supabase = await createClient();
  const { data: parent } = await supabase.from("parents").select("id").eq("profile_id", profileId).maybeSingle();
  if (!parent) return [];
  const { data } = await supabase.from("student_parents").select("student_id").eq("parent_id", parent.id);
  return (data ?? []).map((row) => row.student_id as string);
}

/** Resolves the profile ids (student's own account + any linked parents') that
 * should receive a notification about a given student — used by fee reminders. */
export async function getGuardianProfileIdsForStudent(studentId: string): Promise<string[]> {
  if (isDemoMode()) {
    const ownProfileId = demoStudents.find((s) => s.id === studentId)?.profile_id;
    const parentProfileIds = Object.entries(demoParentChildren)
      .filter(([, children]) => children.includes(studentId))
      .map(([profileId]) => profileId);
    return [ownProfileId, ...parentProfileIds].filter(Boolean) as string[];
  }

  const supabase = await createClient();
  const { data: student } = await supabase.from("students").select("profile_id").eq("id", studentId).maybeSingle();
  const { data: links } = await supabase.from("student_parents").select("parent_id").eq("student_id", studentId);
  const parentIds = (links ?? []).map((l) => l.parent_id as string);
  let parentProfileIds: string[] = [];
  if (parentIds.length > 0) {
    const { data: parents } = await supabase.from("parents").select("profile_id").in("id", parentIds);
    parentProfileIds = (parents ?? []).map((p) => p.profile_id).filter(Boolean) as string[];
  }
  return [student?.profile_id, ...parentProfileIds].filter(Boolean) as string[];
}
