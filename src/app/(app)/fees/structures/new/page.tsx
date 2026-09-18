import { redirect } from "next/navigation";
import { getSession, isFinanceStaff } from "@/lib/auth/session";
import { listClasses } from "@/lib/data/academics";
import { Card } from "@/components/ui/card";
import { FeeStructureForm } from "@/components/finance/fee-structure-form";
import { createFeeStructureAction } from "../actions";

export default async function NewFeeStructurePage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!isFinanceStaff(session.profile.role)) redirect("/fees");

  const classes = await listClasses();

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div>
        <h1 className="text-xl font-semibold">Add Fee Structure</h1>
        <p className="text-sm text-muted">Define a fee type that can be generated as charges for students.</p>
      </div>
      <Card className="p-5 sm:p-6">
        <FeeStructureForm classes={classes} action={createFeeStructureAction} />
      </Card>
    </div>
  );
}
