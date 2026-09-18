"use client";

import { useRouter } from "next/navigation";
import type { FeeStructure, SchoolClass } from "@/types/database";
import { useActionForm } from "@/lib/hooks/use-action-form";

const FEE_TYPES = ["tuition", "admission", "exam", "transport", "library", "hostel", "activity", "other"];

export function FeeStructureForm({
  structure,
  classes,
  action,
}: {
  structure?: FeeStructure;
  classes: SchoolClass[];
  action: (formData: FormData) => Promise<{ error?: string } | void>;
}) {
  const router = useRouter();
  const { error, pending, handleSubmit } = useActionForm(action);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>}

      <div>
        <label className="mb-1 block text-sm font-medium">Fee Name</label>
        <input
          name="name"
          defaultValue={structure?.name}
          required
          placeholder="e.g. Monthly Tuition Fee"
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-sm font-medium">Fee Type</label>
          <select
            name="fee_type"
            defaultValue={structure?.fee_type ?? "tuition"}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
          >
            {FEE_TYPES.map((t) => (
              <option key={t} value={t}>
                {t[0].toUpperCase() + t.slice(1)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Frequency</label>
          <select
            name="frequency"
            defaultValue={structure?.frequency ?? "monthly"}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
          >
            <option value="monthly">Monthly</option>
            <option value="quarterly">Quarterly</option>
            <option value="annual">Annual</option>
            <option value="one_time">One-time</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-sm font-medium">Amount (PKR)</label>
          <input
            name="amount"
            type="number"
            min={0}
            step="0.01"
            defaultValue={structure?.amount}
            required
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Applies to Class (optional)</label>
          <select
            name="class_id"
            defaultValue={structure?.class_id ?? ""}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
          >
            <option value="">All classes (school-wide)</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <button type="button" onClick={() => router.back()} className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-background">
          Cancel
        </button>
        <button type="submit" disabled={pending} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-60">
          {pending ? "Saving…" : structure ? "Save Changes" : "Create Fee Structure"}
        </button>
      </div>
    </form>
  );
}
