"use client";

import { useState } from "react";
import Link from "next/link";
import { DataTable, type Column } from "@/components/data-table";
import type { Exam } from "@/types/database";

const statusStyles: Record<Exam["status"], string> = {
  draft: "bg-muted/10 text-muted",
  scheduled: "bg-primary/10 text-primary",
  ongoing: "bg-warning/10 text-warning",
  completed: "bg-accent/10 text-accent",
  published: "bg-success/10 text-success",
  archived: "bg-muted/10 text-muted",
};

const typeLabels: Record<Exam["exam_type"], string> = {
  monthly_test: "Monthly Test",
  unit_test: "Unit Test",
  mid_term: "Mid-Term",
  first_semester: "First Semester",
  second_semester: "Second Semester",
  annual: "Annual",
  custom: "Custom",
};

export function ExamsTable({ exams }: { exams: Exam[] }) {
  const [statusFilter, setStatusFilter] = useState("all");
  const filtered = statusFilter === "all" ? exams : exams.filter((e) => e.status === statusFilter);

  const columns: Column<Exam>[] = [
    {
      key: "name",
      header: "Exam",
      sortValue: (e) => e.name,
      render: (e) => (
        <Link href={`/exams/${e.id}`} className="font-medium text-foreground hover:text-primary">
          {e.name}
        </Link>
      ),
    },
    { key: "type", header: "Type", sortValue: (e) => e.exam_type, render: (e) => typeLabels[e.exam_type] },
    {
      key: "dates",
      header: "Dates",
      sortValue: (e) => e.start_date,
      render: (e) => `${new Date(e.start_date).toLocaleDateString()} – ${new Date(e.end_date).toLocaleDateString()}`,
      hideOnMobile: true,
    },
    {
      key: "status",
      header: "Status",
      sortValue: (e) => e.status,
      render: (e) => (
        <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${statusStyles[e.status]}`}>{e.status}</span>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      rows={filtered}
      rowKey={(e) => e.id}
      searchKeys={(e) => `${e.name} ${e.exam_type}`}
      emptyLabel="No examinations have been created yet."
      filters={
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
        >
          <option value="all">All statuses</option>
          <option value="draft">Draft</option>
          <option value="scheduled">Scheduled</option>
          <option value="ongoing">Ongoing</option>
          <option value="completed">Completed</option>
          <option value="published">Published</option>
        </select>
      }
    />
  );
}
