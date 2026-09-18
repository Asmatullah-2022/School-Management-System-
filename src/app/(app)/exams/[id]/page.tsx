import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Plus, Pencil, Archive, Trash2, CheckCircle2, ClipboardList, BarChart3 } from "lucide-react";
import { getSession, isSchoolAdmin } from "@/lib/auth/session";
import { getExam } from "@/lib/data/exams";
import { listExamSubjects } from "@/lib/data/exam-schedule";
import { listClasses, listSections } from "@/lib/data/academics";
import { listSubjects } from "@/lib/data/subjects";
import { listTeachers } from "@/lib/data/teachers";
import { listAssignments } from "@/lib/data/assignments";
import { listMarks } from "@/lib/data/marks";
import { listStudents } from "@/lib/data/students";
import { getTeacherIdForProfile } from "@/lib/data/people";
import { Card, CardHeader, EmptyState } from "@/components/ui/card";
import { archiveExamAction, publishExamAction } from "../actions";
import { deleteExamScheduleAction } from "./schedule/actions";
import { PublishExamButton } from "@/components/exams/publish-exam-button";
import { DeleteScheduleButton } from "@/components/exams/delete-schedule-button";

const statusStyles: Record<string, string> = {
  draft: "bg-muted/10 text-muted",
  scheduled: "bg-primary/10 text-primary",
  ongoing: "bg-warning/10 text-warning",
  completed: "bg-accent/10 text-accent",
  published: "bg-success/10 text-success",
};

const marksStatusStyles: Record<string, string> = {
  none: "bg-muted/10 text-muted",
  draft: "bg-muted/10 text-muted",
  submitted: "bg-warning/10 text-warning",
  verified: "bg-accent/10 text-accent",
  published: "bg-success/10 text-success",
};

export default async function ExamDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) redirect("/login");

  const { id } = await params;
  const [exam, examSubjects, classes, sections, subjects, teachers, assignments, marks, students] = await Promise.all([
    getExam(id),
    listExamSubjects(),
    listClasses(),
    listSections(),
    listSubjects(),
    listTeachers(),
    listAssignments(),
    listMarks(),
    listStudents(),
  ]);
  if (!exam) notFound();

  const canManage = isSchoolAdmin(session.profile.role);
  const mySchedule = examSubjects.filter((es) => es.exam_id === id);

  let myTeacherId: string | undefined;
  if (session.profile.role === "teacher") {
    myTeacherId = await getTeacherIdForProfile(session.profile.id);
  }

  const rows = mySchedule.map((es) => {
    const rowMarks = marks.filter((m) => m.exam_subject_id === es.id);
    const enrolledCount = students.filter((s) => s.section_id === es.section_id).length;
    const statuses = new Set(rowMarks.map((m) => m.status));
    const summaryStatus = rowMarks.length === 0 ? "none" : statuses.size === 1 ? [...statuses][0] : "mixed";

    const canEnterMarks =
      canManage ||
      (myTeacherId &&
        assignments.some(
          (a) =>
            a.status === "active" &&
            a.teacher_id === myTeacherId &&
            a.class_id === es.class_id &&
            (a.section_id === es.section_id || a.section_id === null) &&
            a.subject_id === es.subject_id
        ));

    return {
      es,
      className: classes.find((c) => c.id === es.class_id)?.name ?? "—",
      sectionName: sections.find((s) => s.id === es.section_id)?.name ?? "—",
      subjectName: subjects.find((s) => s.id === es.subject_id)?.name ?? "—",
      invigilatorName: teachers.find((t) => t.id === es.invigilator_id)?.full_name,
      enrolledCount,
      submittedCount: rowMarks.filter((m) => m.status !== "draft").length,
      summaryStatus,
      canEnterMarks,
      canVerify: canManage && summaryStatus === "submitted",
      canReopen: canManage && (summaryStatus === "verified" || summaryStatus === "submitted"),
    };
  });

  const allMarks = mySchedule.flatMap((es) => marks.filter((m) => m.exam_subject_id === es.id));
  const canCalculateResults = mySchedule.length > 0 && allMarks.length > 0 && allMarks.every((m) => m.status === "verified" || m.status === "published");
  const canPublish = exam.status !== "published" && canCalculateResults;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold">{exam.name}</h1>
            <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${statusStyles[exam.status] ?? "bg-muted/10 text-muted"}`}>
              {exam.status}
            </span>
          </div>
          <p className="text-sm text-muted">
            {new Date(exam.start_date).toLocaleDateString()} – {new Date(exam.end_date).toLocaleDateString()}
          </p>
        </div>
        {canManage && exam.status !== "published" && (
          <div className="flex flex-wrap items-center gap-2">
            <Link href={`/exams/${id}/edit`} className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm font-medium hover:bg-background">
              <Pencil size={15} /> Edit
            </Link>
            <form action={archiveExamAction.bind(null, id)}>
              <button type="submit" className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm font-medium text-danger hover:bg-background">
                <Archive size={15} /> Archive
              </button>
            </form>
            <PublishExamButton examId={id} action={publishExamAction} disabled={!canPublish} />
          </div>
        )}
        {exam.status === "published" && (
          <Link
            href={`/exams/${id}/results`}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            <BarChart3 size={16} /> View Results
          </Link>
        )}
      </div>

      <Card>
        <CardHeader
          title="Exam Schedule"
          action={
            canManage &&
            exam.status !== "published" && (
              <Link href={`/exams/${id}/schedule/new`} className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:opacity-90">
                <Plus size={15} /> Add Subject
              </Link>
            )
          }
        />
        {rows.length === 0 ? (
          <EmptyState label="No subjects scheduled yet." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border text-xs uppercase tracking-wide text-muted">
                  <th className="px-4 py-2.5 font-medium">Subject</th>
                  <th className="px-4 py-2.5 font-medium">Class / Section</th>
                  <th className="hidden px-4 py-2.5 font-medium sm:table-cell">Date</th>
                  <th className="hidden px-4 py-2.5 font-medium sm:table-cell">Room / Invigilator</th>
                  <th className="px-4 py-2.5 font-medium">Marks Status</th>
                  <th className="px-4 py-2.5 font-medium"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {rows.map((r) => (
                  <tr key={r.es.id}>
                    <td className="px-4 py-3 font-medium">{r.subjectName}</td>
                    <td className="px-4 py-3">
                      {r.className} - {r.sectionName}
                    </td>
                    <td className="hidden px-4 py-3 text-muted sm:table-cell">
                      {r.es.exam_date ? new Date(r.es.exam_date).toLocaleDateString() : "—"}
                    </td>
                    <td className="hidden px-4 py-3 text-muted sm:table-cell">
                      {r.es.exam_room ?? "—"} {r.invigilatorName ? `· ${r.invigilatorName}` : ""}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${marksStatusStyles[r.summaryStatus] ?? marksStatusStyles.none}`}>
                        {r.summaryStatus === "none" ? "Not entered" : r.summaryStatus}
                      </span>
                      <span className="ml-2 text-xs text-muted">
                        {r.submittedCount}/{r.enrolledCount} students
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        {(r.canEnterMarks || canManage) && (
                          <Link
                            href={`/exams/${id}/marks/${r.es.id}`}
                            className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-primary hover:bg-primary/10"
                          >
                            <ClipboardList size={14} />{" "}
                            {exam.status === "published"
                              ? "View / Revise"
                              : r.summaryStatus === "none"
                                ? "Enter Marks"
                                : "View / Edit"}
                          </Link>
                        )}
                        {canManage && exam.status !== "published" && (
                          <>
                            <Link href={`/exams/${id}/schedule/${r.es.id}/edit`} className="rounded-md p-1.5 text-muted hover:bg-background hover:text-primary" aria-label="Edit schedule">
                              <Pencil size={14} />
                            </Link>
                            <DeleteScheduleButton examId={id} scheduleId={r.es.id} action={deleteExamScheduleAction}>
                              <Trash2 size={14} />
                            </DeleteScheduleButton>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {canManage && canCalculateResults && exam.status !== "published" && (
        <Card className="flex flex-wrap items-center justify-between gap-3 p-4">
          <div className="flex items-center gap-2 text-sm">
            <CheckCircle2 size={16} className="text-success" />
            All marks are verified. Review the class results, then publish to release them to students and parents.
          </div>
          <Link href={`/exams/${id}/results`} className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-background">
            Review Results
          </Link>
        </Card>
      )}
    </div>
  );
}
