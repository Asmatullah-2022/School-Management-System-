"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { ExamSubject, Mark, Student } from "@/types/database";

export function MarksEntryForm({
  examId,
  examSubject,
  students,
  existingMarks,
  readOnly,
  saveAction,
}: {
  examId: string;
  examSubject: ExamSubject;
  students: Student[];
  existingMarks: Mark[];
  readOnly: boolean;
  saveAction: (
    examId: string,
    examSubjectId: string,
    rows: { student_id: string; obtained_marks: number }[],
    status: "draft" | "submitted"
  ) => Promise<{ error?: string; success?: true } | void>;
}) {
  const router = useRouter();
  const [values, setValues] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    for (const s of students) {
      const mark = existingMarks.find((m) => m.student_id === s.id);
      initial[s.id] = mark ? String(mark.obtained_marks) : "";
    }
    return initial;
  });
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const allFilled = useMemo(() => students.every((s) => values[s.id] !== "" && values[s.id] !== undefined), [students, values]);

  const buildRows = () =>
    students
      .filter((s) => values[s.id] !== "" && values[s.id] !== undefined)
      .map((s) => ({ student_id: s.id, obtained_marks: Number(values[s.id]) }));

  const save = (status: "draft" | "submitted") => {
    setError(null);
    setNotice(null);
    const rows = buildRows();
    if (status === "submitted" && rows.length !== students.length) {
      setError("Enter marks for every student before submitting.");
      return;
    }
    for (const row of rows) {
      if (row.obtained_marks < 0 || row.obtained_marks > examSubject.total_marks) {
        setError(`Marks must be between 0 and ${examSubject.total_marks}.`);
        return;
      }
    }
    startTransition(async () => {
      const res = await saveAction(examId, examSubject.id, rows, status);
      if (res?.error) {
        setError(res.error);
        return;
      }
      setNotice(status === "draft" ? "Draft saved." : "Marks submitted for verification.");
      router.refresh();
    });
  };

  return (
    <div className="space-y-4">
      {error && <p className="rounded-lg border border-danger/30 bg-danger/10 px-4 py-2 text-sm text-danger">{error}</p>}
      {notice && <p className="rounded-lg border border-success/30 bg-success/10 px-4 py-2 text-sm text-success">{notice}</p>}

      <ul className="divide-y divide-border rounded-xl border border-border">
        {students.map((s) => (
          <li key={s.id} className="flex items-center justify-between gap-3 px-4 py-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{s.full_name}</p>
              <p className="text-xs text-muted">Roll #{s.roll_number ?? "—"}</p>
            </div>
            <div className="flex shrink-0 items-center gap-1.5">
              <input
                type="number"
                min={0}
                max={examSubject.total_marks}
                inputMode="numeric"
                disabled={readOnly}
                value={values[s.id] ?? ""}
                onChange={(e) => setValues((v) => ({ ...v, [s.id]: e.target.value }))}
                className="w-20 rounded-lg border border-border bg-background px-2 py-2 text-right text-sm outline-none focus:border-primary disabled:opacity-60"
              />
              <span className="text-xs text-muted">/ {examSubject.total_marks}</span>
            </div>
          </li>
        ))}
      </ul>

      {!readOnly && (
        <div className="flex flex-wrap items-center justify-end gap-2">
          <button
            onClick={() => save("draft")}
            disabled={pending}
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium disabled:opacity-60"
          >
            Save Draft
          </button>
          <button
            onClick={() => save("submitted")}
            disabled={pending || !allFilled}
            className="rounded-lg bg-primary px-5 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60"
          >
            {pending ? "Saving…" : "Submit Marks"}
          </button>
        </div>
      )}
    </div>
  );
}
