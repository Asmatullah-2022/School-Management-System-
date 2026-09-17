"use client";

import { DataTable, type Column } from "@/components/data-table";
import type { FeeRecord, Student } from "@/types/database";

const statusStyles: Record<string, string> = {
  paid: "bg-success/10 text-success",
  partial: "bg-warning/10 text-warning",
  unpaid: "bg-muted/10 text-muted",
  overdue: "bg-danger/10 text-danger",
};

export function FeesTable({ fees, students }: { fees: FeeRecord[]; students: Student[] }) {
  const columns: Column<FeeRecord>[] = [
    {
      key: "student",
      header: "Student",
      render: (f) => students.find((s) => s.id === f.student_id)?.full_name ?? "—",
    },
    { key: "title", header: "Fee", render: (f) => f.title },
    { key: "amount", header: "Amount", render: (f) => `PKR ${(f.amount - f.discount).toLocaleString()}` },
    { key: "due", header: "Due Date", render: (f) => new Date(f.due_date).toLocaleDateString(), hideOnMobile: true },
    {
      key: "status",
      header: "Status",
      render: (f) => (
        <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${statusStyles[f.status]}`}>{f.status}</span>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      rows={fees}
      rowKey={(f) => f.id}
      searchKeys={(f) => `${students.find((s) => s.id === f.student_id)?.full_name ?? ""} ${f.title}`}
      emptyLabel="No fee records yet."
    />
  );
}
