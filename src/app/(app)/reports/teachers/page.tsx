import { redirect } from "next/navigation";
import { getSession, isSchoolAdmin } from "@/lib/auth/session";
import { listTeachers } from "@/lib/data/teachers";
import { listAssignments } from "@/lib/data/assignments";
import { listClasses, listSections } from "@/lib/data/academics";
import { listSubjects } from "@/lib/data/subjects";
import { TeacherReportsCenter } from "@/components/reports/teacher-reports-center";
import type { TeacherReportDataset } from "@/lib/reports/teacher-reports";

export default async function TeacherReportsPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!isSchoolAdmin(session.profile.role)) redirect("/dashboard");

  const [teachers, assignments, classes, sections, subjects] = await Promise.all([
    listTeachers(), listAssignments(), listClasses(), listSections(), listSubjects(),
  ]);
  const data: TeacherReportDataset = { teachers, assignments, classes, sections, subjects };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold">Teacher Reports</h1>
        <p className="text-sm text-muted">Real-time reports generated from teacher and subject-assignment records.</p>
      </div>
      <TeacherReportsCenter data={data} />
    </div>
  );
}
