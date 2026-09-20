import { redirect } from "next/navigation";
import { getSession, isSchoolStaff } from "@/lib/auth/session";
import { listInventoryItems, listInventoryTransactions, listInventoryCategories } from "@/lib/data/inventory";
import { InventoryDashboard } from "@/components/inventory/inventory-dashboard";
import type { InventoryDataset } from "@/lib/reports/inventory-reports";

export default async function InventoryPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  // Inventory is staff-only — students/parents have no inventory access at all.
  if (!isSchoolStaff(session.profile.role)) redirect("/dashboard");

  const [items, transactions, categories] = await Promise.all([
    listInventoryItems(),
    listInventoryTransactions(),
    listInventoryCategories(),
  ]);
  const data: InventoryDataset = { items, transactions, categories };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold">Inventory Dashboard</h1>
        <p className="text-sm text-muted">Real-time overview of school assets and stock.</p>
      </div>
      <InventoryDashboard data={data} />
    </div>
  );
}
