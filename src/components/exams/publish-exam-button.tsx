"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Send } from "lucide-react";

export function PublishExamButton({
  examId,
  action,
  disabled,
}: {
  examId: string;
  action: (id: string) => Promise<{ error?: string; success?: true } | void>;
  disabled?: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);

  const publish = () => {
    startTransition(async () => {
      const res = await action(examId);
      if (res?.error) {
        setError(res.error);
        setConfirming(false);
        return;
      }
      router.refresh();
    });
  };

  return (
    <div className="flex flex-col items-end gap-1">
      {error && <p className="text-xs text-danger">{error}</p>}
      {confirming ? (
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted">Publish results to students &amp; parents?</span>
          <button
            onClick={publish}
            disabled={pending}
            className="rounded-lg bg-success px-3 py-1.5 text-xs font-medium text-white disabled:opacity-60"
          >
            {pending ? "Publishing…" : "Yes, publish"}
          </button>
          <button onClick={() => setConfirming(false)} className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium">
            Cancel
          </button>
        </div>
      ) : (
        <button
          onClick={() => setConfirming(true)}
          disabled={disabled}
          title={disabled ? "All marks must be verified before publishing" : undefined}
          className="inline-flex items-center gap-1.5 rounded-lg bg-success px-3 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Send size={15} /> Publish
        </button>
      )}
    </div>
  );
}
