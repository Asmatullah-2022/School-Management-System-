"use client";

import { WeeklyGrid } from "./weekly-grid";
import { EntryCell } from "./entry-cell";
import type { Period, SchoolClass, Section, Subject, TeacherDirectoryEntry, TimetableEntry } from "@/types/database";

/**
 * A read-only WeeklyGrid that builds its own `renderCell` closure internally.
 * Exists because Server Components can't pass function props (like
 * `renderCell`) to a Client Component — this wrapper keeps the closure
 * entirely on the client side while still taking plain, serializable data
 * props from whichever server component renders it.
 */
export function ReadonlyWeeklyGrid({
  days,
  periods,
  entries,
  subjects,
  teachers,
  classes,
  sections,
  secondary,
  todayColumn,
}: {
  days: number[];
  periods: Period[];
  entries: TimetableEntry[];
  subjects: Subject[];
  teachers: TeacherDirectoryEntry[];
  classes: SchoolClass[];
  sections: Section[];
  secondary: "teacher" | "class";
  todayColumn?: number;
}) {
  return (
    <WeeklyGrid
      days={days}
      periods={periods}
      entries={entries}
      todayColumn={todayColumn}
      renderCell={(entry) => (
        <EntryCell entry={entry} subjects={subjects} teachers={teachers} classes={classes} sections={sections} secondary={secondary} />
      )}
    />
  );
}
