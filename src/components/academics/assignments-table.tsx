"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Pencil, Trash2 } from "lucide-react";
import { DataTable, type Column } from "@/components/data-table";
import type { SchoolClass, Section, Subject, SubjectAssignment, Teacher } from "@/types/database";
import { deleteAssignmentAction } from "@/app/(app)/academics/assignments/actions";

export function AssignmentsTable({
  assignments,
  classes,
  sections,
  subjects,
  teachers,
}: {
  assignments: SubjectAssignment[];
  classes: SchoolClass[];
  sections: Section[];
  subjects: Subject[];
  teachers: Teacher[];
}) {
  const [classFilter, setClassFilter] = useState("all");
  const [teacherFilter, setTeacherFilter] = useState("all");
  const [subjectFilter, setSubjectFilter] = useState("all");

  const className = (id: string) => classes.find((c) => c.id === id)?.name ?? "—";
  const sectionName = (id: string | null) => sections.find((s) => s.id === id)?.name ?? "—";
  const subjectName = (id: string) => subjects.find((s) => s.id === id)?.name ?? "—";
  const teacherName = (id: string) => teachers.find((t) => t.id === id)?.full_name ?? "—";

  const filtered = useMemo(
    () =>
      assignments.filter(
        (a) =>
          (classFilter === "all" || a.class_id === classFilter) &&
          (teacherFilter === "all" || a.teacher_id === teacherFilter) &&
          (subjectFilter === "all" || a.subject_id === subjectFilter)
      ),
    [assignments, classFilter, teacherFilter, subjectFilter]
  );

  const columns: Column<SubjectAssignment>[] = [
    {
      key: "class",
      header: "Class / Section",
      sortValue: (a) => className(a.class_id),
      render: (a) => `${className(a.class_id)} - Section ${sectionName(a.section_id)}`,
    },
    { key: "subject", header: "Subject", sortValue: (a) => subjectName(a.subject_id), render: (a) => subjectName(a.subject_id) },
    { key: "teacher", header: "Teacher", sortValue: (a) => teacherName(a.teacher_id), render: (a) => teacherName(a.teacher_id) },
    { key: "weekly", header: "Weekly Periods", sortValue: (a) => a.weekly_periods, render: (a) => a.weekly_periods, hideOnMobile: true },
    {
      key: "status",
      header: "Status",
      render: (a) => (
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${
            a.status === "active" ? "bg-success/10 text-success" : "bg-muted/10 text-muted"
          }`}
        >
          {a.status}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      render: (a) => (
        <div className="flex items-center justify-end gap-1">
          <Link
            href={`/academics/assignments/${a.id}/edit`}
            className="rounded-md p-1.5 text-muted hover:bg-background hover:text-primary"
            aria-label="Edit assignment"
          >
            <Pencil size={15} />
          </Link>
          <form action={deleteAssignmentAction.bind(null, a.id)}>
            <button
              type="submit"
              className="rounded-md p-1.5 text-muted hover:bg-background hover:text-danger"
              aria-label="Remove assignment"
            >
              <Trash2 size={15} />
            </button>
          </form>
        </div>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      rows={filtered}
      rowKey={(a) => a.id}
      searchKeys={(a) => `${className(a.class_id)} ${sectionName(a.section_id)} ${subjectName(a.subject_id)} ${teacherName(a.teacher_id)}`}
      emptyLabel="No subject assignments have been created yet."
      filters={
        <div className="flex flex-wrap gap-2">
          <select
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
          >
            <option value="all">All classes</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <select
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
          >
            <option value="all">All subjects</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
          <select
            value={teacherFilter}
            onChange={(e) => setTeacherFilter(e.target.value)}
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
          >
            <option value="all">All teachers</option>
            {teachers.map((t) => (
              <option key={t.id} value={t.id}>
                {t.full_name}
              </option>
            ))}
          </select>
        </div>
      }
    />
  );
}
