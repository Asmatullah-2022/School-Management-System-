"use client";

import { DataTable, type Column } from "@/components/data-table";
import type { Teacher } from "@/types/database";

const statusStyles: Record<string, string> = {
  active: "bg-success/10 text-success",
  inactive: "bg-warning/10 text-warning",
  archived: "bg-muted/10 text-muted",
};

export function TeachersTable({ teachers }: { teachers: Teacher[] }) {
  const columns: Column<Teacher>[] = [
    {
      key: "name",
      header: "Teacher",
      render: (t) => (
        <div>
          <p className="font-medium">{t.full_name}</p>
          <p className="text-xs text-muted">{t.employee_id}</p>
        </div>
      ),
    },
    { key: "designation", header: "Designation", render: (t) => t.designation ?? "—" },
    { key: "qualification", header: "Qualification", render: (t) => t.qualification ?? "—", hideOnMobile: true },
    { key: "mobile", header: "Mobile", render: (t) => t.mobile ?? "—", hideOnMobile: true },
    { key: "joining", header: "Joined", render: (t) => (t.joining_date ? new Date(t.joining_date).toLocaleDateString() : "—"), hideOnMobile: true },
    {
      key: "status",
      header: "Status",
      render: (t) => (
        <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${statusStyles[t.status]}`}>
          {t.status}
        </span>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      rows={teachers}
      rowKey={(t) => t.id}
      searchKeys={(t) => `${t.full_name} ${t.employee_id} ${t.designation ?? ""}`}
      emptyLabel="No teachers found."
    />
  );
}
