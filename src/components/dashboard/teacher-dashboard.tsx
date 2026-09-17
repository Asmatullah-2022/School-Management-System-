import { BookOpen, GraduationCap, NotebookPen, Users } from "lucide-react";
import { StatCard } from "@/components/dashboard/stat-card";
import { Card, CardHeader, EmptyState } from "@/components/ui/card";
import { TodaySchedule } from "@/components/timetable/today-schedule";
import type {
  HomeworkRecord,
  Period,
  SchoolClass,
  Section,
  Student,
  Subject,
  SubjectAssignment,
  Teacher,
  TimetableEntry,
} from "@/types/database";

export function TeacherDashboard({
  assignments,
  todayEntries,
  periods,
  subjects,
  teachers,
  classes,
  sections,
  students,
  homework,
  today,
}: {
  assignments: SubjectAssignment[];
  todayEntries: TimetableEntry[];
  periods: Period[];
  subjects: Subject[];
  teachers: Teacher[];
  classes: SchoolClass[];
  sections: Section[];
  students: Student[];
  homework: HomeworkRecord[];
  today: number;
}) {
  const uniqueClassSections = Array.from(new Set(assignments.map((a) => `${a.class_id}|${a.section_id}`))).map((key) => {
    const [classId, sectionId] = key.split("|");
    return { classId, sectionId };
  });
  const uniqueSubjectIds = Array.from(new Set(assignments.map((a) => a.subject_id)));

  const now = new Date().toISOString().slice(0, 10);
  const pendingHomework = homework.filter((h) => h.due_date >= now);
  const overdueHomework = homework.filter((h) => h.due_date < now);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="My Classes" value={uniqueClassSections.length} icon={Users} tone="primary" />
        <StatCard label="My Subjects" value={uniqueSubjectIds.length} icon={BookOpen} tone="accent" />
        <StatCard label="Today's Classes" value={todayEntries.length} icon={GraduationCap} tone="success" />
        <StatCard
          label="Pending Academic Tasks"
          value={pendingHomework.length + overdueHomework.length}
          icon={NotebookPen}
          tone={overdueHomework.length ? "danger" : "warning"}
          hint={overdueHomework.length ? `${overdueHomework.length} overdue` : "Homework due"}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title="My Classes" />
          {uniqueClassSections.length === 0 ? (
            <EmptyState label="No classes assigned to you yet." />
          ) : (
            <ul className="divide-y divide-border">
              {uniqueClassSections.map(({ classId, sectionId }) => {
                const klass = classes.find((c) => c.id === classId)?.name;
                const section = sections.find((s) => s.id === sectionId);
                const count = students.filter((s) => s.section_id === sectionId).length;
                const mySubjects = assignments
                  .filter((a) => a.class_id === classId && a.section_id === sectionId)
                  .map((a) => subjects.find((s) => s.id === a.subject_id)?.name)
                  .filter(Boolean);
                return (
                  <li key={`${classId}-${sectionId}`} className="px-5 py-3">
                    <p className="text-sm font-medium">
                      {klass} - Section {section?.name}
                    </p>
                    <p className="text-xs text-muted">{count} students · {mySubjects.join(", ")}</p>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>

        <TodaySchedule
          entries={todayEntries}
          periods={periods}
          today={today}
          subjects={subjects}
          teachers={teachers}
          classes={classes}
          sections={sections}
          secondary="class"
        />
      </div>
    </div>
  );
}
