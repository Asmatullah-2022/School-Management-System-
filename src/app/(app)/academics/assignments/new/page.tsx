import { redirect } from "next/navigation";
import { getSession, isSchoolAdmin } from "@/lib/auth/session";
import { listClasses, listSections } from "@/lib/data/academics";
import { listSubjects } from "@/lib/data/subjects";
import { listTeachers } from "@/lib/data/teachers";
import { Card } from "@/components/ui/card";
import { AssignmentForm } from "@/components/academics/assignment-form";
import { createAssignmentAction } from "../actions";

export default async function NewAssignmentPage() {
  const session = await getSession();
  if (!session || !isSchoolAdmin(session.profile.role)) redirect("/academics/assignments");

  const [classes, sections, subjects, teachers] = await Promise.all([
    listClasses(),
    listSections(),
    listSubjects(),
    listTeachers(),
  ]);

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div>
        <h1 className="text-xl font-semibold">Add Subject Assignment</h1>
        <p className="text-sm text-muted">Assign a subject and teacher to a class section.</p>
      </div>
      <Card className="p-5 sm:p-6">
        <AssignmentForm action={createAssignmentAction} classes={classes} sections={sections} subjects={subjects} teachers={teachers} />
      </Card>
    </div>
  );
}
