"use client";

import { useState, useTransition } from "react";
import type { NotificationPreferences } from "@/types/database";

const TOGGLES: { key: keyof Omit<NotificationPreferences, "id" | "school_id" | "profile_id">; label: string; hint: string }[] = [
  { key: "homework", label: "Homework", hint: "New homework, checked submissions, feedback" },
  { key: "events", label: "Events", hint: "New school events, reminders" },
  { key: "notices", label: "Notices", hint: "New school/class notices" },
  { key: "fee_reminders", label: "Fee Reminders", hint: "Outstanding balance reminders, payment confirmations" },
  { key: "exam_notifications", label: "Exam Notifications", hint: "Exam schedule announcements" },
  { key: "result_notifications", label: "Result Notifications", hint: "When a result is published" },
];

export function PreferencesForm({ preferences, action }: { preferences: NotificationPreferences; action: (formData: FormData) => Promise<void> }) {
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setSaved(false);
        const formData = new FormData(e.currentTarget);
        startTransition(async () => {
          await action(formData);
          setSaved(true);
        });
      }}
      className="space-y-4"
    >
      {saved && <p className="rounded-lg bg-success/10 px-3 py-2 text-sm text-success">Preferences saved.</p>}
      <p className="text-sm text-muted">
        Attendance, leave decisions, and system notifications are always sent — these are the non-critical categories you can mute.
      </p>
      <div className="space-y-3">
        {TOGGLES.map((t) => (
          <label key={t.key} className="flex items-center justify-between gap-3 rounded-lg border border-border px-4 py-3">
            <div>
              <p className="text-sm font-medium">{t.label}</p>
              <p className="text-xs text-muted">{t.hint}</p>
            </div>
            <input type="checkbox" name={t.key} defaultChecked={preferences[t.key]} className="h-5 w-5 shrink-0 rounded border-border" />
          </label>
        ))}
      </div>
      <button type="submit" disabled={pending} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-60">
        {pending ? "Saving…" : "Save Preferences"}
      </button>
    </form>
  );
}
