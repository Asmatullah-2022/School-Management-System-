"use server";

import { getSession, isFinanceStaff } from "@/lib/auth/session";
import { recordPayment } from "@/lib/data/finance";
import { getGuardianProfileIdsForStudent } from "@/lib/data/people";
import { createNotificationForUser } from "@/lib/notifications/create";

export async function recordPaymentAction(
  formData: FormData
): Promise<{ error?: string; paymentId?: string; receiptNumber?: string }> {
  const session = await getSession();
  if (!session) return { error: "Not signed in." };
  if (!isFinanceStaff(session.profile.role)) return { error: "Only Finance staff can collect payments." };

  const studentId = String(formData.get("student_id") ?? "");
  const method = String(formData.get("method") ?? "cash");
  const notes = String(formData.get("notes") ?? "").trim() || undefined;
  const allocationsRaw = String(formData.get("allocations") ?? "[]");

  if (!studentId) return { error: "Select a student." };

  let allocations: { feeId: string; amount: number }[];
  try {
    allocations = JSON.parse(allocationsRaw);
  } catch {
    return { error: "Invalid allocation data." };
  }
  allocations = allocations.filter((a) => a.amount > 0);
  if (allocations.length === 0) return { error: "Enter an amount against at least one fee charge." };

  try {
    const payment = await recordPayment({
      schoolId: session.school.id,
      studentId,
      method,
      allocations,
      notes,
      receivedBy: session.profile.id,
    });

    const recipients = await getGuardianProfileIdsForStudent(studentId);
    for (const profileId of recipients) {
      await createNotificationForUser(profileId, session.school.id, {
        title: "Payment Received",
        message: `Payment of PKR ${payment.amount_paid.toLocaleString()} recorded — receipt ${payment.receipt_number}.`,
        link: `/print/receipt/${payment.id}`,
        category: "fees",
      });
    }

    return { paymentId: payment.id, receiptNumber: payment.receipt_number };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Could not record payment." };
  }
}
