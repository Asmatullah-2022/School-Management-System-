"use client";

import { useActionForm } from "@/lib/hooks/use-action-form";

export function RouteStopForm({ nextOrder, action }: { nextOrder: number; action: (formData: FormData) => Promise<{ error?: string } | void> }) {
  const { error, pending, handleSubmit } = useActionForm(action);

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {error && <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>}
      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Stop Name</span>
          <input name="stop_name" required className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Order</span>
          <input name="stop_order" type="number" min={1} defaultValue={nextOrder} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
        </label>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Pickup Time</span>
          <input name="pickup_time" type="time" className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Drop-off Time</span>
          <input name="dropoff_time" type="time" className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
        </label>
      </div>
      <label className="block">
        <span className="mb-1 block text-sm font-medium">Location / Description</span>
        <input name="location_description" className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
      </label>
      <button type="submit" disabled={pending} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60">
        {pending ? "Adding…" : "Add Stop"}
      </button>
    </form>
  );
}
