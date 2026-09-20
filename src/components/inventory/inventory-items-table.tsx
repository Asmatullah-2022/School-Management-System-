"use client";

import Link from "next/link";
import { DataTable, type Column } from "@/components/data-table";
import type { InventoryItem } from "@/types/database";

const conditionStyles: Record<string, string> = {
  new: "bg-success/10 text-success",
  good: "bg-primary/10 text-primary",
  fair: "bg-warning/10 text-warning",
  damaged: "bg-danger/10 text-danger",
  under_repair: "bg-warning/10 text-warning",
  disposed: "bg-muted/10 text-muted",
};

export function InventoryItemsTable({ items }: { items: InventoryItem[] }) {
  const columns: Column<InventoryItem>[] = [
    {
      key: "name",
      header: "Item",
      render: (i) => (
        <div>
          <Link href={`/inventory/items/${i.id}`} className="font-medium text-foreground hover:text-primary">{i.name}</Link>
          <p className="text-xs text-muted">{i.asset_id}</p>
        </div>
      ),
      sortValue: (i) => i.name,
    },
    { key: "category", header: "Category", render: (i) => i.category ?? "—", hideOnMobile: true },
    { key: "location", header: "Location", render: (i) => i.location ?? "—", hideOnMobile: true },
    {
      key: "quantity",
      header: "Available / Total",
      render: (i) => (
        <span className={i.minimum_stock != null && i.available_quantity < i.minimum_stock ? "text-danger" : ""}>
          {i.available_quantity} / {i.quantity}
        </span>
      ),
      sortValue: (i) => i.available_quantity,
    },
    { key: "value", header: "Value", render: (i) => `PKR ${((i.cost ?? 0) * i.quantity).toLocaleString()}`, hideOnMobile: true },
    {
      key: "condition",
      header: "Condition",
      render: (i) => <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${conditionStyles[i.condition]}`}>{i.condition.replace("_", " ")}</span>,
    },
  ];

  return (
    <DataTable
      columns={columns}
      rows={items}
      rowKey={(i) => i.id}
      searchKeys={(i) => `${i.name} ${i.asset_id} ${i.category ?? ""} ${i.location ?? ""} ${i.supplier ?? ""}`}
      emptyLabel="No inventory items found. Try adjusting your search or add a new item."
    />
  );
}
