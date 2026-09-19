"use client";

import { useState } from "react";
import { useActionForm } from "@/lib/hooks/use-action-form";
import type { SchoolClass } from "@/types/database";

export function NoticeForm({
  classes,
  action,
}: {
  classes: SchoolClass[];
  action: (formData: FormData) => Promise<{ error?: string } | void>;
}) {
  const { error, pending, handleSubmit } = useActionForm(action);
  const [audience, setAudience] = useState("all");

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>}

      <label className="block">
        <span className="mb-1 block text-sm font-medium">Title</span>
        <input name="title" required className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
      </label>

      <label className="block">
        <span className="mb-1 block text-sm font-medium">Description</span>
        <textarea name="description" rows={3} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
      </label>

      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Priority</span>
          <select name="priority" defaultValue="normal" className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary">
            <option value="normal">Normal</option>
            <option value="important">Important</option>
            <option value="urgent">Urgent</option>
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Expiry Date (optional)</span>
          <input name="expiry_date" type="date" className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
        </label>
      </div>

      <label className="block">
        <span className="mb-1 block text-sm font-medium">Attachment Link (optional)</span>
        <input name="attachment_url" placeholder="https://…" className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
      </label>

      <div>
        <label className="mb-1 block text-sm font-medium">Target Audience</label>
        <select name="audience" value={audience} onChange={(e) => setAudience(e.target.value)} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary">
          <option value="all">All users</option>
          <option value="teachers">Teachers only</option>
          <option value="students">Students only</option>
          <option value="parents">Parents only</option>
          <option value="class">Specific class</option>
        </select>
      </div>

      {audience === "class" && (
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Class</span>
          <select name="class_id" required className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary">
            <option value="">Select class</option>
            {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </label>
      )}

      <label className="flex items-center gap-2">
        <input type="checkbox" name="requires_acknowledgement" className="h-4 w-4 rounded border-border" />
        <span className="text-sm font-medium">Require read acknowledgement</span>
      </label>

      <button type="submit" disabled={pending} className="rounded-lg bg-primary px-5 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60">
        {pending ? "Publishing…" : "Publish Notice"}
      </button>
    </form>
  );
}
