import Link from "next/link";
import { Plus } from "lucide-react";
import { listStudents } from "@/lib/data/students";
import { listClasses, listSections } from "@/lib/data/academics";
import { Card } from "@/components/ui/card";
import { StudentsTable } from "@/components/students/students-table";

export default async function StudentsPage() {
  const [students, classes, sections] = await Promise.all([
    listStudents(),
    listClasses(),
    listSections(),
  ]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold">Students</h1>
          <p className="text-sm text-muted">{students.length} enrolled students</p>
        </div>
        <Link
          href="/students/new"
          className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
        >
          <Plus size={16} /> Add Student
        </Link>
      </div>

      <Card>
        <StudentsTable students={students} classes={classes} sections={sections} />
      </Card>
    </div>
  );
}
