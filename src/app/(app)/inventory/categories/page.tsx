import { redirect } from "next/navigation";
import { getSession, isSchoolStaff } from "@/lib/auth/session";
import { listInventoryCategories, listInventoryItems } from "@/lib/data/inventory";
import { Card, CardHeader, EmptyState } from "@/components/ui/card";
import { NewTaxonomyForm } from "@/components/inventory/new-taxonomy-form";
import { createInventoryCategoryAction } from "../actions";

export default async function InventoryCategoriesPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!isSchoolStaff(session.profile.role)) redirect("/dashboard");

  const [categories, items] = await Promise.all([listInventoryCategories(), listInventoryItems()]);

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div>
        <h1 className="text-xl font-semibold">Inventory Categories</h1>
        <p className="text-sm text-muted">{categories.length} categories</p>
      </div>
      <Card className="p-5">
        <NewTaxonomyForm label="Category" action={createInventoryCategoryAction} />
      </Card>
      <Card>
        <CardHeader title="All Categories" />
        {categories.length === 0 ? (
          <EmptyState label="No categories yet." />
        ) : (
          <ul className="divide-y divide-border">
            {categories.map((c) => (
              <li key={c.id} className="flex items-center justify-between px-5 py-3 text-sm">
                <span>{c.name}</span>
                <span className="text-xs text-muted">{items.filter((i) => i.category_id === c.id).length} items</span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
