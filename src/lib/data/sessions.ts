import "server-only";
import { isDemoMode } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import { demoSchool } from "@/lib/demo/data";
import type { AcademicSession } from "@/types/database";

export async function getCurrentAcademicSession(): Promise<AcademicSession | undefined> {
  if (isDemoMode()) {
    return {
      id: "session-current",
      school_id: demoSchool.id,
      name: "2025-2026",
      start_date: "2025-04-01",
      end_date: "2026-03-31",
      is_current: true,
    };
  }

  const supabase = await createClient();
  const { data } = await supabase.from("academic_sessions").select("*").eq("is_current", true).maybeSingle();
  return data ?? undefined;
}
