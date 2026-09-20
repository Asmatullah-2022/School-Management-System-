import Link from "next/link";
import { Bell, BookOpen, CalendarDays, ClipboardCheck, GraduationCap, NotebookPen, PenSquare, Users } from "lucide-react";
import { StatCard } from "@/components/dashboard/stat-card";
import { Card, CardHeader, EmptyState } from "@/components/ui/card";
import { TodaySchedule } from "@/components/timetable/today-schedule";
import type {
  EventRecord,
  HomeworkRecord,
  Period,
  SchoolClass,
  Section,
  Student,
  Subject,
  SubjectAssignment,
  TeacherDirectoryEntry,
  TimetableEntry,
} from "@/types/database";

const QUICK_ACTIONS = [
  { href: "/homework/manage/new", label: "Create Homework", icon: PenSquare },
  { href: "/homework/manage", label: "View Submissions", icon: NotebookPen },
  { href: "/attendance", label: "Mark Attendance", icon: ClipboardCheck },
  { href: "/notices", label: "View Notices", icon: Bell },
  { href: "/events", label: "View Events", icon: CalendarDays },
  { href: "/notifications", label: "Notifications", icon: Bell },
];

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
  upcomingEvents = [],
  unreadNotifications = 0,
}: {
  assignments: SubjectAssignment[];
  todayEntries: TimetableEntry[];
  periods: Period[];
  subjects: Subject[];
  teachers: TeacherDirectoryEntry[];
  classes: SchoolClass[];
  sections: Section[];
  students: Student[];
  homework: HomeworkRecord[];
  today: number;
  upcomingEvents?: EventRecord[];
  unreadNotifications?: number;
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
        <StatCard
          label="Unread Notifications"
          value={unreadNotifications}
          icon={Bell}
          tone={unreadNotifications > 0 ? "warning" : "success"}
        />
      </div>

      <Card>
        <CardHeader title="Quick Actions" />
        <div className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-3 lg:grid-cols-6">
          {QUICK_ACTIONS.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex flex-col items-center gap-1.5 rounded-xl border border-border p-3 text-center text-xs font-medium transition hover:border-primary hover:bg-primary/5"
            >
              <Icon size={18} className="text-primary" />
              {label}
            </Link>
          ))}
        </div>
      </Card>

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

        <Card>
          <CardHeader title="Upcoming Events" />
          {upcomingEvents.length === 0 ? (
            <EmptyState label="No upcoming events." />
          ) : (
            <ul className="divide-y divide-border">
              {upcomingEvents.slice(0, 5).map((e) => (
                <li key={e.id} className="flex items-center justify-between px-5 py-2.5 text-sm">
                  <span>{e.title}</span>
                  <span className="text-muted">{new Date(e.start_date).toLocaleDateString()}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
