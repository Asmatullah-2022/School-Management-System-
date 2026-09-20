import Link from "next/link";
import { redirect } from "next/navigation";
import { Printer } from "lucide-react";
import { getSession, isSchoolAdmin } from "@/lib/auth/session";
import { getTeacherIdForProfile, getStudentIdForProfile, getChildStudentIdsForProfile } from "@/lib/data/people";
import { listClasses, listSections } from "@/lib/data/academics";
import { listSubjects } from "@/lib/data/subjects";
import { listTeacherNames } from "@/lib/data/teachers";
import { listPeriods } from "@/lib/data/periods";
import { listAssignments } from "@/lib/data/assignments";
import { listTimetableEntries } from "@/lib/data/timetable";
import { getStudent } from "@/lib/data/students";
import { Card, CardHeader, EmptyState } from "@/components/ui/card";
import { ReadonlyWeeklyGrid } from "@/components/timetable/readonly-weekly-grid";
import { TimetableFilters } from "@/components/timetable/timetable-filters";
import { TimetableBuilder } from "@/components/timetable/timetable-builder";
import { ChildTimetableSwitcher } from "@/components/timetable/child-timetable-switcher";
import { TodaySchedule } from "@/components/timetable/today-schedule";

export default async function TimetablePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const sp = await searchParams;
  const role = session.profile.role;
  const workingDays = session.school.working_days?.length ? session.school.working_days : [1, 2, 3, 4, 5, 6];
  const today = new Date().getDay();

  const [classes, sections, subjects, teachers, periods, assignments, allEntries] = await Promise.all([
    listClasses(),
    listSections(),
    listSubjects(),
    listTeacherNames(),
    listPeriods(),
    listAssignments(),
    listTimetableEntries(),
  ]);

  // ----- Teacher: own timetable only -----
  if (role === "teacher") {
    const teacherId = await getTeacherIdForProfile(session.profile.id);
    const entries = teacherId ? allEntries.filter((e) => e.teacher_id === teacherId) : [];
    return (
      <div className="space-y-4">
        <div>
          <h1 className="text-xl font-semibold">My Timetable</h1>
          <p className="text-sm text-muted">Your weekly teaching schedule.</p>
        </div>
        <TodaySchedule entries={entries} periods={periods} today={today} subjects={subjects} teachers={teachers} classes={classes} sections={sections} secondary="class" />
        <Card>
          <CardHeader title="Weekly Timetable" />
          <div className="p-4">
            {entries.length === 0 ? (
              <EmptyState label="No timetable entries assigned to you yet." />
            ) : (
              <ReadonlyWeeklyGrid
                days={workingDays}
                periods={periods}
                entries={entries}
                todayColumn={today}
                subjects={subjects}
                teachers={teachers}
                classes={classes}
                sections={sections}
                secondary="class"
              />
            )}
          </div>
        </Card>
      </div>
    );
  }

  // ----- Student: own class timetable -----
  if (role === "student") {
    const studentId = await getStudentIdForProfile(session.profile.id);
    const student = studentId ? await getStudent(studentId) : undefined;
    const entries = student?.section_id ? allEntries.filter((e) => e.section_id === student.section_id) : [];
    return (
      <div className="space-y-4">
        <div>
          <h1 className="text-xl font-semibold">My Timetable</h1>
          <p className="text-sm text-muted">
            {classes.find((c) => c.id === student?.class_id)?.name} - Section {sections.find((s) => s.id === student?.section_id)?.name}
          </p>
        </div>
        <TodaySchedule entries={entries} periods={periods} today={today} subjects={subjects} teachers={teachers} classes={classes} sections={sections} secondary="teacher" />
        <Card>
          <CardHeader title="Weekly Timetable" />
          <div className="p-4">
            {entries.length === 0 ? (
              <EmptyState label="No timetable has been published for your class yet." />
            ) : (
              <ReadonlyWeeklyGrid
                days={workingDays}
                periods={periods}
                entries={entries}
                todayColumn={today}
                subjects={subjects}
                teachers={teachers}
                classes={classes}
                sections={sections}
                secondary="teacher"
              />
            )}
          </div>
        </Card>
      </div>
    );
  }

  // ----- Parent: child selector, each child's own class timetable -----
  if (role === "parent") {
    const childIds = await getChildStudentIdsForProfile(session.profile.id);
    const children = (await Promise.all(childIds.map((id) => getStudent(id)))).filter(Boolean) as NonNullable<
      Awaited<ReturnType<typeof getStudent>>
    >[];

    if (children.length === 0) {
      return (
        <div className="space-y-4">
          <h1 className="text-xl font-semibold">Timetable</h1>
          <Card>
            <EmptyState label="No children are linked to your account yet." />
          </Card>
        </div>
      );
    }

    return (
      <ChildTimetableSwitcher
        childStudents={children}
        classes={classes}
        sections={sections}
        subjects={subjects}
        teachers={teachers}
        periods={periods}
        entries={allEntries}
        workingDays={workingDays}
        today={today}
      />
    );
  }

  // ----- Admin / School Admin / Accountant: builder or read-only viewer -----
  const view = sp.view === "teacher" ? "teacher" : "class";
  const canEdit = isSchoolAdmin(role);

  // Default to the first class that actually has a section, so the builder
  // isn't left showing an empty section selector (e.g. Nursery with no sections yet).
  const defaultClass = classes.find((c) => sections.some((s) => s.class_id === c.id)) ?? classes[0];
  const classId = sp.classId ?? defaultClass?.id ?? "";
  const sectionsForClass = sections.filter((s) => s.class_id === classId);
  const sectionId = sp.sectionId ?? sectionsForClass[0]?.id ?? "";
  const teacherId = sp.teacherId ?? teachers[0]?.id ?? "";

  const entries =
    view === "teacher" ? allEntries.filter((e) => e.teacher_id === teacherId) : allEntries.filter((e) => e.section_id === sectionId);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold">Timetable</h1>
          <p className="text-sm text-muted">
            {canEdit ? "Build and manage the weekly class timetable." : "View the weekly class timetable."}
          </p>
        </div>
        {view === "class" && sectionId && (
          <Link
            href={`/print/timetable/${sectionId}`}
            target="_blank"
            className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-background"
          >
            <Printer size={16} /> Print / Save as PDF
          </Link>
        )}
        {view === "teacher" && teacherId && (
          <Link
            href={`/print/timetable/teacher/${teacherId}`}
            target="_blank"
            className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-background"
          >
            <Printer size={16} /> Print / Save as PDF
          </Link>
        )}
      </div>

      <Card className="p-4">
        <TimetableFilters
          classes={classes}
          sections={sections}
          teachers={teachers}
          view={view}
          classId={classId}
          sectionId={sectionId}
          teacherId={teacherId}
        />
      </Card>

      <Card className="p-4">
        {view === "class" ? (
          canEdit ? (
            <TimetableBuilder
              classId={classId}
              sectionId={sectionId}
              workingDays={workingDays}
              periods={periods}
              entries={entries}
              assignments={assignments}
              subjects={subjects}
              teachers={teachers}
              sections={sections}
            />
          ) : entries.length === 0 ? (
            <EmptyState label="No timetable entries found for this class/section." />
          ) : (
            <ReadonlyWeeklyGrid
              days={workingDays}
              periods={periods}
              entries={entries}
              subjects={subjects}
              teachers={teachers}
              classes={classes}
              sections={sections}
              secondary="teacher"
            />
          )
        ) : entries.length === 0 ? (
          <EmptyState label="No timetable entries found for this teacher." />
        ) : (
          <ReadonlyWeeklyGrid
            days={workingDays}
            periods={periods}
            entries={entries}
            subjects={subjects}
            teachers={teachers}
            classes={classes}
            sections={sections}
            secondary="class"
          />
        )}
      </Card>
    </div>
  );
}
