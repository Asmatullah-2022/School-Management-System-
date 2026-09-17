"use client";

import { useRouter, useSearchParams } from "next/navigation";
import type { SchoolClass, Section, Teacher } from "@/types/database";

export function TimetableFilters({
  classes,
  sections,
  teachers,
  view,
  classId,
  sectionId,
  teacherId,
}: {
  classes: SchoolClass[];
  sections: Section[];
  teachers: Teacher[];
  view: "class" | "teacher";
  classId: string;
  sectionId: string;
  teacherId: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const navigate = (updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([k, v]) => params.set(k, v));
    router.push(`/timetable?${params.toString()}`);
  };

  const filteredSections = sections.filter((s) => s.class_id === classId);

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex rounded-lg border border-border bg-background p-1 text-sm">
        <button
          onClick={() => navigate({ view: "class" })}
          className={`rounded-md px-3 py-1.5 font-medium transition ${
            view === "class" ? "bg-primary text-primary-foreground" : "text-muted"
          }`}
        >
          By Class
        </button>
        <button
          onClick={() => navigate({ view: "teacher" })}
          className={`rounded-md px-3 py-1.5 font-medium transition ${
            view === "teacher" ? "bg-primary text-primary-foreground" : "text-muted"
          }`}
        >
          By Teacher
        </button>
      </div>

      {view === "class" ? (
        <div className="flex flex-wrap gap-2">
          <select
            value={classId}
            onChange={(e) => {
              const firstSection = sections.find((s) => s.class_id === e.target.value);
              navigate({ classId: e.target.value, sectionId: firstSection?.id ?? "" });
            }}
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
          >
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <select
            value={sectionId}
            onChange={(e) => navigate({ sectionId: e.target.value })}
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
          >
            {filteredSections.map((s) => (
              <option key={s.id} value={s.id}>
                Section {s.name}
              </option>
            ))}
          </select>
        </div>
      ) : (
        <select
          value={teacherId}
          onChange={(e) => navigate({ teacherId: e.target.value })}
          className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
        >
          {teachers.map((t) => (
            <option key={t.id} value={t.id}>
              {t.full_name}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}
