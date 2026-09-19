import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { getStudentIdForProfile, getChildStudentIdsForProfile } from "@/lib/data/people";
import { getStudent } from "@/lib/data/students";
import { listHomework } from "@/lib/data/records";
import { listHomeworkAssignments } from "@/lib/data/homework-submissions";
import { listClasses, listSections } from "@/lib/data/academics";
import { listSubjects } from "@/lib/data/subjects";
import { listTeachers } from "@/lib/data/teachers";
import { Card } from "@/components/ui/card";
import { ChildHomeworkSwitcher, type ChildHomeworkEntry } from "@/components/homework/child-homework-switcher";
import { submitHomeworkAction } from "./actions";

export default async function HomeworkPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const [homework, classes, sections, subjects, teachers] = await Promise.all([
    listHomework(),
    listClasses(),
    listSections(),
    listSubjects(),
    listTeachers(),
  ]);

  if (session.profile.role === "student" || session.profile.role === "parent") {
    const assignments = await listHomeworkAssignments();
    const studentIds =
      session.profile.role === "student"
        ? [await getStudentIdForProfile(session.profile.id)].filter((id): id is string => !!id)
        : await getChildStudentIdsForProfile(session.profile.id);
    const children = (await Promise.all(studentIds.map((id) => getStudent(id)))).filter((s): s is NonNullable<typeof s> => !!s);

    const childEntries: ChildHomeworkEntry[] = children.map((student) => ({
      student,
      items: homework
        .filter((h) => h.class_id === student.class_id && (!h.section_id || h.section_id === student.section_id))
        .map((h) => ({
          homework: h,
          submission: assignments.find((a) => a.homework_id === h.id && a.student_id === student.id),
          subjectName: subjects.find((s) => s.id === h.subject_id)?.name ?? "—",
          teacherName: teachers.find((t) => t.id === h.teacher_id)?.full_name ?? "—",
        }))
        .sort((a, b) => (a.homework.due_date < b.homework.due_date ? -1 : 1)),
    }));

    return (
      <div className="space-y-4">
        <div>
          <h1 className="text-xl font-semibold">Homework & Assignments</h1>
          <p className="text-sm text-muted">{session.profile.role === "parent" ? "Your children's" : "Your"} assigned homework.</p>
        </div>
        {children.length === 0 ? (
          <Card className="p-5 text-sm text-muted">No children are linked to your account yet.</Card>
        ) : (
          <ChildHomeworkSwitcher
            childEntries={childEntries}
            classes={classes}
            sections={sections}
            action={session.profile.role === "student" ? submitHomeworkAction : undefined}
            readOnly={session.profile.role === "parent"}
          />
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold">Homework & Assignments</h1>
        <p className="text-sm text-muted">{homework.length} active homework items</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {homework.map((h) => {
          const cls = classes.find((c) => c.id === h.class_id)?.name;
          const sec = sections.find((s) => s.id === h.section_id)?.name;
          const subject = subjects.find((s) => s.id === h.subject_id)?.name;
          const teacher = teachers.find((t) => t.id === h.teacher_id)?.full_name;
          const overdue = new Date(h.due_date) < new Date(new Date().toDateString());

          return (
            <Card key={h.id} className="p-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">{subject}</span>
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${overdue ? "bg-danger/10 text-danger" : "bg-success/10 text-success"}`}>
                  {overdue ? "Overdue" : "Open"}
                </span>
              </div>
              <h3 className="text-sm font-semibold">{h.title}</h3>
              <p className="mt-1 text-sm text-muted">{h.description}</p>
              <div className="mt-3 flex items-center justify-between text-xs text-muted">
                <span>{cls} {sec ? `- ${sec}` : ""} · {teacher}</span>
                <span>Due {new Date(h.due_date).toLocaleDateString()}</span>
              </div>
            </Card>
          );
        })}
        {homework.length === 0 && <p className="text-sm text-muted">No homework assigned yet.</p>}
      </div>
    </div>
  );
}
