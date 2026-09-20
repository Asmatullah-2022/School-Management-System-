import { notFound, redirect } from "next/navigation";
import { getSession, isSchoolStaff } from "@/lib/auth/session";
import { getInventoryItem, listInventoryCategories, listInventoryLocations } from "@/lib/data/inventory";
import { Card } from "@/components/ui/card";
import { ItemForm } from "@/components/inventory/item-form";
import { updateInventoryItemAction } from "../../../actions";

export default async function EditInventoryItemPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!isSchoolStaff(session.profile.role)) redirect("/dashboard");

  const { id } = await params;
  const [item, categories, locations] = await Promise.all([getInventoryItem(id), listInventoryCategories(), listInventoryLocations()]);
  if (!item) notFound();

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div>
        <h1 className="text-xl font-semibold">Edit Item</h1>
        <p className="text-sm text-muted">{item.name}</p>
      </div>
      <Card className="p-5 sm:p-6">
        <ItemForm categories={categories} locations={locations} defaultValues={item} submitLabel="Save Changes" action={updateInventoryItemAction.bind(null, id)} />
      </Card>
    </div>
  );
}
