import { Bus, Clock, MapPin, User } from "lucide-react";
import { Card, EmptyState } from "@/components/ui/card";
import type { Driver, Route, RouteStop, StudentTransportAssignment, Vehicle } from "@/types/database";

/** Read-only view of a single student's own transport assignment.
 * `assignment` must already be scoped to the viewer's own/child's
 * student_id by the caller. */
export function MyTransportView({
  assignment,
  route,
  vehicle,
  driver,
  stop,
}: {
  assignment: StudentTransportAssignment | undefined;
  route: Route | undefined;
  vehicle: Vehicle | undefined;
  driver: Driver | undefined;
  stop: RouteStop | undefined;
}) {
  if (!assignment || !route) {
    return (
      <Card>
        <EmptyState label="Not currently assigned to school transport." />
      </Card>
    );
  }

  return (
    <Card className="p-5">
      <h3 className="text-sm font-semibold">{route.name}</h3>
      <p className="text-xs text-muted">{route.starting_point ?? "—"} → {route.destination ?? "School"}</p>
      <div className="mt-4 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
        <p className="flex items-center gap-2"><Bus size={15} className="text-muted" /> Vehicle: {vehicle?.vehicle_number ?? "Unassigned"}</p>
        <p className="flex items-center gap-2"><User size={15} className="text-muted" /> Driver: {driver?.full_name ?? "Unassigned"}</p>
        <p className="flex items-center gap-2"><MapPin size={15} className="text-muted" /> Pickup Stop: {stop?.stop_name ?? assignment.stop_name ?? "—"}</p>
        {stop?.pickup_time && <p className="flex items-center gap-2"><Clock size={15} className="text-muted" /> Pickup: {stop.pickup_time}{stop.dropoff_time ? ` · Drop-off: ${stop.dropoff_time}` : ""}</p>}
      </div>
    </Card>
  );
}
