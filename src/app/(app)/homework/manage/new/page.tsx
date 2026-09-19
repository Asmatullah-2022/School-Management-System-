import { redirect } from "next/navigation";
import { getSession, isSchoolAdmin } from "@/lib/auth/session";
import { getTeacherIdForProfile } from "@/lib/data/people";
import { listAssignments } from "@/lib/data/assignments";
import { listClasses, listSections } from "@/lib/data/academics";
import { listSubjects } from "@/lib/data/subjects";
import { listTeachers } from "@/lib/data/teachers";
import { Card } from "@/components/ui/card";
import { HomeworkForm, type AssignmentOption } from "@/components/homework/homework-form";
import { createHomeworkAction } from "../../actions";

export default async function NewHomeworkPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  const isAdmin = isSchoolAdmin(session.profile.role);
  if (session.profile.role !== "teacher" && !isAdmin) redirect("/homework");

  const [assignments, classes, sections, subjects, teachers] = await Promise.all([
    listAssignments(),
    listClasses(),
    listSections(),
    listSubjects(),
    listTeachers(),
  ]);

  const teacherId = isAdmin ? null : await getTeacherIdForProfile(session.profile.id);
  const scoped = isAdmin ? assignments : assignments.filter((a) => a.teacher_id === teacherId);

  const options: AssignmentOption[] = scoped.map((a) => ({
    classId: a.class_id,
    sectionId: a.section_id ?? null,
    subjectId: a.subject_id,
    teacherId: a.teacher_id,
  }));

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div>
        <h1 className="text-xl font-semibold">Create Homework</h1>
        <p className="text-sm text-muted">Only classes and subjects you are assigned to are available below.</p>
      </div>
      <Card className="p-5 sm:p-6">
        <HomeworkForm options={options} classes={classes} sections={sections} subjects={subjects} teachers={teachers} isAdmin={isAdmin} action={createHomeworkAction} />
      </Card>
    </div>
  );
}
