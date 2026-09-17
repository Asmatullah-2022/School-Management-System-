import { notFound, redirect } from "next/navigation";
import { getSession, isSchoolAdmin } from "@/lib/auth/session";
import { getAssignment } from "@/lib/data/assignments";
import { listClasses, listSections } from "@/lib/data/academics";
import { listSubjects } from "@/lib/data/subjects";
import { listTeachers } from "@/lib/data/teachers";
import { Card } from "@/components/ui/card";
import { AssignmentForm } from "@/components/academics/assignment-form";
import { updateAssignmentAction } from "../../actions";

export default async function EditAssignmentPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || !isSchoolAdmin(session.profile.role)) redirect("/academics/assignments");

  const { id } = await params;
  const [assignment, classes, sections, subjects, teachers] = await Promise.all([
    getAssignment(id),
    listClasses(),
    listSections(),
    listSubjects(),
    listTeachers(),
  ]);
  if (!assignment) notFound();

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div>
        <h1 className="text-xl font-semibold">Edit Subject Assignment</h1>
        <p className="text-sm text-muted">Update this assignment.</p>
      </div>
      <Card className="p-5 sm:p-6">
        <AssignmentForm
          action={updateAssignmentAction.bind(null, id)}
          classes={classes}
          sections={sections}
          subjects={subjects}
          teachers={teachers}
          defaultValues={assignment}
          submitLabel="Update Assignment"
        />
      </Card>
    </div>
  );
}
