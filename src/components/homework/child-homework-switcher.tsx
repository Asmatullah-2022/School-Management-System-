"use client";

import { useState } from "react";
import { StudentHomeworkList } from "./student-homework-list";
import type { HomeworkAssignment, HomeworkRecord, SchoolClass, Section, Student } from "@/types/database";

export interface ChildHomeworkEntry {
  student: Student;
  items: { homework: HomeworkRecord; submission: HomeworkAssignment | undefined; subjectName: string; teacherName: string }[];
}

export function ChildHomeworkSwitcher({
  childEntries,
  classes,
  sections,
  action,
  readOnly,
}: {
  childEntries: ChildHomeworkEntry[];
  classes: SchoolClass[];
  sections: Section[];
  action?: (id: string, formData: FormData) => Promise<{ error?: string } | void>;
  readOnly?: boolean;
}) {
  const children = childEntries.map((c) => c.student);
  const [selectedId, setSelectedId] = useState(children[0]?.id);
  const child = children.find((c) => c.id === selectedId) ?? children[0];
  const items = childEntries.find((c) => c.student.id === child.id)?.items ?? [];

  return (
    <div className="space-y-4">
      {children.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {children.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedId(c.id)}
              className={`rounded-full px-3.5 py-2 text-sm font-medium transition ${child.id === c.id ? "bg-primary text-primary-foreground" : "border border-border text-muted hover:bg-background"}`}
            >
              {c.full_name} — {classes.find((cl) => cl.id === c.class_id)?.name}
            </button>
          ))}
        </div>
      )}
      <p className="text-sm text-muted">
        {classes.find((c) => c.id === child.class_id)?.name} - Section {sections.find((s) => s.id === child.section_id)?.name}
      </p>
      <StudentHomeworkList items={items} action={action} readOnly={readOnly} />
    </div>
  );
}
