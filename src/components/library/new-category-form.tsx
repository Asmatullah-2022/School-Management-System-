"use client";

import { useActionForm } from "@/lib/hooks/use-action-form";

export function NewCategoryForm({ action }: { action: (formData: FormData) => Promise<{ error?: string } | void> }) {
  const { error, pending, handleSubmit } = useActionForm(action);

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {error && <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>}
      <div className="flex items-end gap-3">
        <label className="block flex-1">
          <span className="mb-1 block text-sm font-medium">New Category</span>
          <input name="name" required placeholder="e.g. Reference" className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
        </label>
        <button type="submit" disabled={pending} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60">
          {pending ? "Adding…" : "Add"}
        </button>
      </div>
    </form>
  );
}
