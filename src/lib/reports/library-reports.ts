import type { Book, BookIssue, LibrarySettings, Student, Teacher } from "@/types/database";
import { computeFine, daysOverdue } from "@/lib/library/fines";

export interface LibraryDataset {
  books: Book[];
  issues: BookIssue[];
  students: Student[];
  teachers: Teacher[];
  settings: LibrarySettings;
}

function borrowerName(issue: BookIssue, data: LibraryDataset): string {
  if (issue.student_id) return data.students.find((s) => s.id === issue.student_id)?.full_name ?? "Unknown student";
  if (issue.teacher_id) return data.teachers.find((t) => t.id === issue.teacher_id)?.full_name ?? "Unknown teacher";
  return "—";
}

export function buildBooksInventoryReport(data: LibraryDataset) {
  return data.books.map((b) => ({
    title: b.title,
    accessionNumber: b.accession_number ?? "—",
    category: b.category ?? "—",
    totalCopies: b.total_copies,
    availableCopies: b.available_copies,
    issuedCopies: b.total_copies - b.available_copies,
    status: b.status,
  }));
}

export function buildIssuedBooksReport(data: LibraryDataset) {
  return data.issues
    .filter((i) => i.status === "issued")
    .map((i) => ({
      book: data.books.find((b) => b.id === i.book_id)?.title ?? "Unknown book",
      borrower: borrowerName(i, data),
      issueDate: i.issue_date,
      dueDate: i.due_date,
      daysOverdue: daysOverdue(i),
    }));
}

export function buildReturnedBooksReport(data: LibraryDataset) {
  return data.issues
    .filter((i) => i.status === "returned")
    .map((i) => ({
      book: data.books.find((b) => b.id === i.book_id)?.title ?? "Unknown book",
      borrower: borrowerName(i, data),
      issueDate: i.issue_date,
      returnDate: i.return_date ?? "",
      fine: i.fine_amount,
      condition: i.condition_at_return ?? "—",
    }));
}

export function buildOverdueBooksReport(data: LibraryDataset) {
  return data.issues
    .filter((i) => i.status === "issued" && daysOverdue(i) > 0)
    .map((i) => ({
      book: data.books.find((b) => b.id === i.book_id)?.title ?? "Unknown book",
      borrower: borrowerName(i, data),
      issueDate: i.issue_date,
      dueDate: i.due_date,
      daysOverdue: daysOverdue(i),
      fine: computeFine(i, data.settings),
    }));
}

export function buildFineReport(data: LibraryDataset) {
  return data.issues
    .filter((i) => i.fine_amount > 0 || (i.status === "issued" && computeFine(i, data.settings) > 0))
    .map((i) => ({
      book: data.books.find((b) => b.id === i.book_id)?.title ?? "Unknown book",
      borrower: borrowerName(i, data),
      status: i.status,
      fine: i.status === "returned" ? i.fine_amount : computeFine(i, data.settings),
    }));
}

export function buildMemberBorrowingReport(data: LibraryDataset) {
  const counts = new Map<string, { name: string; totalIssued: number; currentlyIssued: number; totalFines: number }>();
  for (const issue of data.issues) {
    const key = issue.student_id ? `s:${issue.student_id}` : issue.teacher_id ? `t:${issue.teacher_id}` : "unknown";
    const existing = counts.get(key) ?? { name: borrowerName(issue, data), totalIssued: 0, currentlyIssued: 0, totalFines: 0 };
    existing.totalIssued += 1;
    if (issue.status === "issued") existing.currentlyIssued += 1;
    existing.totalFines += issue.fine_amount;
    counts.set(key, existing);
  }
  return Array.from(counts.values()).sort((a, b) => b.totalIssued - a.totalIssued);
}
