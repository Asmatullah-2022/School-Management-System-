import { redirect } from "next/navigation";
import { getSession, isSchoolStaff } from "@/lib/auth/session";
import { listAttendance } from "@/lib/data/records";
import { listStudents } from "@/lib/data/students";
import { listClasses, listSections } from "@/lib/data/academics";
import { AttendanceReportsCenter } from "@/components/reports/attendance-reports-center";
import type { AttendanceReportDataset } from "@/lib/reports/attendance-reports";

export default async function AttendanceReportsPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!isSchoolStaff(session.profile.role)) redirect("/dashboard");

  const [attendance, students, classes, sections] = await Promise.all([listAttendance(), listStudents(), listClasses(), listSections()]);
  const data: AttendanceReportDataset = { attendance, students, classes, sections };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold">Attendance Reports</h1>
        <p className="text-sm text-muted">Real-time reports generated from recorded attendance.</p>
      </div>
      <AttendanceReportsCenter data={data} students={students} />
    </div>
  );
}
