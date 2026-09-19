import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus, Pencil, Eye, CheckCircle2, XCircle } from "lucide-react";
import { getSession, isSchoolAdmin } from "@/lib/auth/session";
import { getTeacherIdForProfile } from "@/lib/data/people";
import { listHomework } from "@/lib/data/records";
import { listHomeworkAssignments } from "@/lib/data/homework-submissions";
import { listClasses, listSections } from "@/lib/data/academics";
import { listSubjects } from "@/lib/data/subjects";
import { Card, EmptyState } from "@/components/ui/card";
import { publishHomeworkAction, closeHomeworkAction } from "../actions";

const STAGE_STYLES: Record<string, string> = {
  draft: "bg-muted/10 text-muted",
  published: "bg-success/10 text-success",
  closed: "bg-danger/10 text-danger",
};

export default async function ManageHomeworkPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.profile.role !== "teacher" && !isSchoolAdmin(session.profile.role)) redirect("/homework");

  const [allHomework, allAssignments, classes, sections, subjects] = await Promise.all([
    listHomework(),
    listHomeworkAssignments(),
    listClasses(),
    listSections(),
    listSubjects(),
  ]);

  const teacherId = session.profile.role === "teacher" ? await getTeacherIdForProfile(session.profile.id) : null;
  const homework = session.profile.role === "teacher" ? allHomework.filter((h) => h.teacher_id === teacherId) : allHomework;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold">My Homework</h1>
          <p className="text-sm text-muted">{homework.length} homework item{homework.length === 1 ? "" : "s"}</p>
        </div>
        <Link href="/homework/manage/new" className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90">
          <Plus size={16} /> Create Homework
        </Link>
      </div>

      <Card>
        {homework.length === 0 ? (
          <EmptyState label="You haven't created any homework yet." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border text-xs uppercase tracking-wide text-muted">
                  <th className="px-4 py-2.5 font-medium">Title</th>
                  <th className="px-4 py-2.5 font-medium">Class / Section</th>
                  <th className="hidden px-4 py-2.5 font-medium sm:table-cell">Subject</th>
                  <th className="hidden px-4 py-2.5 font-medium sm:table-cell">Due Date</th>
                  <th className="px-4 py-2.5 font-medium">Submissions</th>
                  <th className="px-4 py-2.5 font-medium">Status</th>
                  <th className="px-4 py-2.5 font-medium"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {homework.map((h) => {
                  const submissionCount = allAssignments.filter((a) => a.homework_id === h.id && a.status !== "pending").length;
                  const stage = h.stage ?? "published";
                  return (
                    <tr key={h.id}>
                      <td className="px-4 py-3 font-medium">{h.title}</td>
                      <td className="px-4 py-3">
                        {classes.find((c) => c.id === h.class_id)?.name} {h.section_id ? `- ${sections.find((s) => s.id === h.section_id)?.name}` : ""}
                      </td>
                      <td className="hidden px-4 py-3 text-muted sm:table-cell">{subjects.find((s) => s.id === h.subject_id)?.name}</td>
                      <td className="hidden px-4 py-3 text-muted sm:table-cell">{new Date(h.due_date).toLocaleDateString()}</td>
                      <td className="px-4 py-3">{submissionCount}</td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${STAGE_STYLES[stage]}`}>{stage}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <Link href={`/homework/manage/${h.id}/submissions`} className="rounded-md p-1.5 text-muted hover:bg-background hover:text-primary" aria-label="View submissions">
                            <Eye size={14} />
                          </Link>
                          {stage !== "closed" && (
                            <Link href={`/homework/manage/${h.id}/edit`} className="rounded-md p-1.5 text-muted hover:bg-background hover:text-primary" aria-label="Edit">
                              <Pencil size={14} />
                            </Link>
                          )}
                          {stage === "draft" && (
                            <form action={publishHomeworkAction.bind(null, h.id)}>
                              <button type="submit" className="rounded-md p-1.5 text-muted hover:bg-background hover:text-success" aria-label="Publish">
                                <CheckCircle2 size={14} />
                              </button>
                            </form>
                          )}
                          {stage !== "closed" && (
                            <form action={closeHomeworkAction.bind(null, h.id)}>
                              <button type="submit" className="rounded-md p-1.5 text-muted hover:bg-background hover:text-danger" aria-label="Close">
                                <XCircle size={14} />
                              </button>
                            </form>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
