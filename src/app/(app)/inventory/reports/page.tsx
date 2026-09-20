import { redirect } from "next/navigation";
import { getSession, isSchoolStaff } from "@/lib/auth/session";
import { listInventoryItems, listInventoryTransactions, listInventoryCategories } from "@/lib/data/inventory";
import { InventoryReportsCenter } from "@/components/inventory/inventory-reports-center";
import type { InventoryDataset } from "@/lib/reports/inventory-reports";

export default async function InventoryReportsPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!isSchoolStaff(session.profile.role)) redirect("/dashboard");

  const [items, transactions, categories] = await Promise.all([listInventoryItems(), listInventoryTransactions(), listInventoryCategories()]);
  const data: InventoryDataset = { items, transactions, categories };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold">Inventory Reports</h1>
        <p className="text-sm text-muted">Real-time reports generated from inventory items and the transaction ledger.</p>
      </div>
      <InventoryReportsCenter data={data} />
    </div>
  );
}
