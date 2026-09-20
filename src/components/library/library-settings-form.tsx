"use client";

import { useActionForm } from "@/lib/hooks/use-action-form";
import type { LibrarySettings } from "@/types/database";

export function LibrarySettingsForm({ settings, action }: { settings: LibrarySettings; action: (formData: FormData) => Promise<{ error?: string } | void> }) {
  const { error, pending, handleSubmit } = useActionForm(action);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>}
      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Fine Per Overdue Day (PKR)</span>
          <input name="fine_per_day" type="number" min={0} step="0.01" defaultValue={settings.fine_per_day} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Grace Period (days)</span>
          <input name="grace_period_days" type="number" min={0} defaultValue={settings.grace_period_days} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
        </label>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Maximum Fine (PKR, optional)</span>
          <input name="max_fine" type="number" min={0} step="0.01" defaultValue={settings.max_fine ?? ""} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Default Loan Period (days)</span>
          <input name="default_loan_days" type="number" min={1} defaultValue={settings.default_loan_days} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
        </label>
      </div>
      <button type="submit" disabled={pending} className="rounded-lg bg-primary px-5 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60">
        {pending ? "Saving…" : "Save Settings"}
      </button>
    </form>
  );
}
