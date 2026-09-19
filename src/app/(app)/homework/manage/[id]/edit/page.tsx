import { notFound, redirect } from "next/navigation";
import { getSession, isSchoolAdmin } from "@/lib/auth/session";
import { getTeacherIdForProfile } from "@/lib/data/people";
import { getHomework } from "@/lib/data/homework";
import { listAssignments } from "@/lib/data/assignments";
import { listClasses, listSections } from "@/lib/data/academics";
import { listSubjects } from "@/lib/data/subjects";
import { listTeachers } from "@/lib/data/teachers";
import { Card } from "@/components/ui/card";
import { HomeworkForm, type AssignmentOption } from "@/components/homework/homework-form";
import { updateHomeworkAction } from "../../../actions";

export default async function EditHomeworkPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) redirect("/login");
  const isAdmin = isSchoolAdmin(session.profile.role);
  if (session.profile.role !== "teacher" && !isAdmin) redirect("/homework");

  const { id } = await params;
  const homework = await getHomework(id);
  if (!homework) notFound();

  const teacherId = isAdmin ? null : await getTeacherIdForProfile(session.profile.id);
  if (!isAdmin && homework.teacher_id !== teacherId) redirect("/homework/manage");

  const [assignments, classes, sections, subjects, teachers] = await Promise.all([
    listAssignments(),
    listClasses(),
    listSections(),
    listSubjects(),
    listTeachers(),
  ]);
  const scoped = isAdmin ? assignments : assignments.filter((a) => a.teacher_id === teacherId);
  const options: AssignmentOption[] = scoped.map((a) => ({ classId: a.class_id, sectionId: a.section_id ?? null, subjectId: a.subject_id, teacherId: a.teacher_id }));

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div>
        <h1 className="text-xl font-semibold">Edit Homework</h1>
        <p className="text-sm text-muted">{homework.title}</p>
      </div>
      <Card className="p-5 sm:p-6">
        <HomeworkForm
          homework={homework}
          options={options}
          classes={classes}
          sections={sections}
          subjects={subjects}
          teachers={teachers}
          isAdmin={isAdmin}
          action={updateHomeworkAction.bind(null, id)}
        />
      </Card>
    </div>
  );
}
