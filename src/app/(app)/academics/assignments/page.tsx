import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus } from "lucide-react";
import { getSession, isSchoolAdmin } from "@/lib/auth/session";
import { listAssignments } from "@/lib/data/assignments";
import { listClasses, listSections } from "@/lib/data/academics";
import { listSubjects } from "@/lib/data/subjects";
import { listTeachers } from "@/lib/data/teachers";
import { Card } from "@/components/ui/card";
import { AssignmentsTable } from "@/components/academics/assignments-table";

export default async function AssignmentsPage() {
  const session = await getSession();
  if (!session || !isSchoolAdmin(session.profile.role)) redirect("/dashboard");

  const [assignments, classes, sections, subjects, teachers] = await Promise.all([
    listAssignments(),
    listClasses(),
    listSections(),
    listSubjects(),
    listTeachers(),
  ]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold">Subject Assignments</h1>
          <p className="text-sm text-muted">Assign a subject and teacher to each class section.</p>
        </div>
        <Link
          href="/academics/assignments/new"
          className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
        >
          <Plus size={16} /> Add Assignment
        </Link>
      </div>

      <Card>
        <AssignmentsTable assignments={assignments} classes={classes} sections={sections} subjects={subjects} teachers={teachers} />
      </Card>
    </div>
  );
}
