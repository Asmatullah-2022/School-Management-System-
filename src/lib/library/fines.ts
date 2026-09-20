import type { BookIssue, LibrarySettings } from "@/types/database";

/** Days an issue is overdue as of `asOf` (default today) — 0 if not yet
 * due or already returned on time. Shared by the return workflow and the
 * overdue/fine reports so they can never disagree. */
export function daysOverdue(issue: Pick<BookIssue, "due_date" | "return_date">, asOf: string = new Date().toISOString().slice(0, 10)): number {
  const referenceDate = issue.return_date && issue.return_date < asOf ? issue.return_date : asOf;
  const due = new Date(issue.due_date).getTime();
  const ref = new Date(referenceDate).getTime();
  const diffDays = Math.floor((ref - due) / (1000 * 60 * 60 * 24));
  return Math.max(diffDays, 0);
}

/** Fine for an issue, applying the school's configured per-day rate,
 * grace period, and optional maximum cap. */
export function computeFine(issue: Pick<BookIssue, "due_date" | "return_date">, settings: LibrarySettings, asOf?: string): number {
  const overdueDays = daysOverdue(issue, asOf);
  const billableDays = Math.max(overdueDays - settings.grace_period_days, 0);
  const fine = billableDays * settings.fine_per_day;
  return settings.max_fine != null ? Math.min(fine, settings.max_fine) : fine;
}
