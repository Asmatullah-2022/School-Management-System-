import { redirect } from "next/navigation";
import { getSession, isSchoolStaff } from "@/lib/auth/session";
import { listInventoryLocations, listInventoryItems } from "@/lib/data/inventory";
import { Card, CardHeader, EmptyState } from "@/components/ui/card";
import { NewTaxonomyForm } from "@/components/inventory/new-taxonomy-form";
import { createInventoryLocationAction } from "../actions";

export default async function InventoryLocationsPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!isSchoolStaff(session.profile.role)) redirect("/dashboard");

  const [locations, items] = await Promise.all([listInventoryLocations(), listInventoryItems()]);

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div>
        <h1 className="text-xl font-semibold">Inventory Locations</h1>
        <p className="text-sm text-muted">{locations.length} locations</p>
      </div>
      <Card className="p-5">
        <NewTaxonomyForm label="Location" action={createInventoryLocationAction} />
      </Card>
      <Card>
        <CardHeader title="All Locations" />
        {locations.length === 0 ? (
          <EmptyState label="No locations yet." />
        ) : (
          <ul className="divide-y divide-border">
            {locations.map((l) => (
              <li key={l.id} className="flex items-center justify-between px-5 py-3 text-sm">
                <span>{l.name}</span>
                <span className="text-xs text-muted">{items.filter((i) => i.location_id === l.id).length} items</span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
