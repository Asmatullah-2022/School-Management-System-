import "server-only";
import { isDemoMode } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import { demoStore } from "@/lib/demo/store";
import type { Notification } from "@/types/database";

export async function listNotificationsFor(profileId: string): Promise<Notification[]> {
  if (isDemoMode()) return demoStore.listNotificationsFor(profileId);
  const supabase = await createClient();
  const { data, error } = await supabase.from("notifications").select("*").eq("profile_id", profileId).order("created_at", { ascending: false });
  if (error) throw error;
  return data as Notification[];
}

/** Creates a real in-app notification. There is no SMS/WhatsApp integration
 * in this system — reminders are delivered only inside the app's own
 * notification list, never claimed as sent via an external channel. */
export async function createNotification(input: {
  schoolId: string;
  profileId: string;
  title: string;
  message?: string;
  type: string;
  link?: string;
}): Promise<Notification> {
  if (isDemoMode()) {
    return demoStore.createNotification({
      profile_id: input.profileId,
      title: input.title,
      message: input.message ?? null,
      type: input.type,
      link: input.link ?? null,
    });
  }
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("notifications")
    .insert({ school_id: input.schoolId, profile_id: input.profileId, title: input.title, message: input.message, type: input.type, link: input.link })
    .select()
    .single();
  if (error) throw error;
  return data as Notification;
}
