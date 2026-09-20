"use client";

import { useState } from "react";
import { Card, CardHeader, EmptyState } from "@/components/ui/card";
import { WeeklyGrid } from "./weekly-grid";
import { EntryCell } from "./entry-cell";
import { TodaySchedule } from "./today-schedule";
import type { Period, SchoolClass, Section, Student, Subject, TeacherDirectoryEntry, TimetableEntry } from "@/types/database";

export function ChildTimetableSwitcher({
  childStudents,
  classes,
  sections,
  subjects,
  teachers,
  periods,
  entries,
  workingDays,
  today,
}: {
  childStudents: Student[];
  classes: SchoolClass[];
  sections: Section[];
  subjects: Subject[];
  teachers: TeacherDirectoryEntry[];
  periods: Period[];
  entries: TimetableEntry[];
  workingDays: number[];
  today: number;
}) {
  const [selectedId, setSelectedId] = useState(childStudents[0]?.id);
  const child = childStudents.find((c) => c.id === selectedId) ?? childStudents[0];
  const childEntries = child?.section_id ? entries.filter((e) => e.section_id === child.section_id) : [];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold">Timetable</h1>
        <p className="text-sm text-muted">View your child&apos;s weekly class timetable.</p>
      </div>

      {childStudents.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {childStudents.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedId(c.id)}
              className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
                child?.id === c.id ? "bg-primary text-primary-foreground" : "border border-border text-muted"
              }`}
            >
              {c.full_name}
            </button>
          ))}
        </div>
      )}

      {child && (
        <>
          <p className="text-sm text-muted">
            {classes.find((cl) => cl.id === child.class_id)?.name} - Section {sections.find((s) => s.id === child.section_id)?.name}
          </p>
          <TodaySchedule
            entries={childEntries}
            periods={periods}
            today={today}
            subjects={subjects}
            teachers={teachers}
            classes={classes}
            sections={sections}
            secondary="teacher"
          />
          <Card>
            <CardHeader title="Weekly Timetable" />
            <div className="p-4">
              {childEntries.length === 0 ? (
                <EmptyState label="No timetable has been published for this class yet." />
              ) : (
                <WeeklyGrid
                  days={workingDays}
                  periods={periods}
                  entries={childEntries}
                  todayColumn={today}
                  renderCell={(entry) => (
                    <EntryCell entry={entry} subjects={subjects} teachers={teachers} classes={classes} sections={sections} secondary="teacher" />
                  )}
                />
              )}
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
