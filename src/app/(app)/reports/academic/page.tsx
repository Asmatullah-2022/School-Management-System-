import { redirect } from "next/navigation";
import { getSession, isSchoolStaff } from "@/lib/auth/session";
import { listExams } from "@/lib/data/exams";
import { listExamSubjects } from "@/lib/data/exam-schedule";
import { listMarks } from "@/lib/data/marks";
import { listResults } from "@/lib/data/results";
import { listStudents } from "@/lib/data/students";
import { listClasses, listSections } from "@/lib/data/academics";
import { listSubjects } from "@/lib/data/subjects";
import { AcademicReportsCenter } from "@/components/reports/academic-reports-center";
import type { AcademicReportDataset } from "@/lib/reports/academic-reports";

export default async function AcademicReportsPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!isSchoolStaff(session.profile.role)) redirect("/dashboard");

  const [exams, examSubjects, marks, results, students, classes, sections, subjects] = await Promise.all([
    listExams(), listExamSubjects(), listMarks(), listResults(), listStudents(), listClasses(), listSections(), listSubjects(),
  ]);
  const data: AcademicReportDataset = { exams, examSubjects, marks, results, students, classes, sections, subjects };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold">Academic Reports</h1>
        <p className="text-sm text-muted">Reports built from published exam results — no grading is recalculated here.</p>
      </div>
      <AcademicReportsCenter data={data} classes={classes} students={students} />
    </div>
  );
}
