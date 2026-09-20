import "server-only";
import { isDemoMode } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import { demoStore } from "@/lib/demo/store";
import type { School } from "@/types/database";

/** Updates the school's branding/document profile (logo, contact info,
 * headteacher/principal, signature, stamp, footer, certificate prefix).
 * RLS (`schools_admin_update`) already restricts this to an admin of
 * their own school — see 0002_rls.sql. */
export async function updateSchoolSettings(schoolId: string, data: Partial<Omit<School, "id" | "school_code">>): Promise<School> {
  if (isDemoMode()) return demoStore.updateSchool(data);
  const supabase = await createClient();
  const { data: updated, error } = await supabase.from("schools").update(data).eq("id", schoolId).select().single();
  if (error) throw new Error(error.message);
  return updated as School;
}
