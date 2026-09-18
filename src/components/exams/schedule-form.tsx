"use client";

import { useState } from "react";
import type { ExamSubject, SchoolClass, Section, Subject, Teacher } from "@/types/database";
import { useActionForm } from "@/lib/hooks/use-action-form";

export function ScheduleForm({
  action,
  classes,
  sections,
  subjects,
  teachers,
  defaultValues,
  submitLabel = "Save Schedule",
}: {
  action: (formData: FormData) => Promise<{ error?: string } | void>;
  classes: SchoolClass[];
  sections: Section[];
  subjects: Subject[];
  teachers: Teacher[];
  defaultValues?: Partial<ExamSubject>;
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
            Exam Date <span className="text-danger">*</span>
          </span>
          <input
            name="exam_date"
            type="date"
            required
            defaultValue={defaultValues?.exam_date ?? ""}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Start Time</span>
          <input
            name="start_time"
            type="time"
            defaultValue={defaultValues?.start_time ?? ""}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium">End Time</span>
          <input
            name="end_time"
            type="time"
            defaultValue={defaultValues?.end_time ?? ""}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Room</span>
          <input
            name="exam_room"
            defaultValue={defaultValues?.exam_room ?? ""}
            placeholder="e.g. Room 1"
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Invigilator</span>
          <select
            name="invigilator_id"
            defaultValue={defaultValues?.invigilator_id ?? ""}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
          >
            <option value="">None</option>
            {teachers.map((t) => (
              <option key={t.id} value={t.id}>
                {t.full_name}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium">
            Total Marks <span className="text-danger">*</span>
          </span>
          <input
            name="total_marks"
            type="number"
            min={1}
            required
            defaultValue={defaultValues?.total_marks ?? 100}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium">
            Passing Marks <span className="text-danger">*</span>
          </span>
          <input
            name="passing_marks"
            type="number"
            min={0}
            required
            defaultValue={defaultValues?.passing_marks ?? 33}
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
