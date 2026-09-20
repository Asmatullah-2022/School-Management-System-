import { redirect } from "next/navigation";
import { getSession, isSchoolStaff } from "@/lib/auth/session";
import { listBooks, listBookIssues, getLibrarySettings } from "@/lib/data/library";
import { listStudents, getStudent } from "@/lib/data/students";
import { listTeachers } from "@/lib/data/teachers";
import { getStudentIdForProfile, getChildStudentIdsForProfile } from "@/lib/data/people";
import { LibraryDashboard } from "@/components/library/library-dashboard";
import { MyLibraryChildSwitcher } from "@/components/library/my-library-child-switcher";
import type { LibraryDataset } from "@/lib/reports/library-reports";

export default async function LibraryPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const [books, issues, settings] = await Promise.all([listBooks(), listBookIssues(), getLibrarySettings(session.school.id)]);

  if (isSchoolStaff(session.profile.role)) {
    const [students, teachers] = await Promise.all([listStudents(), listTeachers()]);
    const data: LibraryDataset = { books, issues, students, teachers, settings };
    return (
      <div className="space-y-4">
        <div>
          <h1 className="text-xl font-semibold">Library Dashboard</h1>
          <p className="text-sm text-muted">Real-time overview of the school library.</p>
        </div>
        <LibraryDashboard data={data} />
      </div>
    );
  }

  // Student/parent: "My Library" — own or child's issued books only.
  const studentIds =
    session.profile.role === "student"
      ? [await getStudentIdForProfile(session.profile.id)].filter((id): id is string => !!id)
      : await getChildStudentIdsForProfile(session.profile.id);

  const children = (await Promise.all(studentIds.map((id) => getStudent(id)))).filter((s): s is NonNullable<typeof s> => !!s);
  const entries = children.map((student) => ({
    student,
    issues: issues.filter((i) => i.student_id === student.id),
  }));

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold">My Library</h1>
        <p className="text-sm text-muted">
          {session.profile.role === "parent" ? "Your children's library records." : "Your issued books, due dates, and fines."}
        </p>
      </div>
      <MyLibraryChildSwitcher entries={entries} books={books} settings={settings} showChildHeader={session.profile.role === "parent"} />
    </div>
  );
}
