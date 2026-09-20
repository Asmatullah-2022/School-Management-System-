import "server-only";
import { isDemoMode } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import { demoStore } from "@/lib/demo/store";
import type { InventoryCategory, InventoryItem, InventoryLocation, InventoryTransaction } from "@/types/database";

export async function listInventoryCategories(): Promise<InventoryCategory[]> {
  if (isDemoMode()) return demoStore.listInventoryCategories();
  const supabase = await createClient();
  const { data, error } = await supabase.from("inventory_categories").select("*").order("name");
  if (error) throw error;
  return data as InventoryCategory[];
}

export async function createInventoryCategory(schoolId: string, name: string): Promise<InventoryCategory> {
  if (isDemoMode()) return demoStore.createInventoryCategory(name);
  const supabase = await createClient();
  const { data, error } = await supabase.from("inventory_categories").insert({ school_id: schoolId, name }).select().single();
  if (error) throw new Error(error.message);
  return data as InventoryCategory;
}

export async function listInventoryLocations(): Promise<InventoryLocation[]> {
  if (isDemoMode()) return demoStore.listInventoryLocations();
  const supabase = await createClient();
  const { data, error } = await supabase.from("inventory_locations").select("*").order("name");
  if (error) throw error;
  return data as InventoryLocation[];
}

export async function createInventoryLocation(schoolId: string, name: string): Promise<InventoryLocation> {
  if (isDemoMode()) return demoStore.createInventoryLocation(name);
  const supabase = await createClient();
  const { data, error } = await supabase.from("inventory_locations").insert({ school_id: schoolId, name }).select().single();
  if (error) throw new Error(error.message);
  return data as InventoryLocation;
}

export async function listInventoryItems(): Promise<InventoryItem[]> {
  if (isDemoMode()) return demoStore.listInventoryItems();
  const supabase = await createClient();
  const { data, error } = await supabase.from("inventory").select("*").order("name");
  if (error) throw error;
  return data as InventoryItem[];
}

export async function getInventoryItem(id: string): Promise<InventoryItem | undefined> {
  if (isDemoMode()) return demoStore.getInventoryItem(id);
  const supabase = await createClient();
  const { data, error } = await supabase.from("inventory").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return (data as InventoryItem) ?? undefined;
}

export async function createInventoryItem(input: Omit<InventoryItem, "id" | "school_id"> & { schoolId: string }): Promise<InventoryItem> {
  const { schoolId, ...rest } = input;
  if (isDemoMode()) return demoStore.createInventoryItem(rest);
  const supabase = await createClient();
  const { data, error } = await supabase.from("inventory").insert({ school_id: schoolId, ...rest }).select().single();
  if (error) throw new Error(error.message);
  return data as InventoryItem;
}

export async function updateInventoryItem(id: string, data: Partial<InventoryItem>): Promise<InventoryItem | undefined> {
  if (isDemoMode()) return demoStore.updateInventoryItem(id, data);
  const supabase = await createClient();
  const { data: updated, error } = await supabase.from("inventory").update(data).eq("id", id).select().maybeSingle();
  if (error) throw new Error(error.message);
  return (updated as InventoryItem) ?? undefined;
}

export async function listInventoryTransactions(itemId?: string): Promise<InventoryTransaction[]> {
  if (isDemoMode()) return demoStore.listInventoryTransactions(itemId);
  const supabase = await createClient();
  let query = supabase.from("inventory_transactions").select("*").order("created_at", { ascending: false });
  if (itemId) query = query.eq("item_id", itemId);
  const { data, error } = await query;
  if (error) throw error;
  return data as InventoryTransaction[];
}

/** Records a stock movement/assignment/return/transfer/repair/dispose
 * entry. This is an append-only ledger — see the `apply_inventory_transaction`
 * DB trigger (Supabase) / `createInventoryTransaction` (demo mode), which
 * apply the quantity effect and reject anything that would make available
 * or total quantity negative. There is no update/delete path: a mistaken
 * entry is corrected by inserting a new, opposite transaction. */
export async function createInventoryTransaction(
  input: Omit<InventoryTransaction, "id" | "school_id" | "created_at"> & { schoolId: string }
): Promise<InventoryTransaction> {
  const { schoolId, ...rest } = input;
  if (isDemoMode()) return demoStore.createInventoryTransaction(rest);
  const supabase = await createClient();
  const { data, error } = await supabase.from("inventory_transactions").insert({ school_id: schoolId, ...rest }).select().single();
  if (error) throw new Error(error.message);
  return data as InventoryTransaction;
}
