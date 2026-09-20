import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus } from "lucide-react";
import { getSession, isSchoolStaff } from "@/lib/auth/session";
import { listInventoryItems } from "@/lib/data/inventory";
import { Card } from "@/components/ui/card";
import { InventoryItemsTable } from "@/components/inventory/inventory-items-table";

export default async function InventoryItemsPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!isSchoolStaff(session.profile.role)) redirect("/dashboard");

  const items = await listInventoryItems();

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold">Inventory Items</h1>
          <p className="text-sm text-muted">{items.length} items tracked</p>
        </div>
        <Link href="/inventory/items/new" className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90">
          <Plus size={16} /> Add Item
        </Link>
      </div>
      <Card>
        <InventoryItemsTable items={items} />
      </Card>
    </div>
  );
}
