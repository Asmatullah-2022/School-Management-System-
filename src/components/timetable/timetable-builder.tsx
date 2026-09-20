"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { WeeklyGrid } from "./weekly-grid";
import type { Period, Section, Subject, SubjectAssignment, TeacherDirectoryEntry, TimetableEntry } from "@/types/database";
import { saveTimetableEntryAction, deleteTimetableEntryAction } from "@/app/(app)/timetable/actions";

const DAY_NAMES: Record<number, string> = {
  0: "Sunday", 1: "Monday", 2: "Tuesday", 3: "Wednesday", 4: "Thursday", 5: "Friday", 6: "Saturday",
};

export function TimetableBuilder({
  classId,
  sectionId,
  workingDays,
  periods,
  entries,
  assignments,
  subjects,
  teachers,
  sections,
}: {
  classId: string;
  sectionId: string;
  workingDays: number[];
  periods: Period[];
  entries: TimetableEntry[];
  assignments: SubjectAssignment[];
  subjects: Subject[];
  teachers: TeacherDirectoryEntry[];
  sections: Section[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<{ day: number; periodId: string; entry?: TimetableEntry } | null>(null);
  const [subjectId, setSubjectId] = useState("");
  const [room, setRoom] = useState("");

  const sectionAssignments = useMemo(
    () => assignments.filter((a) => a.class_id === classId && a.section_id === sectionId && a.status === "active"),
    [assignments, classId, sectionId]
  );

  const openCell = (day: number, periodId: string, entry: TimetableEntry | undefined) => {
    setSelected({ day, periodId, entry });
    setSubjectId(entry?.subject_id ?? "");
    setRoom(entry?.room ?? sections.find((s) => s.id === sectionId)?.room ?? "");
    setError(null);
  };

  const close = () => {
    setSelected(null);
    setError(null);
  };

  const save = () => {
    if (!selected) return;
    const assignment = sectionAssignments.find((a) => a.subject_id === subjectId);
    if (!assignment) {
      setError("Select a subject that is assigned to this class/section.");
      return;
    }
    setError(null);
    startTransition(async () => {
      const res = await saveTimetableEntryAction({
        id: selected.entry?.id,
        class_id: classId,
        section_id: sectionId,
        subject_id: subjectId,
        teacher_id: assignment.teacher_id,
        period_id: selected.periodId,
        day_of_week: selected.day,
        room: room || null,
      });
      if (res?.error) {
        setError(res.error);
        return;
      }
      close();
      router.refresh();
    });
  };

  const remove = () => {
    if (!selected?.entry) return;
    startTransition(async () => {
      const res = await deleteTimetableEntryAction(selected.entry!.id);
      if (res?.error) {
        setError(res.error);
        return;
      }
      close();
      router.refresh();
    });
  };

  return (
    <div className="space-y-4">
      {sectionAssignments.length === 0 && (
        <p className="rounded-lg border border-warning/30 bg-warning/10 px-4 py-2 text-sm text-warning">
          No subjects are assigned to this class/section yet. Add one under Academics → Subject Assignments before
          building the timetable.
        </p>
      )}

      <WeeklyGrid
        days={workingDays}
        periods={periods}
        entries={entries}
        onCellClick={openCell}
        renderCell={(entry, day, periodId) => {
          const isSelected = selected?.day === day && selected.periodId === periodId;
          const subject = entry ? subjects.find((s) => s.id === entry.subject_id)?.name : null;
          const teacher = entry ? teachers.find((t) => t.id === entry.teacher_id)?.full_name : null;
          return (
            <div className={isSelected ? "rounded ring-2 ring-primary" : ""}>
              {entry ? (
                <div>
                  <p className="text-xs font-semibold">{subject}</p>
                  <p className="text-[11px] text-muted">{teacher}</p>
                  {entry.room && <p className="text-[11px] text-muted">{entry.room}</p>}
                </div>
              ) : (
                <p className="text-xs text-muted">+ Add</p>
              )}
            </div>
          );
        }}
      />

      {selected && (
        <div className="rounded-xl border border-primary/30 bg-primary/5 p-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-semibold">
              {DAY_NAMES[selected.day]} · {periods.find((p) => p.id === selected.periodId)?.name}
            </p>
            <button onClick={close} className="rounded-md p-1 text-muted hover:bg-background" aria-label="Close">
              <X size={16} />
            </button>
          </div>

          {error && (
            <p className="mb-3 rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>
          )}

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-sm font-medium">Subject</span>
              <select
                value={subjectId}
                onChange={(e) => setSubjectId(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
              >
                <option value="">Select subject</option>
                {sectionAssignments.map((a) => (
                  <option key={a.id} value={a.subject_id}>
                    {subjects.find((s) => s.id === a.subject_id)?.name} — {teachers.find((t) => t.id === a.teacher_id)?.full_name}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-medium">Room (optional)</span>
              <input
                value={room}
                onChange={(e) => setRoom(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
              />
            </label>
          </div>

          <div className="mt-4 flex items-center justify-end gap-2">
            {selected.entry && (
              <button
                onClick={remove}
                disabled={pending}
                className="rounded-lg border border-danger/30 px-4 py-2 text-sm font-medium text-danger disabled:opacity-60"
              >
                Remove
              </button>
            )}
            <button
              onClick={save}
              disabled={pending || !subjectId}
              className="rounded-lg bg-primary px-5 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60"
            >
              {pending ? "Saving…" : "Save"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
