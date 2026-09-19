import "server-only";
import { isDemoMode } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import { demoStore } from "@/lib/demo/store";
import type { NotificationPreferences } from "@/types/database";

const DEFAULTS: Omit<NotificationPreferences, "id" | "school_id" | "profile_id"> = {
  homework: true,
  events: true,
  notices: true,
  fee_reminders: true,
  exam_notifications: true,
  result_notifications: true,
};

export async function getNotificationPreferences(profileId: string): Promise<NotificationPreferences> {
  if (isDemoMode()) return demoStore.getNotificationPreferences(profileId);
  const supabase = await createClient();
  const { data } = await supabase.from("notification_preferences").select("*").eq("profile_id", profileId).maybeSingle();
  if (data) return data as NotificationPreferences;
  return { id: "default", school_id: "", profile_id: profileId, ...DEFAULTS };
}

export async function updateNotificationPreferences(
  profileId: string,
  schoolId: string,
  data: Partial<Omit<NotificationPreferences, "id" | "school_id" | "profile_id">>
): Promise<void> {
  if (isDemoMode()) {
    demoStore.updateNotificationPreferences(profileId, data);
    return;
  }
  const supabase = await createClient();
  const { error } = await supabase
    .from("notification_preferences")
    .upsert({ profile_id: profileId, school_id: schoolId, ...data }, { onConflict: "profile_id" });
  if (error) throw error;
}
