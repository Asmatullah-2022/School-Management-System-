"use client";

import { useState } from "react";
import Link from "next/link";
import { Pencil, Archive } from "lucide-react";
import { DataTable, type Column } from "@/components/data-table";
import type { Subject } from "@/types/database";
import { archiveSubjectAction } from "@/app/(app)/academics/subjects/actions";

const typeStyles: Record<string, string> = {
  core: "bg-primary/10 text-primary",
  elective: "bg-accent/10 text-accent",
  optional: "bg-warning/10 text-warning",
};

export function SubjectsTable({ subjects, canManage }: { subjects: Subject[]; canManage: boolean }) {
  const [typeFilter, setTypeFilter] = useState<string>("all");

  const filtered = typeFilter === "all" ? subjects : subjects.filter((s) => s.subject_type === typeFilter);

  const columns: Column<Subject>[] = [
    {
      key: "name",
      header: "Subject",
      sortValue: (s) => s.name,
      render: (s) => (
        <div>
          <p className="font-medium">{s.name}</p>
          {s.name_urdu && (
            <p dir="rtl" className="text-xs text-muted">
              {s.name_urdu}
            </p>
          )}
        </div>
      ),
    },
    { key: "code", header: "Code", sortValue: (s) => s.code ?? "", render: (s) => s.code ?? "—", hideOnMobile: true },
    {
      key: "type",
      header: "Type",
      sortValue: (s) => s.subject_type,
      render: (s) => (
        <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${typeStyles[s.subject_type]}`}>
          {s.subject_type}
        </span>
      ),
    },
    {
      key: "marks",
      header: "Marks",
      sortValue: (s) => s.total_marks,
      render: (s) => `${s.passing_marks} / ${s.total_marks}`,
      hideOnMobile: true,
    },
    {
      key: "status",
      header: "Status",
      sortValue: (s) => s.status,
      render: (s) => (
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${
            s.status === "active" ? "bg-success/10 text-success" : "bg-muted/10 text-muted"
          }`}
        >
          {s.status}
        </span>
      ),
    },
    ...(canManage
      ? [
          {
            key: "actions",
            header: "",
            render: (s: Subject) => (
              <div className="flex items-center justify-end gap-1">
                <Link
                  href={`/academics/subjects/${s.id}/edit`}
                  className="rounded-md p-1.5 text-muted hover:bg-background hover:text-primary"
                  aria-label={`Edit ${s.name}`}
                >
                  <Pencil size={15} />
                </Link>
                <form action={archiveSubjectAction.bind(null, s.id)}>
                  <button
                    type="submit"
                    className="rounded-md p-1.5 text-muted hover:bg-background hover:text-danger"
                    aria-label={`Archive ${s.name}`}
                  >
                    <Archive size={15} />
                  </button>
                </form>
              </div>
            ),
          } satisfies Column<Subject>,
        ]
      : []),
  ];

  return (
    <DataTable
      columns={columns}
      rows={filtered}
      rowKey={(s) => s.id}
      searchKeys={(s) => `${s.name} ${s.name_urdu ?? ""} ${s.code ?? ""}`}
      emptyLabel="No subjects have been added yet."
      filters={
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
        >
          <option value="all">All types</option>
          <option value="core">Core</option>
          <option value="elective">Elective</option>
          <option value="optional">Optional</option>
        </select>
      }
    />
  );
}
