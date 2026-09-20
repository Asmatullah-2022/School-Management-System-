import { redirect } from "next/navigation";
import { getSession, isSchoolStaff } from "@/lib/auth/session";
import { listBooks, listBookIssues, getLibrarySettings } from "@/lib/data/library";
import { listStudents } from "@/lib/data/students";
import { listTeachers } from "@/lib/data/teachers";
import { LibraryReportsCenter } from "@/components/library/library-reports-center";
import type { LibraryDataset } from "@/lib/reports/library-reports";

export default async function LibraryReportsPage() {
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

  const data: LibraryDataset = { books, issues, students, teachers, settings };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold">Library Reports</h1>
        <p className="text-sm text-muted">Real-time reports generated from the library catalog and circulation records.</p>
      </div>
      <LibraryReportsCenter data={data} />
    </div>
  );
}
