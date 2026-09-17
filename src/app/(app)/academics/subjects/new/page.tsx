import { redirect } from "next/navigation";
import { getSession, isSchoolAdmin } from "@/lib/auth/session";
import { Card } from "@/components/ui/card";
import { SubjectForm } from "@/components/academics/subject-form";
import { createSubjectAction } from "../actions";

export default async function NewSubjectPage() {
  const session = await getSession();
  if (!session || !isSchoolAdmin(session.profile.role)) redirect("/academics/subjects");

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div>
        <h1 className="text-xl font-semibold">Add Subject</h1>
        <p className="text-sm text-muted">Create a subject that can be assigned to classes and teachers.</p>
      </div>
      <Card className="p-5 sm:p-6">
        <SubjectForm action={createSubjectAction} />
      </Card>
    </div>
  );
}
