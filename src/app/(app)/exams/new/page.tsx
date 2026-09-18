import { redirect } from "next/navigation";
import { getSession, isSchoolAdmin } from "@/lib/auth/session";
import { Card } from "@/components/ui/card";
import { ExamForm } from "@/components/exams/exam-form";
import { createExamAction } from "../actions";

export default async function NewExamPage() {
  const session = await getSession();
  if (!session || !isSchoolAdmin(session.profile.role)) redirect("/exams");

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div>
        <h1 className="text-xl font-semibold">Create Exam</h1>
        <p className="text-sm text-muted">Set up the exam, then add subjects to its schedule.</p>
      </div>
      <Card className="p-5 sm:p-6">
        <ExamForm action={createExamAction} />
      </Card>
    </div>
  );
}
