import type { SchoolClass, Section, Subject, TeacherDirectoryEntry, TimetableEntry } from "@/types/database";

/** Read-only cell content: subject + secondary line (teacher, or class/section) + room. */
export function EntryCell({
  entry,
  subjects,
  teachers,
  classes,
  sections,
  secondary = "teacher",
}: {
  entry: TimetableEntry | undefined;
  subjects: Subject[];
  teachers: TeacherDirectoryEntry[];
  classes: SchoolClass[];
  sections: Section[];
  /** What to show on the second line: the teacher's name, or the class/section (for a teacher's own timetable). */
  secondary?: "teacher" | "class";
}) {
  if (!entry) return <span className="text-xs text-muted">—</span>;

  const subject = subjects.find((s) => s.id === entry.subject_id)?.name ?? "—";
  const teacher = teachers.find((t) => t.id === entry.teacher_id)?.full_name;
  const section = sections.find((s) => s.id === entry.section_id);
  const klass = classes.find((c) => c.id === (section?.class_id ?? entry.class_id))?.name;

  return (
    <div>
      <p className="text-xs font-semibold">{subject}</p>
      <p className="text-[11px] text-muted">
        {secondary === "teacher" ? teacher ?? "—" : `${klass ?? "—"} - ${section?.name ?? "—"}`}
      </p>
      {entry.room && <p className="text-[11px] text-muted">{entry.room}</p>}
    </div>
  );
}
