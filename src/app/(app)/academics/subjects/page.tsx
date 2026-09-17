import Link from "next/link";
import { Plus } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { listSubjects } from "@/lib/data/subjects";
import { Card } from "@/components/ui/card";
import { SubjectsTable } from "@/components/academics/subjects-table";

export default async function SubjectsPage() {
  const [session, subjects] = await Promise.all([getSession(), listSubjects()]);
  const canManage = !!session && ["super_admin", "school_admin"].includes(session.profile.role);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold">Subjects</h1>
          <p className="text-sm text-muted">{subjects.length} subjects</p>
        </div>
        {canManage && (
          <Link
            href="/academics/subjects/new"
            className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            <Plus size={16} /> Add Subject
          </Link>
        )}
      </div>

      <Card>
        <SubjectsTable subjects={subjects} canManage={canManage} />
      </Card>
    </div>
  );
}
