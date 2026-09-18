import "server-only";
import { isDemoMode } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import { demoStore } from "@/lib/demo/store";
import type { GradeBand } from "@/types/database";

export async function updateGradingSystem(bands: GradeBand[], schoolId: string): Promise<GradeBand[]> {
  if (isDemoMode()) {
    const school = demoStore.updateGradingSystem(bands);
    return school.grading_system ?? [];
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("schools")
    .update({ grading_system: bands })
    .eq("id", schoolId)
    .select("grading_system")
    .single();
  if (error) throw error;
  return (data?.grading_system as GradeBand[]) ?? [];
}
