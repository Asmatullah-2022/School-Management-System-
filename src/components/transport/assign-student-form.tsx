"use client";

import { useMemo, useState } from "react";
import { useActionForm } from "@/lib/hooks/use-action-form";
import type { Route, RouteStop, Student, Vehicle } from "@/types/database";

export function AssignStudentForm({
  routes,
  stops,
  vehicles,
  students,
  currentAssignmentCounts,
  action,
}: {
  routes: Route[];
  stops: RouteStop[];
  vehicles: Vehicle[];
  students: Student[];
  currentAssignmentCounts: Record<string, number>;
  action: (formData: FormData) => Promise<{ error?: string } | void>;
}) {
  const { error, pending, handleSubmit } = useActionForm(action);
  const [routeId, setRouteId] = useState("");

  const routeStops = useMemo(() => stops.filter((s) => s.route_id === routeId).sort((a, b) => a.stop_order - b.stop_order), [stops, routeId]);
  const selectedRoute = routes.find((r) => r.id === routeId);
  const vehicle = vehicles.find((v) => v.id === selectedRoute?.vehicle_id);
  const seatsLeft = vehicle?.capacity != null ? vehicle.capacity - (currentAssignmentCounts[routeId] ?? 0) : null;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>}
      <label className="block">
        <span className="mb-1 block text-sm font-medium">Student</span>
        <select name="student_id" required className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary">
          <option value="">Select student</option>
          {students.map((s) => <option key={s.id} value={s.id}>{s.full_name} ({s.admission_number})</option>)}
        </select>
      </label>
      <label className="block">
        <span className="mb-1 block text-sm font-medium">Route</span>
        <select name="route_id" required value={routeId} onChange={(e) => setRouteId(e.target.value)} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary">
          <option value="">Select route</option>
          {routes.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
        </select>
        {seatsLeft != null && (
          <p className={`mt-1 text-xs ${seatsLeft > 0 ? "text-muted" : "text-danger"}`}>
            {seatsLeft > 0 ? `${seatsLeft} seat(s) available on this route's vehicle.` : "This route's vehicle is at full capacity."}
          </p>
        )}
      </label>
      {routeId && (
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Stop</span>
          <select name="stop_id" className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary">
            <option value="">No specific stop</option>
            {routeStops.map((s) => <option key={s.id} value={s.id}>{s.stop_name}</option>)}
          </select>
        </label>
      )}
      <button type="submit" disabled={pending || (seatsLeft != null && seatsLeft <= 0)} className="rounded-lg bg-primary px-5 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60">
        {pending ? "Assigning…" : "Assign to Route"}
      </button>
    </form>
  );
}
