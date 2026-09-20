"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSession, isSchoolStaff } from "@/lib/auth/session";
import {
  createInventoryCategory,
  createInventoryLocation,
  createInventoryItem,
  updateInventoryItem,
  createInventoryTransaction,
  getInventoryItem,
} from "@/lib/data/inventory";
import { listProfiles } from "@/lib/data/profiles";
import { recordAuditLog } from "@/lib/audit/log";
import { createNotificationForUser } from "@/lib/notifications/create";
import type { InventoryAssignedToType, InventoryItem, InventoryTransactionType } from "@/types/database";

export async function createInventoryCategoryAction(formData: FormData): Promise<{ error?: string } | void> {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!isSchoolStaff(session.profile.role)) return { error: "Only staff can manage inventory categories." };
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { error: "Category name is required." };
  await createInventoryCategory(session.school.id, name);
  revalidatePath("/inventory/categories");
}

export async function createInventoryLocationAction(formData: FormData): Promise<{ error?: string } | void> {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!isSchoolStaff(session.profile.role)) return { error: "Only staff can manage inventory locations." };
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { error: "Location name is required." };
  await createInventoryLocation(session.school.id, name);
  revalidatePath("/inventory/locations");
}

export async function createInventoryItemAction(formData: FormData): Promise<{ error?: string } | void> {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!isSchoolStaff(session.profile.role)) return { error: "Only staff can manage inventory." };

  const assetId = String(formData.get("asset_id") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  if (!assetId || !name) return { error: "Asset code and item name are required." };
  const quantity = Math.max(0, Number(formData.get("quantity") ?? 0));

  let item: InventoryItem;
  try {
    item = await createInventoryItem({
      schoolId: session.school.id,
      asset_id: assetId,
      name,
      category: String(formData.get("category") ?? "").trim() || null,
      category_id: String(formData.get("category_id") ?? "") || null,
      description: String(formData.get("description") ?? "").trim() || null,
      quantity,
      available_quantity: quantity,
      purchase_date: String(formData.get("purchase_date") ?? "") || null,
      cost: formData.get("cost") ? Number(formData.get("cost")) : null,
      supplier: String(formData.get("supplier") ?? "").trim() || null,
      condition: (String(formData.get("condition") ?? "new")) as InventoryItem["condition"],
      location: String(formData.get("location") ?? "").trim() || null,
      location_id: String(formData.get("location_id") ?? "") || null,
      responsible_person: null,
      status: "active",
      warranty_expiry: String(formData.get("warranty_expiry") ?? "") || null,
      minimum_stock: formData.get("minimum_stock") ? Number(formData.get("minimum_stock")) : null,
      notes: String(formData.get("notes") ?? "").trim() || null,
      created_by: session.profile.id,
    });
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Could not add item." };
  }
  await recordAuditLog({ schoolId: session.school.id, profileId: session.profile.id, action: "inventory.item_added", targetTable: "inventory", targetId: item.id, metadata: { name } });
  revalidatePath("/inventory/items");
  redirect("/inventory/items");
}

export async function updateInventoryItemAction(id: string, formData: FormData): Promise<{ error?: string } | void> {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!isSchoolStaff(session.profile.role)) return { error: "Only staff can manage inventory." };

  try {
    await updateInventoryItem(id, {
      name: String(formData.get("name") ?? "").trim(),
      category: String(formData.get("category") ?? "").trim() || null,
      category_id: String(formData.get("category_id") ?? "") || null,
      description: String(formData.get("description") ?? "").trim() || null,
      purchase_date: String(formData.get("purchase_date") ?? "") || null,
      cost: formData.get("cost") ? Number(formData.get("cost")) : null,
      supplier: String(formData.get("supplier") ?? "").trim() || null,
      condition: (String(formData.get("condition") ?? "good")) as InventoryItem["condition"],
      location: String(formData.get("location") ?? "").trim() || null,
      location_id: String(formData.get("location_id") ?? "") || null,
      warranty_expiry: String(formData.get("warranty_expiry") ?? "") || null,
      minimum_stock: formData.get("minimum_stock") ? Number(formData.get("minimum_stock")) : null,
      notes: String(formData.get("notes") ?? "").trim() || null,
    });
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Could not update item." };
  }
  revalidatePath("/inventory/items");
  redirect("/inventory/items");
}

export async function createInventoryTransactionAction(itemId: string, formData: FormData): Promise<{ error?: string } | void> {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!isSchoolStaff(session.profile.role)) return { error: "Only staff can record inventory transactions." };

  const transactionType = String(formData.get("transaction_type") ?? "") as InventoryTransactionType;
  const quantity = Number(formData.get("quantity") ?? 0);
  if (!transactionType || quantity <= 0) return { error: "Transaction type and a positive quantity are required." };

  const assignedToType = (String(formData.get("assigned_to_type") ?? "") || null) as InventoryAssignedToType | null;
  const assignedToLabel = String(formData.get("assigned_to_label") ?? "").trim() || null;

  try {
    await createInventoryTransaction({
      schoolId: session.school.id,
      item_id: itemId,
      transaction_type: transactionType,
      quantity,
      from_location: String(formData.get("from_location") ?? "").trim() || null,
      to_location: String(formData.get("to_location") ?? "").trim() || null,
      assigned_to_type: assignedToType,
      assigned_to_id: String(formData.get("assigned_to_id") ?? "") || null,
      assigned_to_label: assignedToLabel,
      reason: String(formData.get("reason") ?? "").trim() || null,
      performed_by: session.profile.id,
    });
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Could not record this transaction." };
  }

  const actionLabelMap: Record<string, string> = {
    stock_in: "inventory.stock_in",
    stock_out: "inventory.stock_out",
    assignment: "inventory.asset_assigned",
    return: "inventory.asset_returned",
    transfer: "inventory.asset_transferred",
    adjustment: "inventory.adjustment",
    repair: "inventory.sent_for_repair",
    dispose: "inventory.disposed",
  };
  await recordAuditLog({ schoolId: session.school.id, profileId: session.profile.id, action: actionLabelMap[transactionType] ?? "inventory.transaction", targetTable: "inventory_transactions", targetId: itemId, metadata: { quantity, transactionType } });

  // Low-stock alert: notify admins once an item drops below its configured
  // minimum threshold. Routed through the "system" category since
  // inventory has no dedicated notification category of its own.
  const updatedItem = await getInventoryItem(itemId);
  if (updatedItem?.minimum_stock != null && updatedItem.available_quantity < updatedItem.minimum_stock) {
    const admins = (await listProfiles()).filter((p) => p.role === "school_admin" || p.role === "super_admin");
    for (const admin of admins) {
      await createNotificationForUser(admin.id, session.school.id, {
        title: "Low Stock Alert",
        message: `${updatedItem.name} (${updatedItem.asset_id}) is below its minimum stock level: ${updatedItem.available_quantity} available, minimum ${updatedItem.minimum_stock}.`,
        link: "/inventory/items",
        category: "system",
      });
    }
  }

  revalidatePath(`/inventory/items/${itemId}`);
  revalidatePath("/inventory/items");
  revalidatePath("/inventory");
}
