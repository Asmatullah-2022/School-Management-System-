"use client";

import { useActionForm } from "@/lib/hooks/use-action-form";
import type { Driver, FeeStructure, Route, Vehicle } from "@/types/database";

export function RouteForm({
  vehicles,
  drivers,
  transportFeeStructures,
  defaultValues,
  submitLabel = "Create Route",
  showStatus = false,
  action,
}: {
  vehicles: Vehicle[];
  drivers: Driver[];
  transportFeeStructures: FeeStructure[];
  defaultValues?: Route;
  submitLabel?: string;
  showStatus?: boolean;
  action: (formData: FormData) => Promise<{ error?: string } | void>;
}) {
  const { error, pending, handleSubmit } = useActionForm(action);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>}
      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Route Name</span>
          <input name="name" required defaultValue={defaultValues?.name} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Route Code</span>
          <input name="route_code" defaultValue={defaultValues?.route_code ?? ""} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
        </label>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Starting Point</span>
          <input name="starting_point" defaultValue={defaultValues?.starting_point ?? ""} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Destination</span>
          <input name="destination" defaultValue={defaultValues?.destination ?? "School Campus"} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
        </label>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Distance (km)</span>
          <input name="distance_km" type="number" step="0.1" defaultValue={defaultValues?.distance_km ?? ""} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Estimated Travel Time (minutes)</span>
          <input name="estimated_minutes" type="number" defaultValue={defaultValues?.estimated_minutes ?? ""} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
        </label>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Vehicle</span>
          <select name="vehicle_id" defaultValue={defaultValues?.vehicle_id ?? ""} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary">
            <option value="">Unassigned</option>
            {vehicles.map((v) => <option key={v.id} value={v.id}>{v.vehicle_number} (cap. {v.capacity ?? "—"})</option>)}
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Driver</span>
          <select name="driver_id" defaultValue={defaultValues?.driver_id ?? ""} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary">
            <option value="">Unassigned</option>
            {drivers.map((d) => <option key={d.id} value={d.id}>{d.full_name}</option>)}
          </select>
        </label>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Monthly Fare (PKR)</span>
          <input name="fare" type="number" min={0} required defaultValue={defaultValues?.fare ?? 0} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Linked Finance Fee Structure</span>
          <select name="fee_structure_id" defaultValue={defaultValues?.fee_structure_id ?? ""} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary">
            <option value="">None — do not auto-generate a fee charge</option>
            {transportFeeStructures.map((fs) => <option key={fs.id} value={fs.id}>{fs.name} (PKR {fs.amount.toLocaleString()}/{fs.frequency})</option>)}
          </select>
          <p className="mt-1 text-xs text-muted">Create a &quot;Transport&quot; fee structure under Fee Structure first, then link it here so assigning a student to this route automatically charges the existing finance system.</p>
        </label>
      </div>
      {showStatus && (
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Status</span>
          <select name="status" defaultValue={defaultValues?.status ?? "active"} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary">
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </label>
      )}
      <button type="submit" disabled={pending} className="rounded-lg bg-primary px-5 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60">
        {pending ? "Saving…" : submitLabel}
      </button>
    </form>
  );
}
