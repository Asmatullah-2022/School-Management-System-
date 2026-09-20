import "server-only";
import { isDemoMode } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import { demoStore } from "@/lib/demo/store";

/** Records one row in the shared audit_logs table. Best-effort: a logging
 * failure must never block the action it's describing, so callers should
 * not await-throw on this — errors are swallowed and reported to the
 * server console instead. */
export async function recordAuditLog(input: {
  schoolId: string;
  profileId?: string | null;
  action: string;
  targetTable?: string;
  targetId?: string;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  try {
    if (isDemoMode()) {
      demoStore.createAuditLog({
        profile_id: input.profileId ?? null,
        action: input.action,
        target_table: input.targetTable ?? null,
        target_id: input.targetId ?? null,
        metadata: input.metadata ?? {},
      });
      return;
    }
    const supabase = await createClient();
    await supabase.from("audit_logs").insert({
      school_id: input.schoolId,
      profile_id: input.profileId,
      action: input.action,
      target_table: input.targetTable,
      target_id: input.targetId,
      metadata: input.metadata ?? {},
    });
  } catch (err) {
    console.error("Failed to record audit log:", err);
  }
}
