"use client";

import Link from "next/link";
import { DataTable, type Column } from "@/components/data-table";
import type { Section, SchoolClass, Student } from "@/types/database";

const statusStyles: Record<string, string> = {
  active: "bg-success/10 text-success",
  inactive: "bg-warning/10 text-warning",
  archived: "bg-muted/10 text-muted",
};

export function StudentsTable({
  students,
  classes,
  sections,
}: {
  students: Student[];
  classes: SchoolClass[];
  sections: Section[];
}) {
  const classNameOf = (id?: string | null) => classes.find((c) => c.id === id)?.name ?? "—";
  const sectionNameOf = (id?: string | null) => sections.find((s) => s.id === id)?.name ?? "—";

  const columns: Column<Student>[] = [
    {
      key: "name",
      header: "Student",
      render: (s) => (
        <Link href={`/students/${s.id}`} className="font-medium text-foreground hover:text-primary">
          {s.full_name}
          <p className="text-xs font-normal text-muted">{s.admission_number}</p>
        </Link>
      ),
    },
    { key: "father", header: "Father's Name", render: (s) => s.father_name ?? "—", hideOnMobile: true },
    {
      key: "class",
      header: "Class / Section",
      render: (s) => `${classNameOf(s.class_id)}${s.section_id ? " - " + sectionNameOf(s.section_id) : ""}`,
    },
    { key: "roll", header: "Roll #", render: (s) => s.roll_number ?? "—", hideOnMobile: true },
    { key: "contact", header: "Contact", render: (s) => s.contact_number ?? "—", hideOnMobile: true },
    {
      key: "status",
      header: "Status",
      render: (s) => (
        <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${statusStyles[s.status]}`}>
          {s.status}
        </span>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      rows={students}
      rowKey={(s) => s.id}
      searchKeys={(s) => `${s.full_name} ${s.admission_number} ${s.father_name ?? ""} ${s.roll_number ?? ""}`}
      emptyLabel="No students found. Try adjusting your search or add a new student."
    />
  );
}
