"use client";

import { useState, useTransition } from "react";
import type { HomeworkRecord, SchoolClass, Section, Subject, Teacher } from "@/types/database";

export interface AssignmentOption {
  classId: string;
  sectionId: string | null;
  subjectId: string;
  teacherId: string | null;
}

export function HomeworkForm({
  homework,
  options,
  classes,
  sections,
  subjects,
  teachers,
  isAdmin,
  action,
}: {
  homework?: HomeworkRecord;
  options: AssignmentOption[];
  classes: SchoolClass[];
  sections: Section[];
  subjects: Subject[];
  teachers: Teacher[];
  isAdmin: boolean;
  action: (formData: FormData, publish: boolean) => Promise<{ error?: string } | void>;
}) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const optionLabel = (o: AssignmentOption) => {
    const cls = classes.find((c) => c.id === o.classId)?.name ?? "—";
    const sec = o.sectionId ? sections.find((s) => s.id === o.sectionId)?.name : null;
    const subj = subjects.find((s) => s.id === o.subjectId)?.name ?? "—";
    const teacher = o.teacherId ? teachers.find((t) => t.id === o.teacherId)?.full_name : null;
    return `${cls}${sec ? " - " + sec : ""} · ${subj}${isAdmin && teacher ? ` (${teacher})` : ""}`;
  };
  const optionValue = (o: AssignmentOption) => `${o.classId}|${o.sectionId ?? ""}|${o.subjectId}|${o.teacherId ?? ""}`;
  const defaultOptionValue = homework
    ? options.find((o) => o.classId === homework.class_id && o.sectionId === (homework.section_id ?? null) && o.subjectId === homework.subject_id)
      ? optionValue(options.find((o) => o.classId === homework.class_id && o.sectionId === (homework.section_id ?? null) && o.subjectId === homework.subject_id)!)
      : ""
    : "";

  const submit = (e: React.FormEvent<HTMLFormElement>, publish: boolean) => {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await action(formData, publish);
      if (res?.error) setError(res.error);
    });
  };

  return (
    <form onSubmit={(e) => submit(e, homework?.stage === "published" || homework?.stage === "closed")} className="space-y-4">
      {error && <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>}

      <div>
        <label className="mb-1 block text-sm font-medium">Class / Section / Subject</label>
        {options.length === 0 ? (
          <p className="rounded-lg border border-warning/30 bg-warning/5 px-3 py-2 text-sm text-warning">
            You have no active subject assignments yet. Contact your school administrator.
          </p>
        ) : (
          <select
            name="assignment"
            required
            defaultValue={defaultOptionValue}
            onChange={(e) => {
              const [classId, sectionId, subjectId, teacherId] = e.target.value.split("|");
              const form = e.target.form!;
              (form.elements.namedItem("class_id") as HTMLInputElement).value = classId;
              (form.elements.namedItem("section_id") as HTMLInputElement).value = sectionId;
              (form.elements.namedItem("subject_id") as HTMLInputElement).value = subjectId;
              (form.elements.namedItem("teacher_id") as HTMLInputElement).value = teacherId;
            }}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
          >
            <option value="">Select…</option>
            {options.map((o) => (
              <option key={optionValue(o)} value={optionValue(o)}>{optionLabel(o)}</option>
            ))}
          </select>
        )}
        <input type="hidden" name="class_id" defaultValue={homework?.class_id ?? ""} />
        <input type="hidden" name="section_id" defaultValue={homework?.section_id ?? ""} />
        <input type="hidden" name="subject_id" defaultValue={homework?.subject_id ?? ""} />
        <input type="hidden" name="teacher_id" defaultValue={homework?.teacher_id ?? ""} />
      </div>

      <label className="block">
        <span className="mb-1 block text-sm font-medium">Title</span>
        <input name="title" required defaultValue={homework?.title} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
      </label>

      <label className="block">
        <span className="mb-1 block text-sm font-medium">Description</span>
        <textarea name="description" rows={2} defaultValue={homework?.description ?? ""} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
      </label>

      <label className="block">
        <span className="mb-1 block text-sm font-medium">Instructions</span>
        <textarea name="instructions" rows={2} placeholder="Formatting, materials needed, etc." defaultValue={homework?.instructions ?? ""} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
      </label>

      <label className="block">
        <span className="mb-1 block text-sm font-medium">Attachment Link (optional)</span>
        <input name="attachment_url" placeholder="https://…" defaultValue={homework?.attachment_url ?? ""} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
      </label>

      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Assigned Date</span>
          <input name="assigned_date" type="date" defaultValue={homework?.assigned_date ?? new Date().toISOString().slice(0, 10)} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Due Date</span>
          <input name="due_date" type="date" required defaultValue={homework?.due_date} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
        </label>
      </div>

      <div className="grid grid-cols-2 items-end gap-3">
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Maximum Marks (optional)</span>
          <input name="max_marks" type="number" min={0} defaultValue={homework?.max_marks ?? ""} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
        </label>
        <label className="flex items-center gap-2 pb-2.5">
          <input type="checkbox" name="allow_late" defaultChecked={homework?.allow_late} className="h-4 w-4 rounded border-border" />
          <span className="text-sm font-medium">Allow late submissions</span>
        </label>
      </div>

      <div className="flex flex-wrap justify-end gap-2 border-t border-border pt-4">
        {homework ? (
          <button type="submit" disabled={pending} className="rounded-lg bg-primary px-5 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60">
            {pending ? "Saving…" : "Save Changes"}
          </button>
        ) : (
          <>
            <button
              type="button"
              disabled={pending}
              onClick={(e) => submit({ preventDefault: () => {}, currentTarget: e.currentTarget.form } as React.FormEvent<HTMLFormElement>, false)}
              className="rounded-lg border border-border px-5 py-2 text-sm font-medium disabled:opacity-60"
            >
              {pending ? "Saving…" : "Save as Draft"}
            </button>
            <button type="submit" disabled={pending} className="rounded-lg bg-primary px-5 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60">
              {pending ? "Publishing…" : "Publish"}
            </button>
          </>
        )}
      </div>
    </form>
  );
}
