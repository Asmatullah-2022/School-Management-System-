import { Card } from "@/components/ui/card";
import { TeacherForm } from "@/components/teachers/teacher-form";
import { createTeacherAction } from "../actions";

export default function NewTeacherPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div>
        <h1 className="text-xl font-semibold">Add Teacher</h1>
        <p className="text-sm text-muted">Register a new teacher or staff member.</p>
      </div>
      <Card className="p-5 sm:p-6">
        <TeacherForm action={createTeacherAction} />
      </Card>
    </div>
  );
}
