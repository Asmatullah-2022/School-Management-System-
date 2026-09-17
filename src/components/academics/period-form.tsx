"use client";

import { useState, useTransition } from "react";
import type { Period } from "@/types/database";

export function PeriodForm({
  action,
  defaultValues,
  submitLabel = "Save Period",
}: {
  action: (formData: FormData) => Promise<{ error?: string } | void>;
  defaultValues?: Partial<Period>;
  submitLabel?: string;
}) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <form
      action={(formData) => {
        startTransition(async () => {
          const res = await action(formData);
          if (res?.error) setError(res.error);
        });
      }}
      className="space-y-6"
    >
      {error && (
        <p className="rounded-lg border border-danger/30 bg-danger/10 px-4 py-2 text-sm text-danger">{error}</p>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-sm font-medium">
            Period Number <span className="text-danger">*</span>
          </span>
          <input
            name="period_number"
            type="number"
            min={1}
            required
            defaultValue={defaultValues?.period_number ?? ""}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium">
            Period Name <span className="text-danger">*</span>
          </span>
          <input
            name="name"
            required
            placeholder="e.g. Period 1, Break"
            defaultValue={defaultValues?.name ?? ""}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium">
            Start Time <span className="text-danger">*</span>
          </span>
          <input
            name="start_time"
            type="time"
            required
            defaultValue={defaultValues?.start_time ?? ""}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium">
            End Time <span className="text-danger">*</span>
          </span>
          <input
            name="end_time"
            type="time"
            required
            defaultValue={defaultValues?.end_time ?? ""}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
          />
        </label>
        <label className="flex items-center gap-2 sm:col-span-2">
          <input type="checkbox" name="is_break" defaultChecked={defaultValues?.is_break} className="h-4 w-4 rounded border-border" />
          <span className="text-sm font-medium">This is a break period (not for teaching)</span>
        </label>
      </div>

      <div className="flex justify-end border-t border-border pt-4">
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-primary px-5 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60"
        >
          {pending ? "Saving…" : submitLabel}
        </button>
      </div>
    </form>
  );
}
