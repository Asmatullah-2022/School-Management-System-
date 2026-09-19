"use client";

import { useState } from "react";
import { useActionForm } from "@/lib/hooks/use-action-form";
import type { HomeworkAssignment, HomeworkRecord } from "@/types/database";

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-muted/10 text-muted",
  submitted: "bg-success/10 text-success",
  late: "bg-danger/10 text-danger",
  checked: "bg-primary/10 text-primary",
};

function SubmitRow({ homework, action }: { homework: HomeworkRecord; action: (id: string, formData: FormData) => Promise<{ error?: string } | void> }) {
  const [open, setOpen] = useState(false);
  const { error, pending, handleSubmit } = useActionForm(action.bind(null, homework.id));

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="mt-2 text-xs font-medium text-primary hover:underline">
        Submit homework
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-2 space-y-2">
      {error && <p className="rounded-lg bg-danger/10 px-2 py-1.5 text-xs text-danger">{error}</p>}
      <input
        name="submission_url"
        placeholder="Link to your work (optional)"
        className="w-full rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs outline-none focus:border-primary"
      />
      <div className="flex gap-2">
        <button type="submit" disabled={pending} className="rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground disabled:opacity-60">
          {pending ? "Submitting…" : "Confirm Submission"}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium">
          Cancel
        </button>
      </div>
    </form>
  );
}

export function StudentHomeworkList({
  items,
  action,
  readOnly = false,
}: {
  items: { homework: HomeworkRecord; submission: HomeworkAssignment | undefined; subjectName: string; teacherName: string }[];
  action?: (id: string, formData: FormData) => Promise<{ error?: string } | void>;
  readOnly?: boolean;
}) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map(({ homework, submission, subjectName, teacherName }) => {
        const status = submission?.status ?? "pending";
        const overdue = status === "pending" && new Date(homework.due_date) < new Date(new Date().toDateString());
        return (
          <div key={homework.id} className="rounded-2xl border border-border bg-surface p-4 shadow-sm">
            <div className="mb-2 flex items-center justify-between">
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">{subjectName}</span>
              <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${STATUS_STYLES[overdue ? "late" : status]}`}>
                {overdue ? "Overdue" : status}
              </span>
            </div>
            <h3 className="text-sm font-semibold">{homework.title}</h3>
            <p className="mt-1 text-sm text-muted">{homework.description}</p>
            <div className="mt-3 flex items-center justify-between text-xs text-muted">
              <span>{teacherName}</span>
              <span>Due {new Date(homework.due_date).toLocaleDateString()}</span>
            </div>
            {submission?.remarks && <p className="mt-2 rounded-lg bg-accent/5 px-2 py-1.5 text-xs text-accent">Teacher remarks: {submission.remarks}</p>}
            {!readOnly && action && (status === "pending" || status === "late") && <SubmitRow homework={homework} action={action} />}
            {submission?.submission_url && status !== "pending" && (
              <a href={submission.submission_url} target="_blank" rel="noreferrer" className="mt-2 block text-xs font-medium text-primary hover:underline">
                View my submission
              </a>
            )}
          </div>
        );
      })}
      {items.length === 0 && <p className="text-sm text-muted">No homework assigned.</p>}
    </div>
  );
}
