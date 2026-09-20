import { BookOpen, BookCheck, BookX, Clock, Users, Wallet, PlusCircle } from "lucide-react";
import { StatCard } from "@/components/dashboard/stat-card";
import { Card, CardHeader, EmptyState } from "@/components/ui/card";
import { ClassDistributionChart, SimpleBarChart } from "@/components/dashboard/charts";
import { daysOverdue, computeFine } from "@/lib/library/fines";
import type { LibraryDataset } from "@/lib/reports/library-reports";

export function LibraryDashboard({ data }: { data: LibraryDataset }) {
  const totalBooks = data.books.reduce((sum, b) => sum + b.total_copies, 0);
  const availableBooks = data.books.reduce((sum, b) => sum + b.available_copies, 0);
  const currentIssues = data.issues.filter((i) => i.status === "issued");
  const overdueIssues = currentIssues.filter((i) => daysOverdue(i) > 0);

  const borrowerKey = (i: (typeof data.issues)[number]) => (i.student_id ? `s:${i.student_id}` : i.teacher_id ? `t:${i.teacher_id}` : null);
  const totalMembers = new Set(data.issues.map(borrowerKey).filter(Boolean)).size;

  const totalFines =
    data.issues.filter((i) => i.status === "returned").reduce((sum, i) => sum + i.fine_amount, 0) +
    overdueIssues.reduce((sum, i) => sum + computeFine(i, data.settings), 0);

  const now = new Date();
  const booksAddedThisMonth = data.books.filter((b) => b.created_at && new Date(b.created_at).getMonth() === now.getMonth() && new Date(b.created_at).getFullYear() === now.getFullYear()).length;

  const categoryData = Array.from(
    data.books.reduce((map, b) => {
      const key = b.category ?? "Uncategorized";
      map.set(key, (map.get(key) ?? 0) + 1);
      return map;
    }, new Map<string, number>())
  ).map(([name, value]) => ({ name, value }));

  const issueCounts = new Map<string, number>();
  for (const i of data.issues) issueCounts.set(i.book_id, (issueCounts.get(i.book_id) ?? 0) + 1);
  const popularBooks = Array.from(issueCounts.entries())
    .map(([bookId, count]) => ({ label: data.books.find((b) => b.id === bookId)?.title ?? "Unknown", value: count }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().slice(0, 10);
  });
  const activityData = last7Days.map((date) => ({
    label: new Date(date).toLocaleDateString(undefined, { weekday: "short" }),
    value: data.issues.filter((i) => i.issue_date === date).length,
  }));

  const overdueByBook = Array.from(
    overdueIssues.reduce((map, i) => {
      const title = data.books.find((b) => b.id === i.book_id)?.title ?? "Unknown";
      map.set(title, (map.get(title) ?? 0) + 1);
      return map;
    }, new Map<string, number>())
  ).map(([label, value]) => ({ label, value }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        <StatCard label="Total Books" value={totalBooks} icon={BookOpen} tone="primary" />
        <StatCard label="Available Books" value={availableBooks} icon={BookCheck} tone="success" />
        <StatCard label="Issued Books" value={currentIssues.length} icon={BookOpen} tone="accent" />
        <StatCard label="Overdue Books" value={overdueIssues.length} icon={BookX} tone={overdueIssues.length ? "danger" : "success"} />
        <StatCard label="Total Members" value={totalMembers} icon={Users} tone="primary" />
        <StatCard label="Total Fines" value={`PKR ${totalFines.toLocaleString()}`} icon={Wallet} tone={totalFines ? "warning" : "success"} />
        <StatCard label="Books Added This Month" value={booksAddedThisMonth} icon={PlusCircle} tone="accent" />
        <StatCard label="Overdue Fine Rate" value={`PKR ${data.settings.fine_per_day}/day`} icon={Clock} tone="warning" />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title="Books by Category" />
          <div className="p-4">
            {categoryData.length ? <ClassDistributionChart data={categoryData} /> : <EmptyState label="No books yet." />}
          </div>
        </Card>
        <Card>
          <CardHeader title="Issue Activity (Last 7 Days)" />
          <div className="p-4">
            <SimpleBarChart data={activityData} valueLabel="Books issued" />
          </div>
        </Card>
        <Card>
          <CardHeader title="Overdue Books" />
          <div className="p-4">
            {overdueByBook.length ? <SimpleBarChart data={overdueByBook} color="var(--color-danger)" valueLabel="Overdue count" /> : <EmptyState label="No overdue books. 🎉" />}
          </div>
        </Card>
        <Card>
          <CardHeader title="Popular Books" />
          <div className="p-4">
            {popularBooks.length ? <SimpleBarChart data={popularBooks} color="var(--color-accent)" valueLabel="Times issued" /> : <EmptyState label="No circulation history yet." />}
          </div>
        </Card>
      </div>
    </div>
  );
}
