import "server-only";
import { isDemoMode } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import { demoUsers } from "@/lib/demo/data";
import type { Profile } from "@/types/database";

/** All profiles in the signed-in user's school — used to resolve "Collected
 * By" / "Approved By" names in finance reports. RLS already limits a real
 * Supabase query to same-school staff (see profiles_self_select policy). */
export async function listProfiles(): Promise<Profile[]> {
  if (isDemoMode()) return demoUsers.map((u) => u.profile);
  const supabase = await createClient();
  const { data, error } = await supabase.from("profiles").select("*");
  if (error) throw error;
  return data as Profile[];
}
