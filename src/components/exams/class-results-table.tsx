"use client";

import Link from "next/link";
import { Download, Printer } from "lucide-react";
import { DataTable, type Column } from "@/components/data-table";
import { downloadCsv } from "@/lib/csv";
import type { Result, Student } from "@/types/database";

interface Row {
  result: Result;
  student: Student;
}

export function ClassResultsTable({ rows, examId, examName }: { rows: Row[]; examId: string; examName: string }) {
  const columns: Column<Row>[] = [
    { key: "roll", header: "Roll #", sortValue: (r) => r.student.roll_number ?? "", render: (r) => r.student.roll_number ?? "—" },
    {
      key: "name",
      header: "Student",
      sortValue: (r) => r.student.full_name,
      render: (r) => (
        <Link href={`/print/result-card/${examId}/${r.student.id}`} target="_blank" className="font-medium hover:text-primary">
          {r.student.full_name}
        </Link>
      ),
    },
    { key: "total", header: "Total", sortValue: (r) => r.result.total_marks, render: (r) => r.result.total_marks, hideOnMobile: true },
    { key: "obtained", header: "Obtained", sortValue: (r) => r.result.total_obtained, render: (r) => r.result.total_obtained },
    { key: "pct", header: "Percentage", sortValue: (r) => r.result.percentage, render: (r) => `${r.result.percentage}%` },
    { key: "grade", header: "Grade", sortValue: (r) => r.result.grade ?? "", render: (r) => r.result.grade ?? "—" },
    {
      key: "status",
      header: "Result",
      sortValue: (r) => (r.result.is_pass ? 1 : 0),
      render: (r) => (
        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${r.result.is_pass ? "bg-success/10 text-success" : "bg-danger/10 text-danger"}`}>
          {r.result.is_pass ? "Pass" : "Fail"}
        </span>
      ),
    },
    { key: "rank", header: "Rank", sortValue: (r) => r.result.class_rank ?? 999, render: (r) => r.result.class_rank ?? "—", hideOnMobile: true },
  ];

  const exportCsv = () => {
    downloadCsv(
      `${examName.replace(/\s+/g, "-")}-class-results.csv`,
      ["Roll #", "Student", "Total Marks", "Obtained Marks", "Percentage", "Grade", "Result", "Class Rank"],
      rows.map((r) => [
        r.student.roll_number ?? "",
        r.student.full_name,
        r.result.total_marks,
        r.result.total_obtained,
        r.result.percentage,
        r.result.grade ?? "",
        r.result.is_pass ? "Pass" : "Fail",
        r.result.class_rank ?? "",
      ])
    );
  };

  return (
    <DataTable
      columns={columns}
      rows={rows}
      rowKey={(r) => r.result.id}
      searchKeys={(r) => `${r.student.full_name} ${r.student.roll_number ?? ""}`}
      emptyLabel="No results have been calculated for this exam yet."
      filters={
        <div className="flex gap-2">
          <button onClick={exportCsv} className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm font-medium hover:bg-background">
            <Download size={15} /> Export CSV
          </button>
          <Link
            href={`/print/class-results/${examId}`}
            target="_blank"
            className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm font-medium hover:bg-background"
          >
            <Printer size={15} /> Print / PDF
          </Link>
        </div>
      }
    />
  );
}
