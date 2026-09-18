"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

export function VerifyMarksControls({
  examId,
  examSubjectId,
  canVerify,
  canReopen,
  verifyAction,
  reopenAction,
}: {
  examId: string;
  examSubjectId: string;
  canVerify: boolean;
  canReopen: boolean;
  verifyAction: (examId: string, examSubjectId: string) => Promise<{ error?: string; success?: true } | void>;
  reopenAction: (examId: string, examSubjectId: string) => Promise<{ error?: string; success?: true } | void>;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const run = (action: (examId: string, examSubjectId: string) => Promise<{ error?: string } | void>) => {
    setError(null);
    startTransition(async () => {
      const res = await action(examId, examSubjectId);
      if (res?.error) {
        setError(res.error);
        return;
      }
      router.refresh();
    });
  };

  if (!canVerify && !canReopen) return null;

  return (
    <div className="flex flex-col items-end gap-1">
      {error && <p className="text-xs text-danger">{error}</p>}
      <div className="flex gap-2">
        {canVerify && (
          <button
            onClick={() => run(verifyAction)}
            disabled={pending}
            className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
          >
            {pending ? "Verifying…" : "Verify Marks"}
          </button>
        )}
        {canReopen && (
          <button
            onClick={() => run(reopenAction)}
            disabled={pending}
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium disabled:opacity-60"
          >
            Reopen for Editing
          </button>
        )}
      </div>
    </div>
  );
}
