import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, Clock, MapPin } from "lucide-react";
import { getSession, isSchoolAdmin, isSchoolStaff } from "@/lib/auth/session";
import { listRoutes, listVehicles, listDrivers, listRouteStops, listRouteStudents } from "@/lib/data/transport";
import { listStudents } from "@/lib/data/students";
import { Card, CardHeader, EmptyState } from "@/components/ui/card";
import { RouteStopForm } from "@/components/transport/route-stop-form";
import { EndAssignmentButton } from "@/components/transport/end-assignment-button";
import { createRouteStopAction, endRouteAssignmentAction } from "../../actions";

export default async function RouteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!isSchoolStaff(session.profile.role)) redirect("/transport");

  const { id } = await params;
  const [routes, vehicles, drivers, stops, assignments, students] = await Promise.all([
    listRoutes(),
    listVehicles(),
    listDrivers(),
    listRouteStops(id),
    listRouteStudents(),
    listStudents(),
  ]);
  const route = routes.find((r) => r.id === id);
  if (!route) notFound();

  const isAdmin = isSchoolAdmin(session.profile.role);
  const vehicle = vehicles.find((v) => v.id === route.vehicle_id);
  const driver = drivers.find((d) => d.id === route.driver_id);
  const routeAssignments = assignments.filter((a) => a.route_id === id && a.status === "active");
  const sortedStops = [...stops].sort((a, b) => a.stop_order - b.stop_order);

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <Link href="/transport/routes" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-primary">
        <ArrowLeft size={15} /> Back to Routes
      </Link>

      <Card className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-lg font-semibold">{route.name}</h1>
            <p className="text-sm text-muted">{route.route_code ?? "—"} · {route.starting_point ?? "—"} → {route.destination ?? "School"}</p>
          </div>
          {isAdmin && <Link href={`/transport/routes/${id}/edit`} className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:bg-background">Edit Route</Link>}
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
          <div><p className="text-xs text-muted">Vehicle</p><p className="font-medium">{vehicle?.vehicle_number ?? "Unassigned"}</p></div>
          <div><p className="text-xs text-muted">Driver</p><p className="font-medium">{driver?.full_name ?? "Unassigned"}</p></div>
          <div><p className="text-xs text-muted">Capacity</p><p className="font-medium">{routeAssignments.length}{vehicle?.capacity != null && ` / ${vehicle.capacity}`}</p></div>
          <div><p className="text-xs text-muted">Fare</p><p className="font-medium">PKR {route.fare.toLocaleString()}/month</p></div>
        </div>
      </Card>

      <Card>
        <CardHeader title="Stops" />
        {sortedStops.length === 0 ? (
          <EmptyState label="No stops added yet." />
        ) : (
          <ul className="divide-y divide-border">
            {sortedStops.map((s, i) => (
              <li key={s.id} className="flex items-center gap-3 px-5 py-3 text-sm">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">{i + 1}</span>
                <div className="flex-1">
                  <p className="font-medium">{s.stop_name}</p>
                  {s.location_description && <p className="text-xs text-muted">{s.location_description}</p>}
                </div>
                {(s.pickup_time || s.dropoff_time) && (
                  <span className="flex items-center gap-1 text-xs text-muted"><Clock size={12} /> {s.pickup_time ?? "—"} / {s.dropoff_time ?? "—"}</span>
                )}
              </li>
            ))}
          </ul>
        )}
        {isAdmin && (
          <div className="border-t border-border p-5">
            <RouteStopForm nextOrder={sortedStops.length + 1} action={createRouteStopAction.bind(null, id)} />
          </div>
        )}
      </Card>

      <Card>
        <CardHeader title={`Assigned Students (${routeAssignments.length})`} />
        {routeAssignments.length === 0 ? (
          <EmptyState label="No students assigned to this route yet." />
        ) : (
          <ul className="divide-y divide-border">
            {routeAssignments.map((a) => {
              const student = students.find((s) => s.id === a.student_id);
              return (
                <li key={a.id} className="flex items-center justify-between px-5 py-3 text-sm">
                  <div>
                    <p className="font-medium">{student?.full_name ?? "Unknown student"}</p>
                    <p className="flex items-center gap-1 text-xs text-muted"><MapPin size={12} /> {a.stop_name ?? "No stop set"} · Since {new Date(a.start_date).toLocaleDateString()}</p>
                  </div>
                  {isAdmin && <EndAssignmentButton id={a.id} action={endRouteAssignmentAction} />}
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </div>
  );
}
