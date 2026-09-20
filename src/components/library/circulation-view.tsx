"use client";

import { useMemo, useState } from "react";
import { useActionForm } from "@/lib/hooks/use-action-form";
import { daysOverdue, computeFine } from "@/lib/library/fines";
import { Card, CardHeader, EmptyState } from "@/components/ui/card";
import type { Book, BookIssue, LibrarySettings, Student, Teacher } from "@/types/database";

type Action = (formData: FormData) => Promise<{ error?: string } | void>;

function IssueForm({ books, students, teachers, action }: { books: Book[]; students: Student[]; teachers: Teacher[]; action: Action }) {
  const { error, pending, handleSubmit } = useActionForm(action);
  const [borrowerType, setBorrowerType] = useState<"student" | "teacher">("student");
  const availableBooks = books.filter((b) => b.available_copies > 0 && b.status === "active");

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>}
      <label className="block">
        <span className="mb-1 block text-sm font-medium">Book</span>
        <select name="book_id" required className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary">
          <option value="">Select a book with available copies</option>
          {availableBooks.map((b) => (
            <option key={b.id} value={b.id}>{b.title} ({b.available_copies} available)</option>
          ))}
        </select>
        {availableBooks.length === 0 && <p className="mt-1 text-xs text-danger">No books currently have available copies.</p>}
      </label>

      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Borrower Type</span>
          <select name="borrower_type" value={borrowerType} onChange={(e) => setBorrowerType(e.target.value as "student" | "teacher")} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary">
            <option value="student">Student</option>
            <option value="teacher">Teacher</option>
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium">{borrowerType === "student" ? "Student" : "Teacher"}</span>
          <select name="borrower_id" required className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary">
            <option value="">Select {borrowerType}</option>
            {(borrowerType === "student" ? students : teachers).map((p) => (
              <option key={p.id} value={p.id}>{p.full_name}{"admission_number" in p ? ` (${(p as Student).admission_number})` : ""}</option>
            ))}
          </select>
        </label>
      </div>

      <button type="submit" disabled={pending || availableBooks.length === 0} className="rounded-lg bg-primary px-5 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60">
        {pending ? "Issuing…" : "Issue Book"}
      </button>
    </form>
  );
}

function ReturnRow({ issue, book, borrowerName, settings, action }: { issue: BookIssue; book: Book | undefined; borrowerName: string; settings: LibrarySettings; action: Action }) {
  const { error, pending, handleSubmit } = useActionForm(action);
  const overdue = daysOverdue(issue);
  const fine = computeFine(issue, settings);

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 px-5 py-3 text-sm sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="font-medium">{book?.title ?? "Unknown book"}</p>
        <p className="text-xs text-muted">
          {borrowerName} · Due {new Date(issue.due_date).toLocaleDateString()}
          {overdue > 0 && <span className="text-danger"> · {overdue} day{overdue === 1 ? "" : "s"} overdue · Fine PKR {fine}</span>}
        </p>
        {error && <p className="mt-1 text-xs text-danger">{error}</p>}
      </div>
      <div className="flex items-center gap-2">
        <select name="condition" defaultValue="good" className="rounded-lg border border-border bg-background px-2 py-1.5 text-xs outline-none focus:border-primary">
          <option value="new">New</option>
          <option value="good">Good</option>
          <option value="fair">Fair</option>
          <option value="damaged">Damaged</option>
        </select>
        <button type="submit" disabled={pending} className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:bg-background disabled:opacity-60">
          {pending ? "Processing…" : "Return"}
        </button>
      </div>
    </form>
  );
}

export function CirculationView({
  books,
  issues,
  students,
  teachers,
  settings,
  canIssue,
  issueAction,
  returnAction,
}: {
  books: Book[];
  issues: BookIssue[];
  students: Student[];
  teachers: Teacher[];
  settings: LibrarySettings;
  canIssue: boolean;
  issueAction: Action;
  returnAction: (issueId: string, formData: FormData) => Promise<{ error?: string } | void>;
}) {
  const [tab, setTab] = useState<"issue" | "current" | "overdue">(canIssue ? "issue" : "current");

  const borrowerName = (issue: BookIssue) =>
    issue.student_id ? students.find((s) => s.id === issue.student_id)?.full_name ?? "Unknown student" : teachers.find((t) => t.id === issue.teacher_id)?.full_name ?? "Unknown teacher";

  const current = useMemo(() => issues.filter((i) => i.status === "issued"), [issues]);
  const overdue = useMemo(() => current.filter((i) => daysOverdue(i) > 0), [current]);

  const tabs = [
    ...(canIssue ? [{ key: "issue" as const, label: "Issue New" }] : []),
    { key: "current" as const, label: `Currently Issued (${current.length})` },
    { key: "overdue" as const, label: `Overdue (${overdue.length})` },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium ${tab === t.key ? "bg-primary text-primary-foreground" : "border border-border hover:bg-background"}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "issue" && canIssue && (
        <Card className="p-5 sm:p-6">
          <IssueForm books={books} students={students} teachers={teachers} action={issueAction} />
        </Card>
      )}

      {tab === "current" && (
        <Card>
          <CardHeader title="Currently Issued Books" />
          {current.length === 0 ? (
            <EmptyState label="No books are currently issued." />
          ) : (
            <ul className="divide-y divide-border">
              {current.map((issue) => (
                <li key={issue.id}>
                  <ReturnRow issue={issue} book={books.find((b) => b.id === issue.book_id)} borrowerName={borrowerName(issue)} settings={settings} action={returnAction.bind(null, issue.id)} />
                </li>
              ))}
            </ul>
          )}
        </Card>
      )}

      {tab === "overdue" && (
        <Card>
          <CardHeader title="Overdue Books" />
          {overdue.length === 0 ? (
            <EmptyState label="No overdue books. 🎉" />
          ) : (
            <ul className="divide-y divide-border">
              {overdue.map((issue) => (
                <li key={issue.id}>
                  <ReturnRow issue={issue} book={books.find((b) => b.id === issue.book_id)} borrowerName={borrowerName(issue)} settings={settings} action={returnAction.bind(null, issue.id)} />
                </li>
              ))}
            </ul>
          )}
        </Card>
      )}
    </div>
  );
}
