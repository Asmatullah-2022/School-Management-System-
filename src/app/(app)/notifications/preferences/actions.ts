"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { updateNotificationPreferences } from "@/lib/data/notification-preferences";

export async function updateNotificationPreferencesAction(formData: FormData) {
  const session = await getSession();
  if (!session) redirect("/login");

  await updateNotificationPreferences(session.profile.id, session.school.id, {
    homework: formData.get("homework") === "on",
    events: formData.get("events") === "on",
    notices: formData.get("notices") === "on",
    fee_reminders: formData.get("fee_reminders") === "on",
    exam_notifications: formData.get("exam_notifications") === "on",
    result_notifications: formData.get("result_notifications") === "on",
  });
  revalidatePath("/notifications/preferences");
}
