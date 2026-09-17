import { listClasses, listSections } from "@/lib/data/academics";
import { Card } from "@/components/ui/card";
import { StudentForm } from "@/components/students/student-form";
import { createStudentAction } from "../actions";

export default async function NewStudentPage() {
  const [classes, sections] = await Promise.all([listClasses(), listSections()]);

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div>
        <h1 className="text-xl font-semibold">Add Student</h1>
        <p className="text-sm text-muted">Register a new student in three quick steps.</p>
      </div>
      <Card className="p-5 sm:p-6">
        <StudentForm action={createStudentAction} classes={classes} sections={sections} />
      </Card>
    </div>
  );
}
