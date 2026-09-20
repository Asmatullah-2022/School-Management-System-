"use client";

import { useMemo, useState } from "react";
import { useActionForm } from "@/lib/hooks/use-action-form";
import { CERTIFICATE_TYPE_LABELS } from "@/lib/certificates/default-templates";
import type { CertificateTemplate, CertificateType, Student } from "@/types/database";

const TYPES: CertificateType[] = ["bonafide", "character", "leaving", "transfer", "result", "attendance", "enrollment", "custom"];

export function CertificateForm({
  students,
  templates,
  action,
}: {
  students: Student[];
  templates: CertificateTemplate[];
  action: (formData: FormData) => Promise<{ error?: string } | void>;
}) {
  const { error, pending, handleSubmit } = useActionForm(action);
  const [certificateType, setCertificateType] = useState<CertificateType>("bonafide");

  const matchingTemplates = useMemo(() => templates.filter((t) => t.certificate_type === certificateType), [templates, certificateType]);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>}

      <label className="block">
        <span className="mb-1 block text-sm font-medium">Student</span>
        <select name="student_id" required className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary">
          <option value="">Select student</option>
          {students.map((s) => <option key={s.id} value={s.id}>{s.full_name} ({s.admission_number})</option>)}
        </select>
      </label>

      <label className="block">
        <span className="mb-1 block text-sm font-medium">Certificate Type</span>
        <select name="certificate_type" value={certificateType} onChange={(e) => setCertificateType(e.target.value as CertificateType)} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary">
          {TYPES.map((t) => <option key={t} value={t}>{CERTIFICATE_TYPE_LABELS[t]}</option>)}
        </select>
      </label>

      {(certificateType === "custom" || matchingTemplates.length > 0) && (
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Template {certificateType === "custom" && "(required)"}</span>
          <select name="template_id" required={certificateType === "custom"} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary">
            <option value="">{certificateType === "custom" ? "Select a custom template" : "Use standard wording"}</option>
            {matchingTemplates.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </label>
      )}

      {(certificateType === "leaving" || certificateType === "result" || certificateType === "attendance") && (
        <label className="block">
          <span className="mb-1 block text-sm font-medium">
            {certificateType === "leaving" ? "Reason / Additional Note (optional)" : certificateType === "result" ? "Result Summary" : "Attendance Summary"}
          </span>
          <textarea name="extra_line" rows={2} placeholder={certificateType === "result" ? "e.g. Secured 87% marks and Grade A in the Annual Examination 2026." : certificateType === "attendance" ? "e.g. Present 178 days out of 190 working days (94%)." : ""} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
        </label>
      )}

      <button type="submit" disabled={pending} className="rounded-lg bg-primary px-5 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60">
        {pending ? "Issuing…" : "Issue Certificate"}
      </button>
    </form>
  );
}
