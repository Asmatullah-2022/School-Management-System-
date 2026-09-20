"use client";

import Link from "next/link";
import { DataTable, type Column } from "@/components/data-table";
import type { Book } from "@/types/database";

const conditionStyles: Record<string, string> = {
  new: "bg-success/10 text-success",
  good: "bg-primary/10 text-primary",
  fair: "bg-warning/10 text-warning",
  damaged: "bg-danger/10 text-danger",
};

export function BooksTable({ books, canManage }: { books: Book[]; canManage: boolean }) {
  const columns: Column<Book>[] = [
    {
      key: "title",
      header: "Title",
      render: (b) => (
        <div>
          {canManage ? (
            <Link href={`/library/books/${b.id}/edit`} className="font-medium text-foreground hover:text-primary">{b.title}</Link>
          ) : (
            <span className="font-medium">{b.title}</span>
          )}
          <p className="text-xs text-muted">{b.accession_number ?? "—"} · {b.author ?? "Unknown author"}</p>
        </div>
      ),
      sortValue: (b) => b.title,
    },
    { key: "category", header: "Category", render: (b) => b.category ?? "—", hideOnMobile: true },
    { key: "shelf", header: "Shelf", render: (b) => b.shelf_location ?? "—", hideOnMobile: true },
    {
      key: "availability",
      header: "Availability",
      render: (b) => (
        <span className={b.available_copies > 0 ? "text-success" : "text-danger"}>
          {b.available_copies} / {b.total_copies}
        </span>
      ),
      sortValue: (b) => b.available_copies,
    },
    {
      key: "condition",
      header: "Condition",
      render: (b) => <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${conditionStyles[b.condition]}`}>{b.condition}</span>,
      hideOnMobile: true,
    },
    {
      key: "status",
      header: "Status",
      render: (b) => (
        <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${b.status === "active" ? "bg-success/10 text-success" : "bg-muted/10 text-muted"}`}>
          {b.status}
        </span>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      rows={books}
      rowKey={(b) => b.id}
      searchKeys={(b) => `${b.title} ${b.title_urdu ?? ""} ${b.author ?? ""} ${b.isbn ?? ""} ${b.accession_number ?? ""} ${b.category ?? ""} ${b.shelf_location ?? ""}`}
      emptyLabel="No books found. Try adjusting your search or add a new book."
    />
  );
}
