"use client";

import { useActionForm } from "@/lib/hooks/use-action-form";
import type { Student } from "@/types/database";

export function LeaveRequestForm({
  linkedChildren,
  action,
}: {
  linkedChildren?: Student[];
  action: (formData: FormData) => Promise<{ error?: string } | void>;
}) {
  const { error, pending, handleSubmit } = useActionForm(action);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>}

      {linkedChildren && linkedChildren.length > 0 && (
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Child</span>
          <select name="student_id" required className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary">
            {linkedChildren.map((c) => (
              <option key={c.id} value={c.id}>{c.full_name}</option>
            ))}
          </select>
        </label>
      )}

      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Start Date</span>
          <input name="start_date" type="date" required className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium">End Date</span>
          <input name="end_date" type="date" required className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
        </label>
      </div>

      <label className="block">
        <span className="mb-1 block text-sm font-medium">Reason</span>
        <textarea name="reason" required rows={3} placeholder="Why is this leave being requested?" className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
      </label>

      <button type="submit" disabled={pending} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-60">
        {pending ? "Submitting…" : "Submit Leave Request"}
      </button>
    </form>
  );
}
