import { notFound, redirect } from "next/navigation";
import { getSession, isSchoolAdmin } from "@/lib/auth/session";
import { getExam } from "@/lib/data/exams";
import { listClasses, listSections } from "@/lib/data/academics";
import { listSubjects } from "@/lib/data/subjects";
import { listTeachers } from "@/lib/data/teachers";
import { Card } from "@/components/ui/card";
import { ScheduleForm } from "@/components/exams/schedule-form";
import { createExamScheduleAction } from "../actions";

export default async function NewExamSchedulePage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || !isSchoolAdmin(session.profile.role)) redirect("/exams");

  const { id } = await params;
  const exam = await getExam(id);
  if (!exam) notFound();
  if (exam.status === "published") redirect(`/exams/${id}`);

  const [classes, sections, subjects, teachers] = await Promise.all([
    listClasses(),
    listSections(),
    listSubjects(),
    listTeachers(),
  ]);

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div>
        <h1 className="text-xl font-semibold">Add to Schedule</h1>
        <p className="text-sm text-muted">{exam.name}</p>
      </div>
      <Card className="p-5 sm:p-6">
        <ScheduleForm action={createExamScheduleAction.bind(null, id)} classes={classes} sections={sections} subjects={subjects} teachers={teachers} />
      </Card>
    </div>
  );
}
