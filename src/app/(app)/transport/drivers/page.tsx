import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus } from "lucide-react";
import { getSession, isSchoolAdmin, isSchoolStaff } from "@/lib/auth/session";
import { listDrivers, listVehicles } from "@/lib/data/transport";
import { Card } from "@/components/ui/card";
import { DriversTable } from "@/components/transport/drivers-table";

export default async function DriversPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!isSchoolStaff(session.profile.role)) redirect("/transport");

  const [drivers, vehicles] = await Promise.all([listDrivers(), listVehicles()]);
  const isAdmin = isSchoolAdmin(session.profile.role);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold">Drivers</h1>
          <p className="text-sm text-muted">{drivers.length} drivers</p>
        </div>
        {isAdmin && (
          <Link href="/transport/drivers/new" className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90">
            <Plus size={16} /> Add Driver
          </Link>
        )}
      </div>
      <Card>
        <DriversTable drivers={drivers} vehicles={vehicles} canManage={isAdmin} />
      </Card>
    </div>
  );
}
