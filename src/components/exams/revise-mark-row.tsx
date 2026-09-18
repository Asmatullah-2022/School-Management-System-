"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Pencil } from "lucide-react";
import type { Mark, Student } from "@/types/database";

export function ReviseMarkRow({
  student,
  mark,
  totalMarks,
  examId,
  action,
}: {
  student: Student;
  mark: Mark | undefined;
  totalMarks: number;
  examId: string;
  action: (examId: string, markId: string, newMarks: number, reason: string) => Promise<{ error?: string; success?: true } | void>;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(String(mark?.obtained_marks ?? ""));
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  if (!mark) return null;

  const save = () => {
    setError(null);
    const num = Number(value);
    if (Number.isNaN(num) || num < 0 || num > totalMarks) {
      setError(`Marks must be between 0 and ${totalMarks}.`);
      return;
    }
    if (!reason.trim()) {
      setError("A reason is required to change a published mark.");
      return;
    }
    startTransition(async () => {
      const res = await action(examId, mark.id, num, reason);
      if (res?.error) {
        setError(res.error);
        return;
      }
      setEditing(false);
      setReason("");
      router.refresh();
    });
  };

  return (
    <li className="px-4 py-3">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{student.full_name}</p>
          <p className="text-xs text-muted">Roll #{student.roll_number ?? "—"}</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span className="text-sm font-medium">
            {mark.obtained_marks} / {totalMarks}
          </span>
          <button
            onClick={() => setEditing((v) => !v)}
            className="rounded-md p-1.5 text-muted hover:bg-background hover:text-primary"
            aria-label={`Revise ${student.full_name}'s mark`}
          >
            <Pencil size={14} />
          </button>
        </div>
      </div>

      {editing && (
        <div className="mt-3 space-y-2 rounded-lg border border-warning/30 bg-warning/5 p-3">
          {error && <p className="text-xs text-danger">{error}</p>}
          <div className="flex items-center gap-2">
            <label className="text-xs text-muted">New marks</label>
            <input
              type="number"
              min={0}
              max={totalMarks}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="w-20 rounded-lg border border-border bg-background px-2 py-1.5 text-sm outline-none focus:border-primary"
            />
          </div>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Reason for changing a published mark (required)"
            rows={2}
            className="w-full rounded-lg border border-border bg-background px-2 py-1.5 text-sm outline-none focus:border-primary"
          />
          <div className="flex justify-end gap-2">
            <button onClick={() => setEditing(false)} className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium">
              Cancel
            </button>
            <button
              onClick={save}
              disabled={pending}
              className="rounded-lg bg-warning px-3 py-1.5 text-xs font-medium text-white disabled:opacity-60"
            >
              {pending ? "Saving…" : "Save Revision"}
            </button>
          </div>
        </div>
      )}
    </li>
  );
}
