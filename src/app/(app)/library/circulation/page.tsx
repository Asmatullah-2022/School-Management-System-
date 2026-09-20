import { redirect } from "next/navigation";
import { getSession, isSchoolAdmin, isSchoolStaff } from "@/lib/auth/session";
import { listBooks, listBookIssues, getLibrarySettings } from "@/lib/data/library";
import { listStudents } from "@/lib/data/students";
import { listTeachers } from "@/lib/data/teachers";
import { CirculationView } from "@/components/library/circulation-view";
import { issueBookAction, returnBookAction } from "../actions";

export default async function CirculationPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!isSchoolStaff(session.profile.role)) redirect("/library");

  const [books, issues, students, teachers, settings] = await Promise.all([
    listBooks(),
    listBookIssues(),
    listStudents(),
    listTeachers(),
    getLibrarySettings(session.school.id),
  ]);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold">Library Circulation</h1>
        <p className="text-sm text-muted">Issue books, process returns, and track overdue items.</p>
      </div>
      <CirculationView
        books={books}
        issues={issues}
        students={students}
        teachers={teachers}
        settings={settings}
        canIssue={isSchoolAdmin(session.profile.role) || session.profile.role === "teacher"}
        issueAction={issueBookAction}
        returnAction={returnBookAction}
      />
    </div>
  );
}
