import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getSession, isSchoolAdmin } from "@/lib/auth/session";
import { getTeacherIdForProfile } from "@/lib/data/people";
import { getHomework } from "@/lib/data/homework";
import { listHomeworkAssignments } from "@/lib/data/homework-submissions";
import { listStudents } from "@/lib/data/students";
import { Card, CardHeader, EmptyState } from "@/components/ui/card";
import { SubmissionReviewRow } from "@/components/homework/submission-review-row";
import { reviewSubmissionAction } from "../../../actions";

export default async function HomeworkSubmissionsPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) redirect("/login");
  const isAdmin = isSchoolAdmin(session.profile.role);
  if (session.profile.role !== "teacher" && !isAdmin) redirect("/homework");

  const { id } = await params;
  const homework = await getHomework(id);
  if (!homework) notFound();

  const teacherId = isAdmin ? null : await getTeacherIdForProfile(session.profile.id);
  if (!isAdmin && homework.teacher_id !== teacherId) redirect("/homework/manage");

  const [assignments, allStudents] = await Promise.all([listHomeworkAssignments(), listStudents()]);
  const students = allStudents
    .filter((s) => s.class_id === homework.class_id && (!homework.section_id || s.section_id === homework.section_id))
    .sort((a, b) => (a.roll_number ?? "").localeCompare(b.roll_number ?? "", undefined, { numeric: true }));
  const submissions = assignments.filter((a) => a.homework_id === id);

  const submittedCount = submissions.filter((s) => s.status !== "pending").length;
  const checkedCount = submissions.filter((s) => s.status === "checked").length;

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <Link href="/homework/manage" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-primary">
        <ArrowLeft size={15} /> Back to My Homework
      </Link>

      <div>
        <h1 className="text-xl font-semibold">{homework.title}</h1>
        <p className="text-sm text-muted">
          Due {new Date(homework.due_date).toLocaleDateString()} · {submittedCount}/{students.length} submitted · {checkedCount} checked
        </p>
      </div>

      <Card>
        <CardHeader title="Submissions" />
        {students.length === 0 ? (
          <EmptyState label="No students enrolled in this class/section." />
        ) : (
          <ul className="divide-y divide-border">
            {students.map((s) => (
              <SubmissionReviewRow
                key={s.id}
                student={s}
                submission={submissions.find((sub) => sub.student_id === s.id)}
                maxMarks={homework.max_marks}
                action={reviewSubmissionAction}
              />
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
