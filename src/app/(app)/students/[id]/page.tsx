import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getStudent } from "@/lib/data/students";
import { listClasses, listSections } from "@/lib/data/academics";
import { listAttendance, listHomework } from "@/lib/data/records";
import { listFees } from "@/lib/data/finance";
import { listExams } from "@/lib/data/exams";
import { listResults } from "@/lib/data/results";
import { Card } from "@/components/ui/card";
import { StudentProfileTabs } from "@/components/students/student-profile-tabs";

export default async function StudentProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const student = await getStudent(id);
  if (!student) notFound();

  const [classes, sections, attendance, fees, homework, exams, results] = await Promise.all([
    listClasses(),
    listSections(),
    listAttendance(),
    listFees(),
    listHomework(),
    listExams(),
    listResults(),
  ]);

  const className = classes.find((c) => c.id === student.class_id)?.name ?? "—";
  const sectionName = sections.find((s) => s.id === student.section_id)?.name ?? "—";
  const studentAttendance = attendance.filter((a) => a.student_id === student.id);
  const studentFees = fees.filter((f) => f.student_id === student.id);
  const studentHomework = homework.filter((h) => h.class_id === student.class_id);
  const studentResults = results.filter((r) => r.student_id === student.id);

  const presentCount = studentAttendance.filter((a) => a.status === "present").length;
  const attendancePct = studentAttendance.length
    ? Math.round((presentCount / studentAttendance.length) * 100)
    : 0;

  return (
    <div className="space-y-4">
      <Link href="/students" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-primary">
        <ArrowLeft size={15} /> Back to Students
      </Link>

      <Card className="p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-xl font-semibold text-primary">
              {student.full_name.charAt(0)}
            </div>
            <div>
              <h1 className="text-lg font-semibold">{student.full_name}</h1>
              <p className="text-sm text-muted">
                {student.admission_number} · {className} - {sectionName} · Roll #{student.roll_number ?? "—"}
              </p>
            </div>
          </div>
          <span className="w-fit rounded-full bg-success/10 px-3 py-1 text-xs font-medium capitalize text-success">
            {student.status}
          </span>
        </div>
      </Card>

      <StudentProfileTabs
        student={student}
        attendance={studentAttendance}
        attendancePct={attendancePct}
        fees={studentFees}
        homework={studentHomework}
        results={studentResults}
        exams={exams}
      />
    </div>
  );
}
