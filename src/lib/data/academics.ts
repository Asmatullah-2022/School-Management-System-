import "server-only";
import { isDemoMode } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import { demoStore } from "@/lib/demo/store";
import type { SchoolClass, Section } from "@/types/database";

export async function listClasses(): Promise<SchoolClass[]> {
  if (isDemoMode()) return demoStore.listClasses();
  const supabase = await createClient();
  const { data, error } = await supabase.from("classes").select("*").order("sort_order");
  if (error) throw error;
  return data as SchoolClass[];
}

export async function listSections(): Promise<Section[]> {
  if (isDemoMode()) return demoStore.listSections();
  const supabase = await createClient();
  const { data, error } = await supabase.from("sections").select("*");
  if (error) throw error;
  return data as Section[];
}
