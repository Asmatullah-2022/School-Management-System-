"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Bell, CheckCheck } from "lucide-react";
import type { Notification } from "@/types/database";

const TYPE_LABELS: Record<string, string> = {
  fee_reminder: "Fee Reminder",
  attendance: "Attendance",
  homework: "Homework",
  exam: "Exam",
  result: "Result",
  leave: "Leave Request",
  notice: "Notice",
  general: "General",
};

export function NotificationList({
  notifications,
  markReadAction,
}: {
  notifications: Notification[];
  markReadAction: (id: string) => Promise<void>;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  if (notifications.length === 0) {
    return <p className="px-5 py-10 text-center text-sm text-muted">No notifications yet.</p>;
  }

  return (
    <ul className="divide-y divide-border">
      {notifications.map((n) => {
        const content = (
          <div className={`flex items-start gap-3 px-4 py-3.5 sm:px-5 ${!n.is_read ? "bg-primary/5" : ""}`}>
            <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${!n.is_read ? "bg-primary/10 text-primary" : "bg-muted/10 text-muted"}`}>
              <Bell size={15} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="truncate text-sm font-medium">{n.title}</p>
                {!n.is_read && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />}
              </div>
              {n.message && <p className="mt-0.5 text-sm text-muted">{n.message}</p>}
              <p className="mt-1 text-xs text-muted">
                {TYPE_LABELS[n.type] ?? n.type} · {n.created_at ? new Date(n.created_at).toLocaleString() : ""}
              </p>
            </div>
            {!n.is_read && (
              <button
                type="button"
                disabled={pending}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  startTransition(async () => {
                    await markReadAction(n.id);
                    router.refresh();
                  });
                }}
                className="shrink-0 rounded-md p-1.5 text-muted hover:bg-background hover:text-primary"
                aria-label="Mark as read"
              >
                <CheckCheck size={15} />
              </button>
            )}
          </div>
        );

        return <li key={n.id}>{n.link ? <Link href={n.link}>{content}</Link> : content}</li>;
      })}
    </ul>
  );
}
