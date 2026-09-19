import { redirect } from "next/navigation";
import { getSession, isSchoolStaff } from "@/lib/auth/session";
import { getStudentIdForProfile, getChildStudentIdsForProfile } from "@/lib/data/people";
import { listStudents, getStudent } from "@/lib/data/students";
import { listClasses, listSections } from "@/lib/data/academics";
import { listAttendance } from "@/lib/data/records";
import { Card, EmptyState } from "@/components/ui/card";
import { AttendanceMarker } from "@/components/attendance/attendance-marker";
import { AttendanceOverview } from "@/components/attendance/attendance-overview";

export default async function AttendancePage() {
  const session = await getSession();
  if (!session) redirect("/login");

  if (session.profile.role === "parent" || session.profile.role === "student") {
    const attendance = await listAttendance();
    const studentIds =
      session.profile.role === "student"
        ? [await getStudentIdForProfile(session.profile.id)].filter((id): id is string => !!id)
        : await getChildStudentIdsForProfile(session.profile.id);
    const children = (await Promise.all(studentIds.map((id) => getStudent(id)))).filter((s): s is NonNullable<typeof s> => !!s);

    return (
      <div className="space-y-4">
        <div>
          <h1 className="text-xl font-semibold">Attendance</h1>
          <p className="text-sm text-muted">{session.profile.role === "parent" ? "Your children's" : "Your"} attendance record.</p>
        </div>
        {children.length === 0 ? (
          <Card><EmptyState label="No attendance records linked to your account yet." /></Card>
        ) : (
          <AttendanceOverview students={children} attendance={attendance} />
        )}
      </div>
    );
  }

  if (!isSchoolStaff(session.profile.role)) redirect("/dashboard");

  const [students, classes, sections, attendance] = await Promise.all([
    listStudents(),
    listClasses(),
    listSections(),
    listAttendance(),
  ]);
  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold">Daily Attendance</h1>
        <p className="text-sm text-muted">Mark today&apos;s attendance in one click per class.</p>
      </div>
      <Card>
        <AttendanceMarker students={students} classes={classes} sections={sections} existing={attendance} date={today} />
      </Card>
    </div>
  );
}
