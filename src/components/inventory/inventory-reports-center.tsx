"use client";

import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { SimpleReportView } from "@/components/reports/simple-report-view";
import {
  buildAssetAssignmentReport,
  buildAssetValueReport,
  buildDamagedItemsReport,
  buildDisposedItemsReport,
  buildInventorySummary,
  buildLowStockReport,
  buildStockInReport,
  buildStockOutReport,
  buildUnderRepairReport,
  type InventoryDataset,
} from "@/lib/reports/inventory-reports";

const REPORTS = [
  { key: "summary", label: "Inventory Summary" },
  { key: "stock_in", label: "Stock In" },
  { key: "stock_out", label: "Stock Out" },
  { key: "assignment", label: "Asset Assignment" },
  { key: "low_stock", label: "Low Stock" },
  { key: "damaged", label: "Damaged Items" },
  { key: "under_repair", label: "Under Repair" },
  { key: "disposed", label: "Disposed Items" },
  { key: "value", label: "Asset Value" },
] as const;

const money = (n: unknown) => `PKR ${Number(n).toLocaleString()}`;

export function InventoryReportsCenter({ data }: { data: InventoryDataset }) {
  const [report, setReport] = useState<(typeof REPORTS)[number]["key"]>("summary");

  const view = useMemo(() => {
    if (report === "summary") {
      return { title: "Inventory Summary", rows: buildInventorySummary(data), columns: [
        { key: "assetCode", label: "Asset Code" }, { key: "name", label: "Name" }, { key: "category", label: "Category" },
        { key: "quantity", label: "Quantity" }, { key: "available", label: "Available" }, { key: "unitCost", label: "Unit Cost", format: money },
        { key: "totalValue", label: "Total Value", format: money }, { key: "condition", label: "Condition" }, { key: "status", label: "Status" },
      ] };
    }
    if (report === "stock_in") {
      return { title: "Stock In Report", rows: buildStockInReport(data), columns: [
        { key: "item", label: "Item" }, { key: "quantity", label: "Quantity" }, { key: "date", label: "Date" }, { key: "reason", label: "Reason" },
      ] };
    }
    if (report === "stock_out") {
      return { title: "Stock Out Report", rows: buildStockOutReport(data), columns: [
        { key: "item", label: "Item" }, { key: "quantity", label: "Quantity" }, { key: "date", label: "Date" }, { key: "reason", label: "Reason" },
      ] };
    }
    if (report === "assignment") {
      return { title: "Asset Assignment Report", rows: buildAssetAssignmentReport(data), columns: [
        { key: "item", label: "Item" }, { key: "quantity", label: "Qty" }, { key: "assignedToType", label: "Type" },
        { key: "assignedTo", label: "Assigned To" }, { key: "date", label: "Date" }, { key: "reason", label: "Reason" },
      ] };
    }
    if (report === "low_stock") {
      return { title: "Low Stock Report", rows: buildLowStockReport(data), columns: [
        { key: "assetCode", label: "Asset Code" }, { key: "name", label: "Item" }, { key: "available", label: "Available" },
        { key: "minimumStock", label: "Minimum" }, { key: "shortfall", label: "Shortfall" },
      ] };
    }
    if (report === "damaged") {
      return { title: "Damaged Items Report", rows: buildDamagedItemsReport(data), columns: [
        { key: "assetCode", label: "Asset Code" }, { key: "name", label: "Item" }, { key: "category", label: "Category" }, { key: "location", label: "Location" }, { key: "quantity", label: "Qty" },
      ] };
    }
    if (report === "under_repair") {
      return { title: "Items Under Repair", rows: buildUnderRepairReport(data), columns: [
        { key: "assetCode", label: "Asset Code" }, { key: "name", label: "Item" }, { key: "category", label: "Category" }, { key: "location", label: "Location" }, { key: "quantity", label: "Qty" },
      ] };
    }
    if (report === "disposed") {
      return { title: "Disposed Items Report", rows: buildDisposedItemsReport(data), columns: [
        { key: "assetCode", label: "Asset Code" }, { key: "name", label: "Item" }, { key: "category", label: "Category" }, { key: "disposedQuantity", label: "Disposed Qty" },
      ] };
    }
    return { title: "Asset Value Report", rows: buildAssetValueReport(data), columns: [
      { key: "category", label: "Category" }, { key: "value", label: "Value", format: money },
    ] };
  }, [report, data]);

  return (
    <div className="space-y-4">
      <Card className="flex flex-wrap gap-2 p-3">
        {REPORTS.map((r) => (
          <button key={r.key} onClick={() => setReport(r.key)} className={`rounded-lg px-3 py-1.5 text-sm font-medium ${report === r.key ? "bg-primary text-primary-foreground" : "hover:bg-background"}`}>
            {r.label}
          </button>
        ))}
      </Card>
      <SimpleReportView title={view.title} columns={view.columns} rows={view.rows as unknown as Record<string, unknown>[]} filenameBase={`inventory-${report}`} printHref={`/print/inventory-report?key=${report}`} />
    </div>
  );
}
