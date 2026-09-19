import "server-only";
import { createNotification } from "@/lib/data/notifications";
import { getNotificationPreferences } from "@/lib/data/notification-preferences";
import type { NotificationPreferences } from "@/types/database";

/** The Notification Center's fixed category list (spec Part B §11). The
 * notification's `type` column is always set to one of these — every
 * trigger in the app funnels through here so the center's category
 * filter and this list can never drift apart. */
export type NotificationCategory =
  | "attendance"
  | "homework"
  | "exams"
  | "results"
  | "fees"
  | "leave"
  | "notices"
  | "events"
  | "system";

// Categories a user can mute via /notifications/preferences. Attendance,
// leave, and system notifications are always considered critical/school-
// relevant and are never suppressed.
const PREFERENCE_KEY: Partial<Record<NotificationCategory, keyof NotificationPreferences>> = {
  homework: "homework",
  events: "events",
  notices: "notices",
  fees: "fee_reminders",
  exams: "exam_notifications",
  results: "result_notifications",
};

/** The single funnel every Phase 7 notification trigger uses. Tied to a
 * real event (homework published, leave decided, notice posted, …) —
 * never called just because a page rendered — so notifications can't be
 * duplicated by repeated page loads. Respects the recipient's own
 * notification preferences for non-critical categories. */
export async function createNotificationForUser(
  profileId: string,
  schoolId: string,
  input: { title: string; message?: string; link?: string; category: NotificationCategory }
): Promise<void> {
  const prefKey = PREFERENCE_KEY[input.category];
  if (prefKey) {
    const prefs = await getNotificationPreferences(profileId);
    if (!prefs[prefKey]) return; // muted by the recipient — skip silently
  }

  await createNotification({
    schoolId,
    profileId,
    title: input.title,
    message: input.message,
    type: input.category,
    link: input.link,
  });
}
