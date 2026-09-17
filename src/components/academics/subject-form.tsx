"use client";

import { useState, useTransition } from "react";
import type { Subject } from "@/types/database";

function Field({
  label,
  name,
  type = "text",
  required,
  defaultValue,
  placeholder,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  defaultValue?: string | number | null;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium">
        {label}
        {required && <span className="text-danger"> *</span>}
      </span>
      <input
        name={name}
        type={type}
        required={required}
        defaultValue={defaultValue ?? ""}
        placeholder={placeholder}
        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
      />
    </label>
  );
}

export function SubjectForm({
  action,
  defaultValues,
  submitLabel = "Save Subject",
}: {
  action: (formData: FormData) => Promise<{ error?: string } | void>;
  defaultValues?: Partial<Subject>;
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
        <Field label="Subject Name" name="name" required defaultValue={defaultValues?.name} />
        <Field label="Urdu Subject Name" name="name_urdu" defaultValue={defaultValues?.name_urdu} placeholder="اردو نام" />
        <Field label="Subject Code" name="code" defaultValue={defaultValues?.code} placeholder="e.g. MATH" />
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Subject Type</span>
          <select
            name="subject_type"
            defaultValue={defaultValues?.subject_type ?? "core"}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
          >
            <option value="core">Core</option>
            <option value="elective">Elective</option>
            <option value="optional">Optional</option>
          </select>
        </label>
        <Field label="Total Marks" name="total_marks" type="number" defaultValue={defaultValues?.total_marks ?? 100} />
        <Field label="Passing Marks" name="passing_marks" type="number" defaultValue={defaultValues?.passing_marks ?? 33} />
        <div className="sm:col-span-2">
          <label className="block">
            <span className="mb-1 block text-sm font-medium">Description</span>
            <textarea
              name="description"
              defaultValue={defaultValues?.description ?? ""}
              rows={3}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
            />
          </label>
        </div>
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
