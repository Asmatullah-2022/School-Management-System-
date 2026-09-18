import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { getExam } from "@/lib/data/exams";
import { listResults, getSubjectAnalytics } from "@/lib/data/results";
import { listStudents } from "@/lib/data/students";
import { listSubjects } from "@/lib/data/subjects";
import { Card, EmptyState } from "@/components/ui/card";
import { ClassResultsTable } from "@/components/exams/class-results-table";
import { CalculateResultsButton } from "@/components/exams/calculate-results-button";
import { calculateResultsAction } from "../actions-results";

export default async function ExamResultsPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!["super_admin", "school_admin", "teacher", "accountant"].includes(session.profile.role)) {
    redirect("/dashboard");
  }

  const { id } = await params;
  const [exam, results, students, subjects, analytics] = await Promise.all([
    getExam(id),
    listResults(),
    listStudents(),
    listSubjects(),
    getSubjectAnalytics(id),
  ]);
  if (!exam) notFound();

  const examResults = results.filter((r) => r.exam_id === id);
  const rows = examResults
    .map((result) => ({ result, student: students.find((s) => s.id === result.student_id)! }))
    .filter((r) => r.student);

  return (
    <div className="space-y-4">
      <Link href={`/exams/${id}`} className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-primary">
        <ArrowLeft size={15} /> Back to {exam.name}
      </Link>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold">{exam.name} — Results</h1>
          <p className="text-sm text-muted">{rows.length} students</p>
        </div>
        <CalculateResultsButton examId={id} action={calculateResultsAction} />
      </div>

      <Card>
        {rows.length === 0 ? (
          <EmptyState label='No results yet. Once every subject is verified, click "Calculate Results".' />
        ) : (
          <ClassResultsTable rows={rows} examId={id} examName={exam.name} />
        )}
      </Card>

      {analytics.length > 0 && (
        <div>
          <h2 className="mb-3 text-sm font-semibold">Subject Analytics</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {analytics.map((a) => (
              <Card key={a.exam_subject_id} className="p-4">
                <p className="text-sm font-semibold">{subjects.find((s) => s.id === a.subject_id)?.name ?? "Subject"}</p>
                {a.entries === 0 ? (
                  <p className="mt-2 text-xs text-muted">No marks entered yet.</p>
                ) : (
                  <>
                    <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <p className="text-muted">Highest</p>
                        <p className="font-medium">{a.highest}</p>
                      </div>
                      <div>
                        <p className="text-muted">Lowest</p>
                        <p className="font-medium">{a.lowest}</p>
                      </div>
                      <div>
                        <p className="text-muted">Average</p>
                        <p className="font-medium">{a.average}</p>
                      </div>
                      <div>
                        <p className="text-muted">Pass %</p>
                        <p className="font-medium">{a.pass_percentage}%</p>
                      </div>
                      <div>
                        <p className="text-muted">Passed</p>
                        <p className="font-medium text-success">{a.pass_count}</p>
                      </div>
                      <div>
                        <p className="text-muted">Failed</p>
                        <p className="font-medium text-danger">{a.fail_count}</p>
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {Object.entries(a.grade_distribution).map(([grade, count]) => (
                        <span key={grade} className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
                          {grade}: {count}
                        </span>
                      ))}
                    </div>
                  </>
                )}
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
