import { listStudents } from "@/lib/data/students";
import { listClasses, listSections } from "@/lib/data/academics";
import { listAttendance } from "@/lib/data/records";
import { Card } from "@/components/ui/card";
import { AttendanceMarker } from "@/components/attendance/attendance-marker";

export default async function AttendancePage() {
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
