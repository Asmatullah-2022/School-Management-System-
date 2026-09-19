import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus } from "lucide-react";
import { getSession, isSchoolAdmin } from "@/lib/auth/session";
import { listTeachers } from "@/lib/data/teachers";
import { Card } from "@/components/ui/card";
import { TeachersTable } from "@/components/teachers/teachers-table";

export default async function TeachersPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!isSchoolAdmin(session.profile.role)) redirect("/dashboard");

  const teachers = await listTeachers();

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold">Teachers & Staff</h1>
          <p className="text-sm text-muted">{teachers.length} teachers</p>
        </div>
        <Link
          href="/teachers/new"
          className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
        >
          <Plus size={16} /> Add Teacher
        </Link>
      </div>

      <Card>
        <TeachersTable teachers={teachers} />
      </Card>
    </div>
  );
}
