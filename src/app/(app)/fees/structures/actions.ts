"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSession, isFinanceStaff } from "@/lib/auth/session";
import { createFeeStructure, updateFeeStructure, duplicateFeeStructure } from "@/lib/data/finance";
import type { FeeStructure } from "@/types/database";

function readForm(formData: FormData) {
  return {
    name: String(formData.get("name") ?? "").trim(),
    fee_type: String(formData.get("fee_type") ?? "tuition"),
    frequency: (formData.get("frequency") as FeeStructure["frequency"]) ?? "monthly",
    amount: Number(formData.get("amount") ?? 0),
    class_id: String(formData.get("class_id") ?? "").trim() || null,
  };
}

export async function createFeeStructureAction(formData: FormData) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!isFinanceStaff(session.profile.role)) return { error: "Only Finance staff can create fee structures." };

  const input = readForm(formData);
  if (!input.name) return { error: "Fee name is required." };
  if (input.amount <= 0) return { error: "Amount must be greater than zero." };

  try {
    await createFeeStructure({ ...input, school_id: session.school.id, created_by: session.profile.id });
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Could not create fee structure." };
  }
  revalidatePath("/fees/structures");
  redirect("/fees/structures");
}

export async function updateFeeStructureAction(id: string, formData: FormData) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!isFinanceStaff(session.profile.role)) return { error: "Only Finance staff can edit fee structures." };

  const input = readForm(formData);
  if (!input.name) return { error: "Fee name is required." };
  if (input.amount <= 0) return { error: "Amount must be greater than zero." };

  try {
    await updateFeeStructure(id, input);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Could not update fee structure." };
  }
  revalidatePath("/fees/structures");
  redirect("/fees/structures");
}

export async function duplicateFeeStructureAction(id: string) {
  const session = await getSession();
  if (!session || !isFinanceStaff(session.profile.role)) return;
  await duplicateFeeStructure(id);
  revalidatePath("/fees/structures");
}

export async function toggleFeeStructureAction(id: string, isActive: boolean) {
  const session = await getSession();
  if (!session || !isFinanceStaff(session.profile.role)) return;
  await updateFeeStructure(id, { is_active: isActive });
  revalidatePath("/fees/structures");
}
