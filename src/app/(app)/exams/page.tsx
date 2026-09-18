import Link from "next/link";
import { Plus } from "lucide-react";
import { getSession, isSchoolAdmin } from "@/lib/auth/session";
import { listExams } from "@/lib/data/exams";
import { Card } from "@/components/ui/card";
import { ExamsTable } from "@/components/exams/exams-table";

export default async function ExamsPage() {
  const [session, exams] = await Promise.all([getSession(), listExams()]);
  const canManage = !!session && isSchoolAdmin(session.profile.role);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold">Examinations</h1>
          <p className="text-sm text-muted">{exams.length} examinations</p>
        </div>
        {canManage && (
          <Link
            href="/exams/new"
            className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            <Plus size={16} /> Create Exam
          </Link>
        )}
      </div>

      <Card>
        <ExamsTable exams={exams} />
      </Card>
    </div>
  );
}
