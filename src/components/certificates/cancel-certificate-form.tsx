"use client";

import { useState } from "react";
import { useActionForm } from "@/lib/hooks/use-action-form";

export function CancelCertificateForm({ action }: { action: (formData: FormData) => Promise<{ error?: string } | void> }) {
  const { error, pending, handleSubmit } = useActionForm(action);
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-danger hover:bg-background">
        Cancel Certificate
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 rounded-lg border border-border p-4">
      {error && <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>}
      <label className="block">
        <span className="mb-1 block text-sm font-medium">Cancellation Reason</span>
        <input name="reason" required className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
      </label>
      <div className="flex gap-2">
        <button type="submit" disabled={pending} className="rounded-lg bg-danger px-4 py-2 text-sm font-medium text-white disabled:opacity-60">
          {pending ? "Cancelling…" : "Confirm Cancellation"}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-background">
          Back
        </button>
      </div>
    </form>
  );
}
