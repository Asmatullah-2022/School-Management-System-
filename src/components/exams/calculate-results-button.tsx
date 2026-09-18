"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Calculator } from "lucide-react";

export function CalculateResultsButton({
  examId,
  action,
}: {
  examId: string;
  action: (examId: string) => Promise<{ error?: string; success?: true } | void>;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="flex flex-col items-end gap-1">
      {error && <p className="text-xs text-danger">{error}</p>}
      <button
        onClick={() =>
          startTransition(async () => {
            const res = await action(examId);
            if (res?.error) {
              setError(res.error);
              return;
            }
            router.refresh();
          })
        }
        disabled={pending}
        className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60"
      >
        <Calculator size={15} /> {pending ? "Calculating…" : "Calculate Results"}
      </button>
    </div>
  );
}
