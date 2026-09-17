import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { listClasses, listSections } from "@/lib/data/academics";
import { listSubjects } from "@/lib/data/subjects";
import { listTeachers } from "@/lib/data/teachers";
import { listPeriods } from "@/lib/data/periods";
import { listTimetableEntries } from "@/lib/data/timetable";
import { getCurrentAcademicSession } from "@/lib/data/sessions";
import { PrintableTimetable } from "@/components/timetable/printable-timetable";

export default async function PrintTeacherTimetablePage({ params }: { params: Promise<{ teacherId: string }> }) {
  const session = await getSession();
  if (!session) redirect("/login");

  const { teacherId } = await params;
  const [classes, sections, subjects, teachers, periods, allEntries, academicSession] = await Promise.all([
    listClasses(),
    listSections(),
    listSubjects(),
    listTeachers(),
    listPeriods(),
    listTimetableEntries(),
    getCurrentAcademicSession(),
  ]);

  const teacher = teachers.find((t) => t.id === teacherId);
  if (!teacher) notFound();
  const entries = allEntries.filter((e) => e.teacher_id === teacherId);
  const workingDays = session.school.working_days?.length ? session.school.working_days : [1, 2, 3, 4, 5, 6];

  return (
    <PrintableTimetable
      school={session.school}
      title={`Teacher Timetable — ${teacher.full_name}`}
      subtitle={academicSession ? `Academic Session ${academicSession.name}` : ""}
      workingDays={workingDays}
      periods={periods}
      entries={entries}
      subjects={subjects}
      teachers={teachers}
      classes={classes}
      sections={sections}
      secondary="class"
    />
  );
}
