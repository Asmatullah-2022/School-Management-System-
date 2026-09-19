"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCheck } from "lucide-react";

export function MarkAllReadButton({ action }: { action: () => Promise<void> }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <button
      disabled={pending}
      onClick={() => startTransition(async () => {
        await action();
        router.refresh();
      })}
      className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm font-medium hover:bg-background disabled:opacity-60"
    >
      <CheckCheck size={15} /> {pending ? "Marking…" : "Mark All Read"}
    </button>
  );
}
