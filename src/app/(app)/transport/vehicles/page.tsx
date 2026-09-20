import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus } from "lucide-react";
import { getSession, isSchoolAdmin, isSchoolStaff } from "@/lib/auth/session";
import { listVehicles, listDrivers } from "@/lib/data/transport";
import { Card } from "@/components/ui/card";
import { VehiclesTable } from "@/components/transport/vehicles-table";

export default async function VehiclesPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!isSchoolStaff(session.profile.role)) redirect("/transport");

  const [vehicles, drivers] = await Promise.all([listVehicles(), listDrivers()]);
  const isAdmin = isSchoolAdmin(session.profile.role);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold">Vehicles</h1>
          <p className="text-sm text-muted">{vehicles.length} vehicles</p>
        </div>
        {isAdmin && (
          <Link href="/transport/vehicles/new" className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90">
            <Plus size={16} /> Add Vehicle
          </Link>
        )}
      </div>
      <Card>
        <VehiclesTable vehicles={vehicles} drivers={drivers} canManage={isAdmin} />
      </Card>
    </div>
  );
}
