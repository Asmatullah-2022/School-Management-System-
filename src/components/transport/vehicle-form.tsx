"use client";

import { useActionForm } from "@/lib/hooks/use-action-form";
import type { Driver, Vehicle } from "@/types/database";

export function VehicleForm({
  drivers,
  defaultValues,
  submitLabel = "Add Vehicle",
  showStatus = false,
  action,
}: {
  drivers: Driver[];
  defaultValues?: Vehicle;
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
          <span className="mb-1 block text-sm font-medium">Registration Number</span>
          <input name="vehicle_number" required defaultValue={defaultValues?.vehicle_number} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Vehicle Type</span>
          <input name="vehicle_type" placeholder="Van, Bus, Coaster…" defaultValue={defaultValues?.vehicle_type ?? ""} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
        </label>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Make / Model</span>
          <input name="make_model" defaultValue={defaultValues?.make_model ?? ""} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Seating Capacity</span>
          <input name="capacity" type="number" min={1} defaultValue={defaultValues?.capacity ?? ""} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
        </label>
      </div>
      <label className="block">
        <span className="mb-1 block text-sm font-medium">Driver</span>
        <select name="driver_id" defaultValue={defaultValues?.driver_id ?? ""} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary">
          <option value="">Unassigned</option>
          {drivers.map((d) => <option key={d.id} value={d.id}>{d.full_name}</option>)}
        </select>
      </label>
      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Insurance Expiry</span>
          <input name="insurance_expiry" type="date" defaultValue={defaultValues?.insurance_expiry ?? ""} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Fitness Expiry</span>
          <input name="fitness_expiry" type="date" defaultValue={defaultValues?.fitness_expiry ?? ""} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
        </label>
      </div>
      {!defaultValues && (
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Start Date</span>
          <input name="start_date" type="date" className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
        </label>
      )}
      {showStatus && (
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Status</span>
          <select name="status" defaultValue={defaultValues?.status ?? "active"} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary">
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="maintenance">Maintenance</option>
          </select>
        </label>
      )}
      <label className="block">
        <span className="mb-1 block text-sm font-medium">Notes</span>
        <textarea name="notes" rows={2} defaultValue={defaultValues?.notes ?? ""} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
      </label>
      <button type="submit" disabled={pending} className="rounded-lg bg-primary px-5 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60">
        {pending ? "Saving…" : submitLabel}
      </button>
    </form>
  );
}
