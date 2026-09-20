import { PrintButton } from "./print-button";
import type { Period, SchoolClass, Section, School, Subject, TeacherDirectoryEntry, TimetableEntry } from "@/types/database";

const DAY_LABELS: Record<number, string> = { 0: "Sunday", 1: "Monday", 2: "Tuesday", 3: "Wednesday", 4: "Thursday", 5: "Friday", 6: "Saturday" };

export function PrintableTimetable({
  school,
  title,
  subtitle,
  workingDays,
  periods,
  entries,
  subjects,
  teachers,
  classes,
  sections,
  secondary,
}: {
  school: School;
  title: string;
  subtitle: string;
  workingDays: number[];
  periods: Period[];
  entries: TimetableEntry[];
  subjects: Subject[];
  teachers: TeacherDirectoryEntry[];
  classes: SchoolClass[];
  sections: Section[];
  secondary: "teacher" | "class";
}) {
  const getEntry = (day: number, periodId: string) => entries.find((e) => e.day_of_week === day && e.period_id === periodId);

  return (
    <div className="mx-auto max-w-4xl p-6 print:p-0">
      <div className="mb-4 flex items-center justify-between print:hidden">
        <p className="text-sm text-muted">Print preview</p>
        <PrintButton />
      </div>

      <header className="mb-6 border-b border-border pb-4 text-center">
        <h1 className="text-lg font-bold uppercase tracking-wide">{school.name}</h1>
        <p className="text-sm text-muted">{school.address}</p>
        <p className="mt-2 text-base font-semibold">{title}</p>
        <p className="text-sm text-muted">{subtitle}</p>
      </header>

      <table className="w-full border-collapse text-xs">
        <thead>
          <tr>
            <th className="border border-border px-2 py-2 text-left">Period</th>
            {workingDays.map((d) => (
              <th key={d} className="border border-border px-2 py-2 text-center">
                {DAY_LABELS[d]}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {periods.map((p) => (
            <tr key={p.id}>
              <td className="border border-border px-2 py-2 align-top">
                <p className="font-medium">{p.name}</p>
                <p className="text-muted">
                  {p.start_time.slice(0, 5)}–{p.end_time.slice(0, 5)}
                </p>
              </td>
              {p.is_break ? (
                <td colSpan={workingDays.length} className="border border-border px-2 py-2 text-center font-medium">
                  Break
                </td>
              ) : (
                workingDays.map((d) => {
                  const entry = getEntry(d, p.id);
                  const subject = entry ? subjects.find((s) => s.id === entry.subject_id)?.name : null;
                  const teacher = entry ? teachers.find((t) => t.id === entry.teacher_id)?.full_name : null;
                  const section = entry ? sections.find((s) => s.id === entry.section_id) : null;
                  const klass = entry ? classes.find((c) => c.id === (section?.class_id ?? entry.class_id))?.name : null;
                  return (
                    <td key={d} className="border border-border px-2 py-2 align-top">
                      {entry ? (
                        <>
                          <p className="font-medium">{subject}</p>
                          <p className="text-muted">{secondary === "teacher" ? teacher : `${klass} - ${section?.name}`}</p>
                          {entry.room && <p className="text-muted">{entry.room}</p>}
                        </>
                      ) : (
                        <span className="text-muted">—</span>
                      )}
                    </td>
                  );
                })
              )}
            </tr>
          ))}
        </tbody>
      </table>

      <footer className="mt-16 flex items-center justify-between text-sm">
        <div className="text-center">
          <p className="mb-8">&nbsp;</p>
          <p className="border-t border-foreground px-8 pt-1">Headteacher Signature</p>
        </div>
        <div className="text-center">
          <p className="mb-8">&nbsp;</p>
          <p className="border-t border-foreground px-8 pt-1">School Stamp</p>
        </div>
      </footer>
    </div>
  );
}
