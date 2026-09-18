import { redirect } from "next/navigation";
import { getSession, isFinanceStaff } from "@/lib/auth/session";
import { listFeeStructures } from "@/lib/data/finance";
import { listClasses, listSections } from "@/lib/data/academics";
import { listStudents } from "@/lib/data/students";
import { Card } from "@/components/ui/card";
import { GenerateFeesForm } from "@/components/finance/generate-fees-form";
import { generateFeesAction } from "./actions";

export default async function GenerateFeesPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!isFinanceStaff(session.profile.role)) redirect("/fees");

  const [structures, classes, sections, students] = await Promise.all([
    listFeeStructures(),
    listClasses(),
    listSections(),
    listStudents(),
  ]);

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div>
        <h1 className="text-xl font-semibold">Generate Fees</h1>
        <p className="text-sm text-muted">
          Create fee charges for students from a fee structure. Charges already generated for the same
          student/period are automatically skipped — this is safe to re-run.
        </p>
      </div>
      <Card className="p-5 sm:p-6">
        {structures.filter((s) => s.is_active).length === 0 ? (
          <p className="text-sm text-muted">
            No active fee structures yet. <a href="/fees/structures/new" className="text-primary hover:underline">Create one first</a>.
          </p>
        ) : (
          <GenerateFeesForm structures={structures} classes={classes} sections={sections} students={students} action={generateFeesAction} />
        )}
      </Card>
    </div>
  );
}
