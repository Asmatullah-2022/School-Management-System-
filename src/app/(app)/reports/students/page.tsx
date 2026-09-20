import { redirect } from "next/navigation";
import { getSession, isSchoolStaff } from "@/lib/auth/session";
import { listStudents } from "@/lib/data/students";
import { listClasses, listSections } from "@/lib/data/academics";
import { listAcademicSessions } from "@/lib/data/sessions";
import { StudentReportsCenter } from "@/components/reports/student-reports-center";
import type { StudentReportDataset } from "@/lib/reports/student-reports";

export default async function StudentReportsPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!isSchoolStaff(session.profile.role)) redirect("/dashboard");

  const [students, classes, sections, sessions] = await Promise.all([listStudents(), listClasses(), listSections(), listAcademicSessions()]);
  const data: StudentReportDataset = { students, classes, sections, sessions };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold">Student Reports</h1>
        <p className="text-sm text-muted">Real-time reports generated from student records.</p>
      </div>
      <StudentReportsCenter data={data} />
    </div>
  );
}
