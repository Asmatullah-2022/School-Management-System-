"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

export function EndAssignmentButton({ id, action }: { id: string; action: (id: string) => Promise<void> }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <button
      disabled={pending}
      onClick={() => startTransition(async () => { await action(id); router.refresh(); })}
      className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-danger hover:bg-background disabled:opacity-60"
    >
      {pending ? "Ending…" : "End Assignment"}
    </button>
  );
}
