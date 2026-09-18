"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

export function DeleteScheduleButton({
  examId,
  scheduleId,
  action,
  children,
}: {
  examId: string;
  scheduleId: string;
  action: (examId: string, id: string) => Promise<{ error?: string; success?: true } | void>;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="relative">
      <button
        onClick={() =>
          startTransition(async () => {
            const res = await action(examId, scheduleId);
            if (res?.error) {
              setError(res.error);
              setTimeout(() => setError(null), 4000);
              return;
            }
            router.refresh();
          })
        }
        disabled={pending}
        className="rounded-md p-1.5 text-muted hover:bg-background hover:text-danger disabled:opacity-50"
        aria-label="Remove schedule entry"
      >
        {children}
      </button>
      {error && (
        <p className="absolute right-0 top-full z-10 mt-1 w-56 rounded-lg border border-danger/30 bg-surface px-3 py-2 text-xs text-danger shadow-md">
          {error}
        </p>
      )}
    </div>
  );
}
