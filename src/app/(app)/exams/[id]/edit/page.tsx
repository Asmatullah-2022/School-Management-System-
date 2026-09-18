import { notFound, redirect } from "next/navigation";
import { getSession, isSchoolAdmin } from "@/lib/auth/session";
import { getExam } from "@/lib/data/exams";
import { Card } from "@/components/ui/card";
import { ExamForm } from "@/components/exams/exam-form";
import { updateExamAction } from "../../actions";

export default async function EditExamPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || !isSchoolAdmin(session.profile.role)) redirect("/exams");

  const { id } = await params;
  const exam = await getExam(id);
  if (!exam) notFound();
  if (exam.status === "published") redirect(`/exams/${id}`);

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div>
        <h1 className="text-xl font-semibold">Edit Exam</h1>
        <p className="text-sm text-muted">Update {exam.name}.</p>
      </div>
      <Card className="p-5 sm:p-6">
        <ExamForm action={updateExamAction.bind(null, id)} defaultValues={exam} submitLabel="Update Exam" showStatus />
      </Card>
    </div>
  );
}
