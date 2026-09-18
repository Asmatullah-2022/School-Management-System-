"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSession, isFinanceStaff } from "@/lib/auth/session";
import { recordRefund } from "@/lib/data/finance";

export async function recordRefundAction(formData: FormData): Promise<{ error?: string } | void> {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!isFinanceStaff(session.profile.role)) return { error: "Only Finance staff can issue refunds." };

  const paymentId = String(formData.get("payment_id") ?? "");
  const feeId = String(formData.get("fee_id") ?? "");
  const studentId = String(formData.get("student_id") ?? "");
  const amount = Number(formData.get("amount") ?? 0);
  const reason = String(formData.get("reason") ?? "").trim();

  if (!paymentId || !feeId || !studentId) return { error: "Select a payment and the charge to refund against." };
  if (amount <= 0) return { error: "Refund amount must be greater than zero." };
  if (!reason) return { error: "A reason is required to issue a refund." };

  try {
    await recordRefund({ schoolId: session.school.id, paymentId, feeId, studentId, amount, reason, refundedBy: session.profile.id });
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Could not process refund." };
  }
  revalidatePath("/fees/refunds");
  revalidatePath("/fees/payments");
  redirect("/fees/refunds");
}
