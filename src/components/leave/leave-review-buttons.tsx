"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, XCircle } from "lucide-react";

export function LeaveReviewButtons({
  id,
  action,
}: {
  id: string;
  action: (id: string, status: "approved" | "rejected", remarks?: string) => Promise<{ error?: string } | void>;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const decide = (status: "approved" | "rejected") => {
    setError(null);
    startTransition(async () => {
      const res = await action(id, status);
      if (res?.error) setError(res.error);
      else router.refresh();
    });
  };

  return (
    <div className="flex items-center gap-2">
      {error && <span className="text-xs text-danger">{error}</span>}
      <button disabled={pending} onClick={() => decide("approved")} className="rounded-md p-1.5 text-success hover:bg-success/10" aria-label="Approve">
        <CheckCircle2 size={16} />
      </button>
      <button disabled={pending} onClick={() => decide("rejected")} className="rounded-md p-1.5 text-danger hover:bg-danger/10" aria-label="Reject">
        <XCircle size={16} />
      </button>
    </div>
  );
}
