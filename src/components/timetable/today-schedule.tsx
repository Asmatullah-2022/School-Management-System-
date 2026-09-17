import { Card, CardHeader, EmptyState } from "@/components/ui/card";
import type { Period, SchoolClass, Section, Subject, Teacher, TimetableEntry } from "@/types/database";

function minutesSinceMidnight(time: string) {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

export function TodaySchedule({
  entries,
  periods,
  today,
  subjects,
  teachers,
  classes,
  sections,
  secondary,
}: {
  entries: TimetableEntry[];
  periods: Period[];
  today: number;
  subjects: Subject[];
  teachers: Teacher[];
  classes: SchoolClass[];
  sections: Section[];
  secondary: "teacher" | "class";
}) {
  const todaysEntries = entries
    .filter((e) => e.day_of_week === today)
    .map((e) => ({ entry: e, period: periods.find((p) => p.id === e.period_id) }))
    .filter((row) => row.period)
    .sort((a, b) => a.period!.sort_order - b.period!.sort_order);

  const nowMinutes = (() => {
    const now = new Date();
    return now.getHours() * 60 + now.getMinutes();
  })();

  const nextEntryId = todaysEntries.find((row) => minutesSinceMidnight(row.period!.start_time) > nowMinutes)?.entry.id;

  return (
    <Card>
      <CardHeader title="Today's Timetable" />
      {todaysEntries.length === 0 ? (
        <EmptyState label="No classes scheduled for today." />
      ) : (
        <ul className="divide-y divide-border">
          {todaysEntries.map(({ entry, period }) => {
            const start = minutesSinceMidnight(period!.start_time);
            const end = minutesSinceMidnight(period!.end_time);
            const isCurrent = nowMinutes >= start && nowMinutes < end;
            const isNext = !isCurrent && entry.id === nextEntryId;
            const subject = subjects.find((s) => s.id === entry.subject_id)?.name;
            const section = sections.find((s) => s.id === entry.section_id);
            const klass = classes.find((c) => c.id === (section?.class_id ?? entry.class_id))?.name;
            const teacher = teachers.find((t) => t.id === entry.teacher_id)?.full_name;

            return (
              <li key={entry.id} className="flex items-center justify-between gap-3 px-5 py-3">
                <div>
                  <p className="text-sm font-medium">{subject}</p>
                  <p className="text-xs text-muted">
                    {secondary === "teacher" ? teacher : `${klass} - Section ${section?.name}`}
                    {entry.room ? ` · ${entry.room}` : ""}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted">
                    {period!.start_time.slice(0, 5)}–{period!.end_time.slice(0, 5)}
                  </p>
                  {isCurrent && (
                    <span className="rounded-full bg-success/10 px-2 py-0.5 text-[11px] font-medium text-success">Now</span>
                  )}
                  {isNext && (
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">Next</span>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}
