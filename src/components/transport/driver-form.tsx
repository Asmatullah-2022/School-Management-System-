"use client";

import { useActionForm } from "@/lib/hooks/use-action-form";
import type { Driver } from "@/types/database";

export function DriverForm({ defaultValues, submitLabel = "Add Driver", showStatus = false, action }: { defaultValues?: Driver; submitLabel?: string; showStatus?: boolean; action: (formData: FormData) => Promise<{ error?: string } | void> }) {
  const { error, pending, handleSubmit } = useActionForm(action);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>}
      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Full Name</span>
          <input name="full_name" required defaultValue={defaultValues?.full_name} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Employee ID</span>
          <input name="employee_id" defaultValue={defaultValues?.employee_id ?? ""} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
        </label>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <span className="mb-1 block text-sm font-medium">CNIC</span>
          <input name="cnic" defaultValue={defaultValues?.cnic ?? ""} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Mobile</span>
          <input name="mobile" defaultValue={defaultValues?.mobile ?? ""} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
        </label>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <span className="mb-1 block text-sm font-medium">License Number</span>
          <input name="license_number" defaultValue={defaultValues?.license_number ?? ""} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium">License Expiry</span>
          <input name="license_expiry" type="date" defaultValue={defaultValues?.license_expiry ?? ""} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
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
