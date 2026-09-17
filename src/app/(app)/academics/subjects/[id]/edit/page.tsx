import { notFound, redirect } from "next/navigation";
import { getSession, isSchoolAdmin } from "@/lib/auth/session";
import { getSubject } from "@/lib/data/subjects";
import { Card } from "@/components/ui/card";
import { SubjectForm } from "@/components/academics/subject-form";
import { updateSubjectAction } from "../../actions";

export default async function EditSubjectPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || !isSchoolAdmin(session.profile.role)) redirect("/academics/subjects");

  const { id } = await params;
  const subject = await getSubject(id);
  if (!subject) notFound();

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div>
        <h1 className="text-xl font-semibold">Edit Subject</h1>
        <p className="text-sm text-muted">Update details for {subject.name}.</p>
      </div>
      <Card className="p-5 sm:p-6">
        <SubjectForm action={updateSubjectAction.bind(null, id)} defaultValues={subject} submitLabel="Update Subject" />
      </Card>
    </div>
  );
}
