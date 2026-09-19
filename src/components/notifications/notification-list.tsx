"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Bell, Check, RotateCcw } from "lucide-react";
import type { Notification } from "@/types/database";

const CATEGORIES = [
  { key: "all", label: "All" },
  { key: "attendance", label: "Attendance" },
  { key: "homework", label: "Homework" },
  { key: "exams", label: "Exams" },
  { key: "results", label: "Results" },
  { key: "fees", label: "Fees" },
  { key: "leave", label: "Leave" },
  { key: "notices", label: "Notices" },
  { key: "events", label: "Events" },
  { key: "system", label: "System" },
] as const;

// Legacy `type` values created before the Phase 7 category list existed
// (e.g. Phase 5's "fee_reminder") map onto the nearest real category so
// old notifications still filter correctly.
const LEGACY_TYPE_MAP: Record<string, string> = {
  fee_reminder: "fees",
  general: "system",
};

function categoryOf(type: string): string {
  return LEGACY_TYPE_MAP[type] ?? type;
}

const TYPE_LABELS: Record<string, string> = {
  fee_reminder: "Fee Reminder",
  attendance: "Attendance",
  homework: "Homework",
  exams: "Exam",
  results: "Result",
  fees: "Fees",
  leave: "Leave Request",
  notices: "Notice",
  events: "Event",
  system: "System",
  general: "General",
};

const PAGE_SIZE = 15;

export function NotificationList({
  notifications,
  markReadAction,
  markUnreadAction,
}: {
  notifications: Notification[];
  markReadAction: (id: string) => Promise<void>;
  markUnreadAction: (id: string) => Promise<void>;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [category, setCategory] = useState<string>("all");
  const [visible, setVisible] = useState(PAGE_SIZE);

  const filtered = useMemo(
    () => (category === "all" ? notifications : notifications.filter((n) => categoryOf(n.type) === category)),
    [notifications, category]
  );
  const page = filtered.slice(0, visible);

  return (
    <div>
      <div className="flex flex-wrap gap-1.5 border-b border-border p-3">
        {CATEGORIES.map((c) => (
          <button
            key={c.key}
            onClick={() => {
              setCategory(c.key);
              setVisible(PAGE_SIZE);
            }}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
              category === c.key ? "bg-primary text-primary-foreground" : "border border-border text-muted hover:bg-background"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {page.length === 0 ? (
        <p className="px-5 py-10 text-center text-sm text-muted">No notifications in this category.</p>
      ) : (
        <ul className="divide-y divide-border">
          {page.map((n) => {
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
                <button
                  type="button"
                  disabled={pending}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    startTransition(async () => {
                      await (n.is_read ? markUnreadAction(n.id) : markReadAction(n.id));
                      router.refresh();
                    });
                  }}
                  className="shrink-0 rounded-md p-1.5 text-muted hover:bg-background hover:text-primary"
                  aria-label={n.is_read ? "Mark as unread" : "Mark as read"}
                  title={n.is_read ? "Mark as unread" : "Mark as read"}
                >
                  {n.is_read ? <RotateCcw size={15} /> : <Check size={15} />}
                </button>
              </div>
            );

            return <li key={n.id}>{n.link ? <Link href={n.link}>{content}</Link> : content}</li>;
          })}
        </ul>
      )}

      {visible < filtered.length && (
        <div className="border-t border-border p-3 text-center">
          <button onClick={() => setVisible((v) => v + PAGE_SIZE)} className="text-xs font-medium text-primary hover:underline">
            Show more ({filtered.length - visible} remaining)
          </button>
        </div>
      )}
    </div>
  );
}
