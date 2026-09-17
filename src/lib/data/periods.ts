import "server-only";
import { isDemoMode } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import { demoStore } from "@/lib/demo/store";
import type { Period } from "@/types/database";

export async function listPeriods(): Promise<Period[]> {
  if (isDemoMode()) return demoStore.listPeriods();

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("periods")
    .select("*")
    .neq("status", "archived")
    .order("sort_order");
  if (error) throw error;
  return data as Period[];
}

export type NewPeriod = Omit<Period, "id" | "school_id" | "status">;

function duplicatePeriodError(periodNumber: number) {
  return new Error(`Period number ${periodNumber} already exists.`);
}

export async function createPeriod(input: NewPeriod, schoolId: string): Promise<Period> {
  if (isDemoMode()) return demoStore.createPeriod(input);

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("periods")
    .insert({ ...input, school_id: schoolId, status: "active" })
    .select()
    .single();
  if (error) {
    if (error.code === "23505") throw duplicatePeriodError(input.period_number);
    throw error;
  }
  return data as Period;
}

export async function updatePeriod(id: string, input: Partial<Period>): Promise<Period | undefined> {
  if (isDemoMode()) return demoStore.updatePeriod(id, input);

  const supabase = await createClient();
  const { data, error } = await supabase.from("periods").update(input).eq("id", id).select().single();
  if (error) {
    if (error.code === "23505") throw duplicatePeriodError(input.period_number ?? 0);
    throw error;
  }
  return data as Period;
}

export async function archivePeriod(id: string): Promise<boolean> {
  if (isDemoMode()) return demoStore.archivePeriod(id);

  const supabase = await createClient();
  const { error } = await supabase.from("periods").update({ status: "archived" }).eq("id", id);
  return !error;
}
