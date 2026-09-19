import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus } from "lucide-react";
import { getSession, isSchoolAdmin } from "@/lib/auth/session";
import { getStudentIdForProfile, getChildStudentIdsForProfile } from "@/lib/data/people";
import { getStudent } from "@/lib/data/students";
import { listExams } from "@/lib/data/exams";
import { listExamSubjects } from "@/lib/data/exam-schedule";
import { listSubjects } from "@/lib/data/subjects";
import { Card } from "@/components/ui/card";
import { ExamsTable } from "@/components/exams/exams-table";
import { ExamScheduleView } from "@/components/exams/exam-schedule-view";

export default async function ExamsPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  if (session.profile.role === "parent" || session.profile.role === "student") {
    const [examSubjects, exams, subjects] = await Promise.all([listExamSubjects(), listExams(), listSubjects()]);
    const studentIds =
      session.profile.role === "student"
        ? [await getStudentIdForProfile(session.profile.id)].filter((id): id is string => !!id)
        : await getChildStudentIdsForProfile(session.profile.id);
    const children = (await Promise.all(studentIds.map((id) => getStudent(id)))).filter((s): s is NonNullable<typeof s> => !!s);

    return (
      <div className="space-y-4">
        <div>
          <h1 className="text-xl font-semibold">Exam Schedule</h1>
          <p className="text-sm text-muted">{session.profile.role === "parent" ? "Your children's" : "Your"} examination schedule.</p>
        </div>
        <ExamScheduleView students={children} examSubjects={examSubjects} exams={exams} subjects={subjects} />
      </div>
    );
  }

  const exams = await listExams();
  const canManage = isSchoolAdmin(session.profile.role);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold">Examinations</h1>
          <p className="text-sm text-muted">{exams.length} examinations</p>
        </div>
        {canManage && (
          <Link
            href="/exams/new"
            className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            <Plus size={16} /> Create Exam
          </Link>
        )}
      </div>

      <Card>
        <ExamsTable exams={exams} />
      </Card>
    </div>
  );
}
