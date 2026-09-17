import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { listClasses, listSections } from "@/lib/data/academics";
import { listSubjects } from "@/lib/data/subjects";
import { listTeachers } from "@/lib/data/teachers";
import { listPeriods } from "@/lib/data/periods";
import { listTimetableEntries } from "@/lib/data/timetable";
import { getCurrentAcademicSession } from "@/lib/data/sessions";
import { PrintableTimetable } from "@/components/timetable/printable-timetable";

export default async function PrintClassTimetablePage({ params }: { params: Promise<{ sectionId: string }> }) {
  const session = await getSession();
  if (!session) redirect("/login");

  const { sectionId } = await params;
  const [classes, sections, subjects, teachers, periods, allEntries, academicSession] = await Promise.all([
    listClasses(),
    listSections(),
    listSubjects(),
    listTeachers(),
    listPeriods(),
    listTimetableEntries(),
    getCurrentAcademicSession(),
  ]);

  const section = sections.find((s) => s.id === sectionId);
  if (!section) notFound();
  const klass = classes.find((c) => c.id === section.class_id);
  const entries = allEntries.filter((e) => e.section_id === sectionId);
  const workingDays = session.school.working_days?.length ? session.school.working_days : [1, 2, 3, 4, 5, 6];

  return (
    <PrintableTimetable
      school={session.school}
      title={`Class Timetable — ${klass?.name ?? ""} Section ${section.name}`}
      subtitle={academicSession ? `Academic Session ${academicSession.name}` : ""}
      workingDays={workingDays}
      periods={periods}
      entries={entries}
      subjects={subjects}
      teachers={teachers}
      classes={classes}
      sections={sections}
      secondary="teacher"
    />
  );
}
