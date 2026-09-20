import { Boxes, Wallet, AlertTriangle, UserCheck, Wrench } from "lucide-react";
import { StatCard } from "@/components/dashboard/stat-card";
import { Card, CardHeader, EmptyState } from "@/components/ui/card";
import { ClassDistributionChart } from "@/components/dashboard/charts";
import { buildLowStockReport } from "@/lib/reports/inventory-reports";
import type { InventoryDataset } from "@/lib/reports/inventory-reports";

export function InventoryDashboard({ data }: { data: InventoryDataset }) {
  const totalItems = data.items.length;
  const totalQuantity = data.items.reduce((sum, i) => sum + i.quantity, 0);
  const totalValue = data.items.reduce((sum, i) => sum + (i.cost ?? 0) * i.quantity, 0);
  const lowStock = buildLowStockReport(data);
  const underRepair = data.items.filter((i) => i.condition === "under_repair").length;
  const assignedCount = data.transactions.filter((t) => t.transaction_type === "assignment").length -
    data.transactions.filter((t) => t.transaction_type === "return").length;

  const categoryData = Array.from(
    data.items.reduce((map, i) => {
      const key = i.category ?? "Uncategorized";
      map.set(key, (map.get(key) ?? 0) + i.quantity);
      return map;
    }, new Map<string, number>())
  ).map(([name, value]) => ({ name, value }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <StatCard label="Total Items" value={totalItems} icon={Boxes} tone="primary" />
        <StatCard label="Total Quantity" value={totalQuantity} icon={Boxes} tone="accent" />
        <StatCard label="Total Asset Value" value={`PKR ${totalValue.toLocaleString()}`} icon={Wallet} tone="success" />
        <StatCard label="Low Stock Items" value={lowStock.length} icon={AlertTriangle} tone={lowStock.length ? "danger" : "success"} />
        <StatCard label="Items Assigned to Staff" value={Math.max(assignedCount, 0)} icon={UserCheck} tone="primary" />
        <StatCard label="Items Under Maintenance" value={underRepair} icon={Wrench} tone={underRepair ? "warning" : "success"} />
      </div>

      <Card>
        <CardHeader title="Inventory by Category" />
        <div className="p-4">
          {categoryData.length ? <ClassDistributionChart data={categoryData} /> : <EmptyState label="No inventory items yet." />}
        </div>
      </Card>
    </div>
  );
}
