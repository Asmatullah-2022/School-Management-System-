import { CheckCircle2, Clock } from "lucide-react";
import { Card, CardHeader, EmptyState } from "@/components/ui/card";
import { daysOverdue, computeFine } from "@/lib/library/fines";
import type { Book, BookIssue, LibrarySettings, Student } from "@/types/database";

/** Read-only "my/child's issued books" view for students and parents.
 * `issues` must already be pre-filtered to the viewer's own/child's
 * student_id(s) by the caller — this component never re-derives that
 * scope itself, matching the "server fetches, client only filters what
 * it was given" pattern used throughout the parent/student portal. */
export function MyLibraryView({ issues, books, settings, student }: { issues: BookIssue[]; books: Book[]; settings: LibrarySettings; student?: Student }) {
  const current = issues.filter((i) => i.status === "issued");
  const overdue = current.filter((i) => daysOverdue(i) > 0);
  const totalFines = issues.filter((i) => i.status === "returned").reduce((s, i) => s + i.fine_amount, 0) + overdue.reduce((s, i) => s + computeFine(i, settings), 0);

  return (
    <div className="space-y-4">
      {student && <h2 className="text-lg font-semibold">{student.full_name}&apos;s Library Record</h2>}

      <Card>
        <CardHeader title="Currently Issued Books" />
        {current.length === 0 ? (
          <EmptyState label="No books currently issued." />
        ) : (
          <ul className="divide-y divide-border">
            {current.map((issue) => {
              const book = books.find((b) => b.id === issue.book_id);
              const overdueDays = daysOverdue(issue);
              return (
                <li key={issue.id} className="flex items-center justify-between px-5 py-3 text-sm">
                  <div>
                    <p className="font-medium">{book?.title ?? "Unknown book"}</p>
                    <p className="text-xs text-muted">Issued {new Date(issue.issue_date).toLocaleDateString()} · Due {new Date(issue.due_date).toLocaleDateString()}</p>
                  </div>
                  {overdueDays > 0 ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-danger/10 px-2 py-0.5 text-xs font-medium text-danger">
                      <Clock size={12} /> {overdueDays}d overdue · PKR {computeFine(issue, settings)}
                    </span>
                  ) : (
                    <span className="rounded-full bg-success/10 px-2 py-0.5 text-xs font-medium text-success">On time</span>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </Card>

      <Card>
        <CardHeader title="Borrowing History" />
        {issues.filter((i) => i.status === "returned").length === 0 ? (
          <EmptyState label="No returned books yet." />
        ) : (
          <ul className="divide-y divide-border">
            {issues.filter((i) => i.status === "returned").map((issue) => (
              <li key={issue.id} className="flex items-center justify-between px-5 py-3 text-sm">
                <div>
                  <p className="font-medium">{books.find((b) => b.id === issue.book_id)?.title ?? "Unknown book"}</p>
                  <p className="text-xs text-muted">Returned {issue.return_date ? new Date(issue.return_date).toLocaleDateString() : "—"}</p>
                </div>
                {issue.fine_amount > 0 ? (
                  <span className="text-xs font-medium text-danger">Fine: PKR {issue.fine_amount}</span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs text-success"><CheckCircle2 size={12} /> No fine</span>
                )}
              </li>
            ))}
          </ul>
        )}
      </Card>

      {totalFines > 0 && (
        <Card className="p-4">
          <p className="text-sm font-medium text-danger">Total outstanding/recorded fines: PKR {totalFines.toLocaleString()}</p>
        </Card>
      )}
    </div>
  );
}
