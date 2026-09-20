"use client";

import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { SimpleReportView } from "@/components/reports/simple-report-view";
import {
  buildBooksInventoryReport,
  buildFineReport,
  buildIssuedBooksReport,
  buildMemberBorrowingReport,
  buildOverdueBooksReport,
  buildReturnedBooksReport,
  type LibraryDataset,
} from "@/lib/reports/library-reports";

const REPORTS = [
  { key: "inventory", label: "Books Inventory" },
  { key: "issued", label: "Issued Books" },
  { key: "returned", label: "Returned Books" },
  { key: "overdue", label: "Overdue Books" },
  { key: "fines", label: "Fine Report" },
  { key: "borrowing", label: "Member Borrowing" },
] as const;

const money = (n: unknown) => `PKR ${Number(n).toLocaleString()}`;

export function LibraryReportsCenter({ data }: { data: LibraryDataset }) {
  const [report, setReport] = useState<(typeof REPORTS)[number]["key"]>("inventory");

  const view = useMemo(() => {
    if (report === "inventory") {
      return { title: "Books Inventory Report", rows: buildBooksInventoryReport(data), columns: [
        { key: "title", label: "Title" }, { key: "accessionNumber", label: "Accession #" }, { key: "category", label: "Category" },
        { key: "totalCopies", label: "Total" }, { key: "availableCopies", label: "Available" }, { key: "issuedCopies", label: "Issued" }, { key: "status", label: "Status" },
      ] };
    }
    if (report === "issued") {
      return { title: "Issued Books Report", rows: buildIssuedBooksReport(data), columns: [
        { key: "book", label: "Book" }, { key: "borrower", label: "Borrower" }, { key: "issueDate", label: "Issue Date" }, { key: "dueDate", label: "Due Date" }, { key: "daysOverdue", label: "Days Overdue" },
      ] };
    }
    if (report === "returned") {
      return { title: "Returned Books Report", rows: buildReturnedBooksReport(data), columns: [
        { key: "book", label: "Book" }, { key: "borrower", label: "Borrower" }, { key: "issueDate", label: "Issue Date" }, { key: "returnDate", label: "Return Date" },
        { key: "fine", label: "Fine", format: money }, { key: "condition", label: "Condition" },
      ] };
    }
    if (report === "overdue") {
      return { title: "Overdue Books Report", rows: buildOverdueBooksReport(data), columns: [
        { key: "book", label: "Book" }, { key: "borrower", label: "Borrower" }, { key: "dueDate", label: "Due Date" }, { key: "daysOverdue", label: "Days Overdue" }, { key: "fine", label: "Fine", format: money },
      ] };
    }
    if (report === "fines") {
      return { title: "Fine Report", rows: buildFineReport(data), columns: [
        { key: "book", label: "Book" }, { key: "borrower", label: "Borrower" }, { key: "status", label: "Status" }, { key: "fine", label: "Fine", format: money },
      ] };
    }
    return { title: "Member Borrowing Report", rows: buildMemberBorrowingReport(data), columns: [
      { key: "name", label: "Member" }, { key: "totalIssued", label: "Total Issued" }, { key: "currentlyIssued", label: "Currently Issued" }, { key: "totalFines", label: "Total Fines", format: money },
    ] };
  }, [report, data]);

  return (
    <div className="space-y-4">
      <Card className="flex flex-wrap gap-2 p-3">
        {REPORTS.map((r) => (
          <button
            key={r.key}
            onClick={() => setReport(r.key)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium ${report === r.key ? "bg-primary text-primary-foreground" : "hover:bg-background"}`}
          >
            {r.label}
          </button>
        ))}
      </Card>
      <SimpleReportView
        title={view.title}
        columns={view.columns}
        rows={view.rows as unknown as Record<string, unknown>[]}
        filenameBase={`library-${report}`}
        printHref={`/print/library-report?key=${report}`}
      />
    </div>
  );
}
