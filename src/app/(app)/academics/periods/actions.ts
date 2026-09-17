"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSession, isSchoolAdmin } from "@/lib/auth/session";
import { archivePeriod, createPeriod, updatePeriod, type NewPeriod } from "@/lib/data/periods";

function readPeriodForm(formData: FormData): NewPeriod {
  return {
    period_number: Number(formData.get("period_number") ?? 0),
    name: String(formData.get("name") ?? "").trim(),
    start_time: String(formData.get("start_time") ?? ""),
    end_time: String(formData.get("end_time") ?? ""),
    is_break: formData.get("is_break") === "on",
    sort_order: Number(formData.get("period_number") ?? 0),
  };
}

function validate(input: NewPeriod): string | null {
  if (!input.name) return "Period name is required.";
  if (!input.period_number || input.period_number < 1) return "Period number must be at least 1.";
  if (!input.start_time || !input.end_time) return "Start and end time are required.";
  if (input.start_time >= input.end_time) return "End time must be after start time.";
  return null;
}

export async function createPeriodAction(formData: FormData) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!isSchoolAdmin(session.profile.role)) return { error: "Only administrators can manage periods." };

  const input = readPeriodForm(formData);
  const validationError = validate(input);
  if (validationError) return { error: validationError };

  try {
    await createPeriod(input, session.school.id);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Could not create period." };
  }
  revalidatePath("/academics/periods");
  redirect("/academics/periods");
}

export async function updatePeriodAction(id: string, formData: FormData) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!isSchoolAdmin(session.profile.role)) return { error: "Only administrators can manage periods." };

  const input = readPeriodForm(formData);
  const validationError = validate(input);
  if (validationError) return { error: validationError };

  try {
    await updatePeriod(id, input);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Could not update period." };
  }
  revalidatePath("/academics/periods");
  redirect("/academics/periods");
}

export async function archivePeriodAction(id: string) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!isSchoolAdmin(session.profile.role)) return;

  await archivePeriod(id);
  revalidatePath("/academics/periods");
}
