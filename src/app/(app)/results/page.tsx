import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { getStudentIdForProfile, getChildStudentIdsForProfile } from "@/lib/data/people";
import { getStudent } from "@/lib/data/students";
import { listExams } from "@/lib/data/exams";
import { listResults } from "@/lib/data/results";
import { Card, CardHeader, EmptyState } from "@/components/ui/card";
import { StudentResultsList } from "@/components/exams/student-results-list";

export default async function ResultsPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const role = session.profile.role;
  if (role === "super_admin" || role === "school_admin" || role === "teacher" || role === "accountant") {
    redirect("/exams");
  }

  const [exams, results] = await Promise.all([listExams(), listResults()]);
  const publishedExams = exams.filter((e) => e.status === "published");

  if (role === "student") {
    const studentId = await getStudentIdForProfile(session.profile.id);
    const myResults = results.filter((r) => r.student_id === studentId && publishedExams.some((e) => e.id === r.exam_id));
    return (
      <div className="space-y-4">
        <h1 className="text-xl font-semibold">My Results</h1>
        <Card>
          {myResults.length === 0 ? (
            <EmptyState label="No published results yet." />
          ) : (
            <StudentResultsList results={myResults} exams={publishedExams} />
          )}
        </Card>
      </div>
    );
  }

  if (role === "parent") {
    const childIds = await getChildStudentIdsForProfile(session.profile.id);
    const children = (await Promise.all(childIds.map((id) => getStudent(id)))).filter(Boolean) as NonNullable<
      Awaited<ReturnType<typeof getStudent>>
    >[];

    return (
      <div className="space-y-6">
        <h1 className="text-xl font-semibold">Results</h1>
        {children.length === 0 ? (
          <Card>
            <EmptyState label="No children are linked to your account yet." />
          </Card>
        ) : (
          children.map((child) => {
            const childResults = results.filter((r) => r.student_id === child!.id && publishedExams.some((e) => e.id === r.exam_id));
            return (
              <Card key={child!.id}>
                <CardHeader title={child!.full_name} />
                {childResults.length === 0 ? (
                  <EmptyState label="No published results yet." />
                ) : (
                  <StudentResultsList results={childResults} exams={publishedExams} />
                )}
              </Card>
            );
          })
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Results</h1>
      <Card>
        <EmptyState label="Nothing to show." />
      </Card>
    </div>
  );
}
