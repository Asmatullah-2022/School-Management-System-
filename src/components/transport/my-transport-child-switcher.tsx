"use client";

import { useState } from "react";
import { Card, EmptyState } from "@/components/ui/card";
import { MyTransportView } from "@/components/transport/my-transport-view";
import type { Driver, Route, RouteStop, Student, StudentTransportAssignment, Vehicle } from "@/types/database";

export function MyTransportChildSwitcher({
  entries,
  routes,
  vehicles,
  drivers,
  stops,
  showChildHeader,
}: {
  entries: { student: Student; assignment: StudentTransportAssignment | undefined }[];
  routes: Route[];
  vehicles: Vehicle[];
  drivers: Driver[];
  stops: RouteStop[];
  showChildHeader: boolean;
}) {
  const [selectedId, setSelectedId] = useState(entries[0]?.student.id);
  const active = entries.find((e) => e.student.id === selectedId) ?? entries[0];

  if (!active) {
    return (
      <Card>
        <EmptyState label="No linked student record was found for your account. Please contact the school office." />
      </Card>
    );
  }

  const route = routes.find((r) => r.id === active.assignment?.route_id);
  const vehicle = vehicles.find((v) => v.id === route?.vehicle_id);
  const driver = drivers.find((d) => d.id === route?.driver_id);
  const stop = stops.find((s) => s.id === active.assignment?.stop_id);

  return (
    <div className="space-y-4">
      {entries.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {entries.map((e) => (
            <button
              key={e.student.id}
              onClick={() => setSelectedId(e.student.id)}
              className={`rounded-full px-3.5 py-2 text-sm font-medium transition ${
                active.student.id === e.student.id ? "bg-primary text-primary-foreground" : "border border-border text-muted hover:bg-background"
              }`}
            >
              {e.student.full_name}
            </button>
          ))}
        </div>
      )}
      {showChildHeader && <h2 className="text-lg font-semibold">{active.student.full_name}&apos;s Transport</h2>}
      <MyTransportView assignment={active.assignment} route={route} vehicle={vehicle} driver={driver} stop={stop} />
    </div>
  );
}
