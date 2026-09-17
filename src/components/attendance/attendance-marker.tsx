"use client";

import { useMemo, useState, useTransition } from "react";
import { Check } from "lucide-react";
import type { AttendanceRecord, AttendanceStatus, Section, SchoolClass, Student } from "@/types/database";
import { saveAttendanceAction } from "@/app/(app)/attendance/actions";

const STATUS_OPTIONS: { value: AttendanceStatus; label: string; classes: string }[] = [
  { value: "present", label: "Present", classes: "bg-success/10 text-success border-success/30" },
  { value: "absent", label: "Absent", classes: "bg-danger/10 text-danger border-danger/30" },
  { value: "late", label: "Late", classes: "bg-warning/10 text-warning border-warning/30" },
  { value: "leave", label: "Leave", classes: "bg-primary/10 text-primary border-primary/30" },
];

export function AttendanceMarker({
  students,
  classes,
  sections,
  existing,
  date,
}: {
  students: Student[];
  classes: SchoolClass[];
  sections: Section[];
  existing: AttendanceRecord[];
  date: string;
}) {
  const [classId, setClassId] = useState(classes[0]?.id ?? "");
  const classSections = sections.filter((s) => s.class_id === classId);
  const [sectionId, setSectionId] = useState(classSections[0]?.id ?? "");
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  const roster = useMemo(
    () => students.filter((s) => s.class_id === classId && (!sectionId || s.section_id === sectionId)),
    [students, classId, sectionId]
  );

  const initialStatus = useMemo(() => {
    const map: Record<string, AttendanceStatus> = {};
    for (const s of roster) {
      const rec = existing.find((a) => a.student_id === s.id && a.date === date);
      map[s.id] = rec?.status ?? "present";
    }
    return map;
  }, [roster, existing, date]);

  const [statusMap, setStatusMap] = useState<Record<string, AttendanceStatus>>(initialStatus);

  const setAll = (status: AttendanceStatus) => {
    const map: Record<string, AttendanceStatus> = {};
    for (const s of roster) map[s.id] = status;
    setStatusMap(map);
  };

  const save = () => {
    setSaved(false);
    startTransition(async () => {
      await saveAttendanceAction(
        date,
        roster.map((s) => ({
          studentId: s.id,
          classId,
          sectionId,
          status: statusMap[s.id] ?? "present",
        }))
      );
      setSaved(true);
    });
  };

  return (
    <div>
      <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={classId}
            onChange={(e) => {
              setClassId(e.target.value);
              const first = sections.find((s) => s.class_id === e.target.value);
              setSectionId(first?.id ?? "");
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
            onChange={(e) => setSectionId(e.target.value)}
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
          >
            {classSections.map((s) => (
              <option key={s.id} value={s.id}>
                Section {s.name}
              </option>
            ))}
          </select>
          <span className="text-xs text-muted">{new Date(date).toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" })}</span>
        </div>
        <button
          onClick={() => setAll("present")}
          className="inline-flex items-center gap-1.5 rounded-lg border border-success/30 bg-success/10 px-3 py-2 text-xs font-medium text-success"
        >
          <Check size={14} /> Mark All Present
        </button>
      </div>

      {roster.length === 0 ? (
        <p className="px-5 py-10 text-center text-sm text-muted">No students in this class/section.</p>
      ) : (
        <ul className="divide-y divide-border">
          {roster.map((s) => (
            <li key={s.id} className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium">{s.full_name}</p>
                <p className="text-xs text-muted">Roll #{s.roll_number ?? "—"}</p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {STATUS_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setStatusMap((m) => ({ ...m, [s.id]: opt.value }))}
                    className={`rounded-full border px-2.5 py-1 text-xs font-medium transition ${
                      statusMap[s.id] === opt.value ? opt.classes : "border-border text-muted"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="flex items-center justify-end gap-3 border-t border-border p-4">
        {saved && <span className="text-xs text-success">Saved ✓</span>}
        <button
          onClick={save}
          disabled={pending || roster.length === 0}
          className="rounded-lg bg-primary px-5 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60"
        >
          {pending ? "Saving…" : "Save Attendance"}
        </button>
      </div>
    </div>
  );
}
