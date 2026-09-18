"use client";

import { useState } from "react";
import type { SchoolClass, Section, Subject, SubjectAssignment, Teacher } from "@/types/database";
import { useActionForm } from "@/lib/hooks/use-action-form";

export function AssignmentForm({
  action,
  classes,
  sections,
  subjects,
  teachers,
  defaultValues,
  submitLabel = "Save Assignment",
}: {
  action: (formData: FormData) => Promise<{ error?: string } | void>;
  classes: SchoolClass[];
  sections: Section[];
  subjects: Subject[];
  teachers: Teacher[];
  defaultValues?: Partial<SubjectAssignment>;
  submitLabel?: string;
}) {
  const { error, pending, handleSubmit } = useActionForm(action);
  const [classId, setClassId] = useState(defaultValues?.class_id ?? "");

  const filteredSections = sections.filter((s) => s.class_id === classId);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <p className="rounded-lg border border-danger/30 bg-danger/10 px-4 py-2 text-sm text-danger">{error}</p>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-sm font-medium">
            Class <span className="text-danger">*</span>
          </span>
          <select
            name="class_id"
            required
            defaultValue={defaultValues?.class_id ?? ""}
            onChange={(e) => setClassId(e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
          >
            <option value="">Select class</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-1 block text-sm font-medium">
            Section <span className="text-danger">*</span>
          </span>
          <select
            name="section_id"
            required
            defaultValue={defaultValues?.section_id ?? ""}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
          >
            <option value="">Select section</option>
            {filteredSections.map((s) => (
              <option key={s.id} value={s.id}>
                Section {s.name}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-1 block text-sm font-medium">
            Subject <span className="text-danger">*</span>
          </span>
          <select
            name="subject_id"
            required
            defaultValue={defaultValues?.subject_id ?? ""}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
          >
            <option value="">Select subject</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-1 block text-sm font-medium">
            Teacher <span className="text-danger">*</span>
          </span>
          <select
            name="teacher_id"
            required
            defaultValue={defaultValues?.teacher_id ?? ""}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
          >
            <option value="">Select teacher</option>
            {teachers.map((t) => (
              <option key={t.id} value={t.id}>
                {t.full_name}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-1 block text-sm font-medium">
            Weekly Periods <span className="text-danger">*</span>
          </span>
          <input
            name="weekly_periods"
            type="number"
            min={1}
            max={20}
            required
            defaultValue={defaultValues?.weekly_periods ?? 5}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
          />
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
