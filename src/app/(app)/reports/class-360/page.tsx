import { redirect } from "next/navigation";
import { getSession, isSchoolStaff } from "@/lib/auth/session";
import { listClasses, listSections } from "@/lib/data/academics";
import { listStudents } from "@/lib/data/students";
import { listAttendance, listHomework } from "@/lib/data/records";
import { listHomeworkAssignments } from "@/lib/data/homework-submissions";
import { listExams } from "@/lib/data/exams";
import { listResults } from "@/lib/data/results";
import { listFees } from "@/lib/data/finance";
import { listBookIssues } from "@/lib/data/library";
import { listRouteStudents } from "@/lib/data/transport";
import { buildClass360, type Class360Context } from "@/lib/reports/class-360";
import { Class360Selector } from "@/components/reports/class-360-selector";

export default async function Class360Page({ searchParams }: { searchParams: Promise<{ classId?: string; sectionId?: string }> }) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!isSchoolStaff(session.profile.role)) redirect("/dashboard");

  const { classId: requestedClassId, sectionId: requestedSectionId } = await searchParams;
  const [classes, sections, students, attendance, homework, homeworkAssignments, exams, results, fees, bookIssues, transportAssignments] =
    await Promise.all([
      listClasses(), listSections(), listStudents(), listAttendance(), listHomework(), listHomeworkAssignments(),
      listExams(), listResults(), listFees(), listBookIssues(), listRouteStudents(),
    ]);

  const classId = requestedClassId && classes.some((c) => c.id === requestedClassId) ? requestedClassId : classes[0]?.id;
  const sectionId = requestedSectionId && sections.some((s) => s.id === requestedSectionId) ? requestedSectionId : null;

  const ctx: Class360Context = { classes, sections, students, attendance, exams, results, homework, homeworkAssignments, fees, bookIssues, transportAssignments };
  const report = classId ? buildClass360(classId, sectionId, ctx) : undefined;

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div>
        <h1 className="text-xl font-semibold">Class 360</h1>
        <p className="text-sm text-muted">A complete cross-module snapshot for one class/section.</p>
      </div>
      <Class360Selector classes={classes} sections={sections} classId={classId ?? ""} sectionId={sectionId} report={report} />
    </div>
  );
}
