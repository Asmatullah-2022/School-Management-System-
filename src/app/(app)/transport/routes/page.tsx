import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus } from "lucide-react";
import { getSession, isSchoolAdmin } from "@/lib/auth/session";
import { listRoutes, listVehicles, listRouteStudents } from "@/lib/data/transport";
import { Card, EmptyState } from "@/components/ui/card";

export default async function RoutesPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const [routes, vehicles, assignments] = await Promise.all([listRoutes(), listVehicles(), listRouteStudents()]);
  const isAdmin = isSchoolAdmin(session.profile.role);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold">Transport Routes</h1>
          <p className="text-sm text-muted">{routes.length} routes</p>
        </div>
        {isAdmin && (
          <Link href="/transport/routes/new" className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90">
            <Plus size={16} /> Add Route
          </Link>
        )}
      </div>

      {routes.length === 0 ? (
        <Card><EmptyState label="No routes yet." /></Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {routes.map((r) => {
            const vehicle = vehicles.find((v) => v.id === r.vehicle_id);
            const assigned = assignments.filter((a) => a.route_id === r.id && a.status === "active").length;
            return (
              <Link key={r.id} href={`/transport/routes/${r.id}`}>
                <Card className="h-full p-4 transition hover:border-primary/50">
                  <h3 className="text-sm font-semibold">{r.name}</h3>
                  <p className="text-xs text-muted">{r.route_code ?? "—"} · {r.starting_point ?? "—"} → {r.destination ?? "School"}</p>
                  <div className="mt-3 space-y-1 text-xs text-muted">
                    <p>Vehicle: {vehicle?.vehicle_number ?? "Unassigned"}</p>
                    <p>Assigned: {assigned} {vehicle?.capacity != null && `/ ${vehicle.capacity}`}</p>
                    <p>Fare: PKR {r.fare.toLocaleString()}/month</p>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
