"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

export function AcknowledgeButton({
  noticeId,
  action,
}: {
  noticeId: string;
  action: (noticeId: string) => Promise<void>;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <button
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          await action(noticeId);
          router.refresh();
        })
      }
      className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60"
    >
      {pending ? "Saving…" : "Acknowledge"}
    </button>
  );
}
