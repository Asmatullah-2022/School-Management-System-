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

function SubmitRow({
  homework,
  submission,
  action,
}: {
  homework: HomeworkRecord;
  submission: HomeworkAssignment | undefined;
  action: (id: string, formData: FormData) => Promise<{ error?: string } | void>;
}) {
  const [open, setOpen] = useState(false);
  const { error, pending, handleSubmit } = useActionForm(action.bind(null, homework.id));
  const isResubmit = !!submission;

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="mt-2 text-xs font-medium text-primary hover:underline">
        {isResubmit ? "Replace submission" : "Submit homework"}
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-2 space-y-2">
      {error && <p className="rounded-lg bg-danger/10 px-2 py-1.5 text-xs text-danger">{error}</p>}
      <input
        name="submission_url"
        placeholder="Link to your work (optional)"
        defaultValue={submission?.submission_url ?? ""}
        className="w-full rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs outline-none focus:border-primary"
      />
      <textarea
        name="comment"
        rows={2}
        placeholder="Add a comment for your teacher (optional)"
        defaultValue={submission?.comment ?? ""}
        className="w-full rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs outline-none focus:border-primary"
      />
      <div className="flex gap-2">
        <button type="submit" disabled={pending} className="rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground disabled:opacity-60">
          {pending ? "Submitting…" : isResubmit ? "Replace Submission" : "Confirm Submission"}
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
        const pastDeadline = new Date(homework.due_date) < new Date(new Date().toDateString());
        const overdue = status === "pending" && pastDeadline;
        const canSubmit = !pastDeadline || homework.allow_late;
        return (
          <div key={homework.id} className="rounded-2xl border border-border bg-surface p-4 shadow-sm">
            <div className="mb-2 flex items-center justify-between">
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">{subjectName}</span>
              <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${STATUS_STYLES[overdue ? "late" : status]}`}>
                {overdue ? "Overdue" : status}
              </span>
            </div>
            <h3 className="text-sm font-semibold">{homework.title}</h3>
            {homework.description && <p className="mt-1 text-sm text-muted">{homework.description}</p>}
            {homework.instructions && <p className="mt-1 text-xs italic text-muted">Instructions: {homework.instructions}</p>}
            {homework.attachment_url && (
              <a href={homework.attachment_url} target="_blank" rel="noreferrer" className="mt-1 block text-xs font-medium text-primary hover:underline">
                View attachment
              </a>
            )}
            <div className="mt-3 flex items-center justify-between text-xs text-muted">
              <span>{teacherName}</span>
              <span>Due {new Date(homework.due_date).toLocaleDateString()}{homework.max_marks ? ` · ${homework.max_marks} marks` : ""}</span>
            </div>
            {submission?.status === "checked" && (
              <p className="mt-2 rounded-lg bg-primary/5 px-2 py-1.5 text-xs text-primary">
                Marks: {submission.marks ?? "—"}{homework.max_marks ? ` / ${homework.max_marks}` : ""}
                {submission.remarks ? ` · Feedback: ${submission.remarks}` : ""}
              </p>
            )}
            {!readOnly && action && status !== "checked" && (canSubmit || isSubmitted(status)) && (
              <SubmitRow homework={homework} submission={submission} action={action} />
            )}
            {!readOnly && !canSubmit && status === "pending" && (
              <p className="mt-2 text-xs text-danger">The deadline has passed and late submissions are not allowed.</p>
            )}
            {submission?.submission_url && status !== "pending" && (
              <a href={submission.submission_url} target="_blank" rel="noreferrer" className="mt-2 block text-xs font-medium text-primary hover:underline">
                View my submission
              </a>
            )}
            {submission?.comment && <p className="mt-1 text-xs text-muted">My comment: {submission.comment}</p>}
          </div>
        );
      })}
      {items.length === 0 && <p className="text-sm text-muted">No homework assigned.</p>}
    </div>
  );
}

function isSubmitted(status: string) {
  return status === "submitted" || status === "late";
}
