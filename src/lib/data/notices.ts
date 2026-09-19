import "server-only";
import { isDemoMode } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import { demoStore } from "@/lib/demo/store";
import type { NoticeAcknowledgement, NoticeRecord } from "@/types/database";

export async function createNotice(input: Omit<NoticeRecord, "id" | "school_id"> & { schoolId: string }): Promise<NoticeRecord> {
  const { schoolId, ...rest } = input;
  if (isDemoMode()) return demoStore.createNotice(rest);
  const supabase = await createClient();
  const { data, error } = await supabase.from("notices").insert({ school_id: schoolId, ...rest }).select().single();
  if (error) throw new Error(error.message);
  return data as NoticeRecord;
}

export async function listNoticeAcknowledgements(noticeId?: string): Promise<NoticeAcknowledgement[]> {
  if (isDemoMode()) return demoStore.listNoticeAcknowledgements(noticeId);
  const supabase = await createClient();
  let query = supabase.from("notice_acknowledgements").select("*");
  if (noticeId) query = query.eq("notice_id", noticeId);
  const { data, error } = await query;
  if (error) throw error;
  return data as NoticeAcknowledgement[];
}

/** The only sanctioned way to acknowledge a notice — always the caller's
 * own profile_id; RLS additionally rejects acknowledging on someone
 * else's behalf. */
export async function acknowledgeNotice(noticeId: string, profileId: string, schoolId: string): Promise<NoticeAcknowledgement> {
  if (isDemoMode()) return demoStore.acknowledgeNotice(noticeId, profileId);
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("notice_acknowledgements")
    .upsert({ school_id: schoolId, notice_id: noticeId, profile_id: profileId }, { onConflict: "notice_id,profile_id" })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as NoticeAcknowledgement;
}
