"use client";

import { useEffect, useRef, useState } from "react";
import { useActionForm } from "@/lib/hooks/use-action-form";
import type { School } from "@/types/database";

const FIELDS: { name: keyof School; label: string; placeholder?: string }[] = [
  { name: "name", label: "School Name" },
  { name: "logo_url", label: "Logo URL", placeholder: "https://…/logo.png" },
  { name: "address", label: "Address" },
  { name: "district", label: "District" },
  { name: "province", label: "Province" },
  { name: "phone", label: "Phone" },
  { name: "email", label: "Email" },
  { name: "website", label: "Website", placeholder: "https://…" },
  { name: "principal_name", label: "Principal Name" },
  { name: "headteacher_name", label: "Headteacher Name" },
  { name: "principal_signature_url", label: "Principal Signature URL", placeholder: "https://…/signature.png" },
  { name: "school_stamp_url", label: "School Stamp URL", placeholder: "https://…/stamp.png" },
  { name: "certificate_prefix", label: "Certificate Number Prefix", placeholder: "CERT" },
];

export function DocumentSettingsForm({
  school,
  action,
}: {
  school: Partial<School>;
  action: (formData: FormData) => Promise<{ error?: string } | void>;
}) {
  const { error, pending, handleSubmit } = useActionForm(action);
  const [saved, setSaved] = useState(false);
  const wasPending = useRef(false);

  useEffect(() => {
    if (wasPending.current && !pending) setSaved(!error);
    wasPending.current = pending;
  }, [pending, error]);

  return (
    <form
      onSubmit={(e) => {
        setSaved(false);
        handleSubmit(e);
      }}
      className="space-y-4"
    >
      {error && <p className="rounded-lg border border-danger/30 bg-danger/10 px-4 py-2 text-sm text-danger">{error}</p>}
      {!error && saved && !pending && (
        <p className="rounded-lg border border-success/30 bg-success/10 px-4 py-2 text-sm text-success">Document settings saved.</p>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {FIELDS.map(({ name, label, placeholder }) => (
          <label key={name} className="block">
            <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-muted">{label}</span>
            <input
              name={name}
              defaultValue={(school[name] as string | null | undefined) ?? ""}
              placeholder={placeholder}
              required={name === "name"}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
            />
          </label>
        ))}
      </div>

      <label className="block">
        <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-muted">Document Footer</span>
        <textarea
          name="document_footer"
          defaultValue={school.document_footer ?? ""}
          rows={2}
          placeholder="Text shown at the bottom of certificates and receipts"
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
        />
      </label>

      <div className="flex justify-end border-t border-border pt-4">
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-primary px-5 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60"
        >
          {pending ? "Saving…" : "Save Document Settings"}
        </button>
      </div>
    </form>
  );
}
