import { notFound, redirect } from "next/navigation";
import { getSession, isSchoolAdmin } from "@/lib/auth/session";
import { getExam } from "@/lib/data/exams";
import { listResults } from "@/lib/data/results";
import { listStudents } from "@/lib/data/students";
import { getCurrentAcademicSession } from "@/lib/data/sessions";
import { PrintButton } from "@/components/timetable/print-button";

export default async function PrintClassResultsPage({ params }: { params: Promise<{ examId: string }> }) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!isSchoolAdmin(session.profile.role) && session.profile.role !== "teacher" && session.profile.role !== "accountant") {
    redirect("/dashboard");
  }

  const { examId } = await params;
  const [exam, results, students, academicSession] = await Promise.all([
    getExam(examId),
    listResults(),
    listStudents(),
    getCurrentAcademicSession(),
  ]);
  if (!exam) notFound();

  const rows = results
    .filter((r) => r.exam_id === examId)
    .map((result) => ({ result, student: students.find((s) => s.id === result.student_id) }))
    .filter((r) => r.student)
    .sort((a, b) => (a.result.class_rank ?? 999) - (b.result.class_rank ?? 999));

  return (
    <div className="mx-auto max-w-4xl p-6 print:p-0">
      <div className="mb-4 flex items-center justify-between print:hidden">
        <p className="text-sm text-muted">Print preview</p>
        <PrintButton />
      </div>

      <header className="mb-6 border-b border-border pb-4 text-center">
        <h1 className="text-lg font-bold uppercase tracking-wide">{session.school.name}</h1>
        <p className="text-sm text-muted">{session.school.address}</p>
        <p className="mt-2 text-base font-semibold">{exam.name} — Class Results</p>
        {academicSession && <p className="text-sm text-muted">Academic Session {academicSession.name}</p>}
      </header>

      <table className="w-full border-collapse text-sm">
        <thead>
          <tr>
            <th className="border border-border px-2 py-2 text-left">Rank</th>
            <th className="border border-border px-2 py-2 text-left">Roll #</th>
            <th className="border border-border px-2 py-2 text-left">Student</th>
            <th className="border border-border px-2 py-2 text-center">Total</th>
            <th className="border border-border px-2 py-2 text-center">Obtained</th>
            <th className="border border-border px-2 py-2 text-center">%</th>
            <th className="border border-border px-2 py-2 text-center">Grade</th>
            <th className="border border-border px-2 py-2 text-center">Result</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({ result, student }) => (
            <tr key={result.id}>
              <td className="border border-border px-2 py-2">{result.class_rank ?? "—"}</td>
              <td className="border border-border px-2 py-2">{student!.roll_number ?? "—"}</td>
              <td className="border border-border px-2 py-2">{student!.full_name}</td>
              <td className="border border-border px-2 py-2 text-center">{result.total_marks}</td>
              <td className="border border-border px-2 py-2 text-center">{result.total_obtained}</td>
              <td className="border border-border px-2 py-2 text-center">{result.percentage}%</td>
              <td className="border border-border px-2 py-2 text-center">{result.grade}</td>
              <td className="border border-border px-2 py-2 text-center">{result.is_pass ? "Pass" : "Fail"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
