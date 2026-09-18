import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession, isSchoolAdmin } from "@/lib/auth/session";
import { getExam } from "@/lib/data/exams";
import { getExamSubject } from "@/lib/data/exam-schedule";
import { listStudents } from "@/lib/data/students";
import { listMarks, listMarkRevisions } from "@/lib/data/marks";
import { listClasses, listSections } from "@/lib/data/academics";
import { listSubjects } from "@/lib/data/subjects";
import { getAssignedExamSubjectIds } from "@/lib/data/marks-access";
import { Card, CardHeader, EmptyState } from "@/components/ui/card";
import { MarksEntryForm } from "@/components/exams/marks-entry-form";
import { VerifyMarksControls } from "@/components/exams/verify-marks-controls";
import { ReviseMarkRow } from "@/components/exams/revise-mark-row";
import { saveMarksAction, verifyMarksAction, reopenMarksAction, revisePublishedMarkAction } from "../actions";

export default async function MarksEntryPage({ params }: { params: Promise<{ id: string; esId: string }> }) {
  const session = await getSession();
  if (!session) redirect("/login");

  const { id, esId } = await params;
  const [exam, examSubject, classes, sections, subjects] = await Promise.all([
    getExam(id),
    getExamSubject(esId),
    listClasses(),
    listSections(),
    listSubjects(),
  ]);
  if (!exam || !examSubject) notFound();

  const canManage = isSchoolAdmin(session.profile.role);
  if (!canManage) {
    if (session.profile.role !== "teacher") redirect(`/exams/${id}`);
    const allowedIds = await getAssignedExamSubjectIds(session.profile.id);
    if (!allowedIds.has(esId)) redirect(`/exams/${id}`);
  }

  const [allStudents, allMarks] = await Promise.all([listStudents(), listMarks()]);
  const students = allStudents
    .filter((s) => s.section_id === examSubject.section_id)
    .sort((a, b) => (a.roll_number ?? "").localeCompare(b.roll_number ?? "", undefined, { numeric: true }));
  const existingMarks = allMarks.filter((m) => m.exam_subject_id === esId);
  const existingMarkIds = new Set(existingMarks.map((m) => m.id));
  const revisions = (await listMarkRevisions()).filter((r) => existingMarkIds.has(r.mark_id));

  const statuses = new Set(existingMarks.map((m) => m.status));
  const summaryStatus = existingMarks.length === 0 ? "none" : statuses.size === 1 ? [...statuses][0] : "mixed";
  const readOnly = exam.status === "published" || summaryStatus === "verified" || (summaryStatus === "submitted" && !canManage);

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <Link href={`/exams/${id}`} className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-primary">
        <ArrowLeft size={15} /> Back to {exam.name}
      </Link>

      <Card>
        <CardHeader
          title={`${subjects.find((s) => s.id === examSubject.subject_id)?.name ?? "Subject"} — ${classes.find((c) => c.id === examSubject.class_id)?.name ?? ""} Section ${sections.find((s) => s.id === examSubject.section_id)?.name ?? ""}`}
          action={
            canManage && (
              <VerifyMarksControls
                examId={id}
                examSubjectId={esId}
                canVerify={summaryStatus === "submitted"}
                canReopen={summaryStatus === "verified"}
                verifyAction={verifyMarksAction}
                reopenAction={reopenMarksAction}
              />
            )
          }
        />
        <div className="p-4">
          <p className="mb-4 text-sm text-muted">
            Total marks: {examSubject.total_marks} · Passing marks: {examSubject.passing_marks}
          </p>
          <MarksEntryForm
            examId={id}
            examSubject={examSubject}
            students={students}
            existingMarks={existingMarks}
            readOnly={readOnly}
            saveAction={saveMarksAction}
          />
        </div>
      </Card>

      {canManage && exam.status === "published" && (
        <Card>
          <CardHeader title="Revise Published Marks" />
          <p className="px-5 pt-3 text-xs text-muted">
            Published marks are locked. Changing one here requires a reason and is permanently logged.
          </p>
          {existingMarks.length === 0 ? (
            <EmptyState label="No marks to revise." />
          ) : (
            <ul className="divide-y divide-border">
              {students.map((s) => (
                <ReviseMarkRow
                  key={s.id}
                  student={s}
                  mark={existingMarks.find((m) => m.student_id === s.id)}
                  totalMarks={examSubject.total_marks}
                  examId={id}
                  action={revisePublishedMarkAction}
                />
              ))}
            </ul>
          )}
        </Card>
      )}

      {revisions.length > 0 && (
        <Card>
          <CardHeader title="Revision History" />
          <ul className="divide-y divide-border">
            {revisions.map((r) => (
              <li key={r.id} className="px-5 py-3 text-sm">
                <p>
                  {r.old_obtained_marks} → {r.new_obtained_marks}{" "}
                  <span className="text-xs text-muted">({new Date(r.created_at).toLocaleString()})</span>
                </p>
                <p className="text-xs text-muted">Reason: {r.reason}</p>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
