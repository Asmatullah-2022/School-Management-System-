"use server";

import { getSession, isFinanceStaff } from "@/lib/auth/session";
import { getFee } from "@/lib/data/finance";
import { getGuardianProfileIdsForStudent } from "@/lib/data/people";
import { createNotification } from "@/lib/data/notifications";

/** Delivers a fee reminder as a real in-app notification only. This system
 * has no SMS/WhatsApp/email integration — we never claim to send one. */
export async function sendFeeReminderAction(feeId: string): Promise<{ error?: string; success?: string }> {
  const session = await getSession();
  if (!session) return { error: "Not signed in." };
  if (!isFinanceStaff(session.profile.role)) return { error: "Only Finance staff can send fee reminders." };

  const fee = await getFee(feeId);
  if (!fee) return { error: "Fee charge not found." };

  const recipients = await getGuardianProfileIdsForStudent(fee.student_id);
  if (recipients.length === 0) return { error: "This student has no linked portal account or guardian to notify." };

  for (const profileId of recipients) {
    await createNotification({
      schoolId: session.school.id,
      profileId,
      title: "Fee Payment Reminder",
      message: `"${fee.title}" has an outstanding balance of PKR ${fee.balance.toLocaleString()}, due ${new Date(fee.due_date).toLocaleDateString()}.`,
      type: "fee_reminder",
      link: `/fees/account/${fee.student_id}`,
    });
  }

  return { success: `Reminder sent to ${recipients.length} account(s) in-app.` };
}
