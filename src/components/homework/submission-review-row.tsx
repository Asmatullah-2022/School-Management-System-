"use client";

import { useState } from "react";
import { useActionForm } from "@/lib/hooks/use-action-form";
import type { HomeworkAssignment, Student } from "@/types/database";

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-muted/10 text-muted",
  submitted: "bg-primary/10 text-primary",
  late: "bg-warning/10 text-warning",
  checked: "bg-success/10 text-success",
};

export function SubmissionReviewRow({
  student,
  submission,
  maxMarks,
  action,
}: {
  student: Student;
  submission: HomeworkAssignment | undefined;
  maxMarks: number | null | undefined;
  action: (id: string, marks: number | null, remarks: string | null) => Promise<{ error?: string } | void>;
}) {
  const [open, setOpen] = useState(false);
  const status = submission?.status ?? "pending";
  const { error, pending, handleSubmit } = useActionForm(async (fd) => {
    if (!submission) return { error: "No submission to review yet." };
    const marks = fd.get("marks") ? Number(fd.get("marks")) : null;
    const remarks = String(fd.get("remarks") ?? "").trim() || null;
    const res = await action(submission.id, marks, remarks);
    if (!res?.error) setOpen(false);
    return res;
  });

  return (
    <li className="px-4 py-3 text-sm">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-medium">{student.full_name}</p>
          <p className="text-xs text-muted">Roll #{student.roll_number ?? "—"}</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {submission?.marks != null && <span className="text-xs text-muted">{submission.marks}/{maxMarks ?? "—"}</span>}
          <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${STATUS_STYLES[status]}`}>{status}</span>
          {submission && status !== "pending" && (
            <button onClick={() => setOpen((v) => !v)} className="text-xs font-medium text-primary hover:underline">
              {status === "checked" ? "Edit Review" : "Review"}
            </button>
          )}
        </div>
      </div>

      {submission?.submission_url && (
        <a href={submission.submission_url} target="_blank" rel="noreferrer" className="mt-1 inline-block text-xs text-primary hover:underline">
          View submission
        </a>
      )}
      {submission?.comment && <p className="mt-1 text-xs text-muted">Student comment: {submission.comment}</p>}

      {open && (
        <form onSubmit={handleSubmit} className="mt-3 space-y-2 rounded-lg border border-border bg-background p-3">
          {error && <p className="text-xs text-danger">{error}</p>}
          <div className="flex items-center gap-2">
            <label className="text-xs text-muted">Marks</label>
            <input name="marks" type="number" min={0} max={maxMarks ?? undefined} defaultValue={submission?.marks ?? ""} className="w-20 rounded-lg border border-border bg-surface px-2 py-1.5 text-sm outline-none focus:border-primary" />
            {maxMarks != null && <span className="text-xs text-muted">/ {maxMarks}</span>}
          </div>
          <textarea name="remarks" rows={2} placeholder="Feedback for the student" defaultValue={submission?.remarks ?? ""} className="w-full rounded-lg border border-border bg-surface px-2 py-1.5 text-sm outline-none focus:border-primary" />
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setOpen(false)} className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium">Cancel</button>
            <button type="submit" disabled={pending} className="rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground disabled:opacity-60">
              {pending ? "Saving…" : "Mark Checked & Save"}
            </button>
          </div>
        </form>
      )}
    </li>
  );
}
