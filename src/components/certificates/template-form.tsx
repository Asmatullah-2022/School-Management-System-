"use client";

import { useActionForm } from "@/lib/hooks/use-action-form";
import { CERTIFICATE_TYPE_LABELS } from "@/lib/certificates/default-templates";
import type { CertificateType } from "@/types/database";

const TYPES: CertificateType[] = ["bonafide", "character", "leaving", "transfer", "result", "attendance", "enrollment", "custom"];

export function TemplateForm({ action }: { action: (formData: FormData) => Promise<{ error?: string } | void> }) {
  const { error, pending, handleSubmit } = useActionForm(action);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>}
      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Template Name</span>
          <input name="name" required placeholder="e.g. Sports Achievement Award" className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Applies To</span>
          <select name="certificate_type" defaultValue="custom" className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary">
            {TYPES.map((t) => <option key={t} value={t}>{CERTIFICATE_TYPE_LABELS[t]}</option>)}
          </select>
        </label>
      </div>
      <label className="block">
        <span className="mb-1 block text-sm font-medium">Body Text</span>
        <textarea
          name="body_template"
          required
          rows={5}
          placeholder="Dear {{student_name}}, ..."
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
        />
        <p className="mt-1 text-xs text-muted">
          Available variables: {"{{student_name}}"}, {"{{father_name}}"}, {"{{admission_number}}"}, {"{{class}}"}, {"{{section}}"}, {"{{academic_session}}"}, {"{{date}}"}, {"{{certificate_number}}"}, {"{{school_name}}"}. Plain text only — no code is executed.
        </p>
      </label>
      <button type="submit" disabled={pending} className="rounded-lg bg-primary px-5 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60">
        {pending ? "Saving…" : "Save Template"}
      </button>
    </form>
  );
}
