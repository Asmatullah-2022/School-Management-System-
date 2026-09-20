import { redirect } from "next/navigation";
import { getSession, isSchoolStaff } from "@/lib/auth/session";
import { listInventoryCategories, listInventoryLocations } from "@/lib/data/inventory";
import { Card } from "@/components/ui/card";
import { ItemForm } from "@/components/inventory/item-form";
import { createInventoryItemAction } from "../../actions";

export default async function NewInventoryItemPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!isSchoolStaff(session.profile.role)) redirect("/dashboard");

  const [categories, locations] = await Promise.all([listInventoryCategories(), listInventoryLocations()]);

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div>
        <h1 className="text-xl font-semibold">Add Inventory Item</h1>
      </div>
      <Card className="p-5 sm:p-6">
        <ItemForm categories={categories} locations={locations} action={createInventoryItemAction} />
      </Card>
    </div>
  );
}
