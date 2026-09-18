import { notFound, redirect } from "next/navigation";
import { getSession, isSchoolAdmin } from "@/lib/auth/session";
import { getExam } from "@/lib/data/exams";
import { getExamSubject } from "@/lib/data/exam-schedule";
import { listClasses, listSections } from "@/lib/data/academics";
import { listSubjects } from "@/lib/data/subjects";
import { listTeachers } from "@/lib/data/teachers";
import { Card } from "@/components/ui/card";
import { ScheduleForm } from "@/components/exams/schedule-form";
import { updateExamScheduleAction } from "../../actions";

export default async function EditExamSchedulePage({ params }: { params: Promise<{ id: string; esId: string }> }) {
  const session = await getSession();
  if (!session || !isSchoolAdmin(session.profile.role)) redirect("/exams");

  const { id, esId } = await params;
  const [exam, scheduleEntry, classes, sections, subjects, teachers] = await Promise.all([
    getExam(id),
    getExamSubject(esId),
    listClasses(),
    listSections(),
    listSubjects(),
    listTeachers(),
  ]);
  if (!exam || !scheduleEntry) notFound();
  if (exam.status === "published") redirect(`/exams/${id}`);

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div>
        <h1 className="text-xl font-semibold">Edit Schedule</h1>
        <p className="text-sm text-muted">{exam.name}</p>
      </div>
      <Card className="p-5 sm:p-6">
        <ScheduleForm
          action={updateExamScheduleAction.bind(null, id, esId)}
          classes={classes}
          sections={sections}
          subjects={subjects}
          teachers={teachers}
          defaultValues={scheduleEntry}
          submitLabel="Update Schedule"
        />
      </Card>
    </div>
  );
}
