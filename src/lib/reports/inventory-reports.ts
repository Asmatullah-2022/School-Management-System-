import type { InventoryCategory, InventoryItem, InventoryTransaction } from "@/types/database";

export interface InventoryDataset {
  items: InventoryItem[];
  transactions: InventoryTransaction[];
  categories: InventoryCategory[];
}

export function buildInventorySummary(data: InventoryDataset) {
  return data.items.map((i) => ({
    assetCode: i.asset_id,
    name: i.name,
    category: i.category ?? "—",
    quantity: i.quantity,
    available: i.available_quantity,
    unitCost: i.cost ?? 0,
    totalValue: (i.cost ?? 0) * i.quantity,
    condition: i.condition,
    status: i.status,
  }));
}

function transactionRows(data: InventoryDataset, type: InventoryTransaction["transaction_type"]) {
  return data.transactions
    .filter((t) => t.transaction_type === type)
    .map((t) => ({
      item: data.items.find((i) => i.id === t.item_id)?.name ?? "Unknown item",
      quantity: t.quantity,
      date: t.created_at ?? "",
      reason: t.reason ?? "—",
      assignedTo: t.assigned_to_label ?? "—",
    }));
}

export const buildStockInReport = (data: InventoryDataset) => transactionRows(data, "stock_in");
export const buildStockOutReport = (data: InventoryDataset) => transactionRows(data, "stock_out");
export const buildRepairReport = (data: InventoryDataset) => transactionRows(data, "repair");

export function buildAssetAssignmentReport(data: InventoryDataset) {
  return data.transactions
    .filter((t) => t.transaction_type === "assignment")
    .map((t) => ({
      item: data.items.find((i) => i.id === t.item_id)?.name ?? "Unknown item",
      quantity: t.quantity,
      assignedToType: t.assigned_to_type ?? "—",
      assignedTo: t.assigned_to_label ?? "—",
      date: t.created_at ?? "",
      reason: t.reason ?? "—",
    }));
}

export function buildLowStockReport(data: InventoryDataset) {
  return data.items
    .filter((i) => i.minimum_stock != null && i.available_quantity < i.minimum_stock)
    .map((i) => ({
      assetCode: i.asset_id,
      name: i.name,
      available: i.available_quantity,
      minimumStock: i.minimum_stock ?? 0,
      shortfall: (i.minimum_stock ?? 0) - i.available_quantity,
    }));
}

export function buildDamagedItemsReport(data: InventoryDataset) {
  return data.items
    .filter((i) => i.condition === "damaged")
    .map((i) => ({ assetCode: i.asset_id, name: i.name, category: i.category ?? "—", location: i.location ?? "—", quantity: i.quantity }));
}

export function buildUnderRepairReport(data: InventoryDataset) {
  return data.items
    .filter((i) => i.condition === "under_repair")
    .map((i) => ({ assetCode: i.asset_id, name: i.name, category: i.category ?? "—", location: i.location ?? "—", quantity: i.quantity }));
}

export function buildDisposedItemsReport(data: InventoryDataset) {
  return data.items
    .filter((i) => i.status === "disposed")
    .map((i) => ({ assetCode: i.asset_id, name: i.name, category: i.category ?? "—", disposedQuantity: data.transactions.filter((t) => t.item_id === i.id && t.transaction_type === "dispose").reduce((s, t) => s + t.quantity, 0) }));
}

export function buildAssetValueReport(data: InventoryDataset) {
  const rows = data.items.map((i) => ({ category: i.category ?? "Uncategorized", value: (i.cost ?? 0) * i.quantity }));
  const byCategory = new Map<string, number>();
  for (const r of rows) byCategory.set(r.category, (byCategory.get(r.category) ?? 0) + r.value);
  return Array.from(byCategory.entries()).map(([category, value]) => ({ category, value }));
}
