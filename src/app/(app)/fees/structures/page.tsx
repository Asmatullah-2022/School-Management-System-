import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus } from "lucide-react";
import { getSession, isFinanceStaff } from "@/lib/auth/session";
import { listFeeStructures } from "@/lib/data/finance";
import { listClasses } from "@/lib/data/academics";
import { Card } from "@/components/ui/card";
import { FeeStructuresTable } from "@/components/finance/fee-structures-table";
import { duplicateFeeStructureAction, toggleFeeStructureAction } from "./actions";

export default async function FeeStructuresPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!isFinanceStaff(session.profile.role)) redirect("/fees");

  const [structures, classes] = await Promise.all([listFeeStructures(), listClasses()]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold">Fee Structure</h1>
          <p className="text-sm text-muted">{structures.length} fee types defined for this school.</p>
        </div>
        <Link
          href="/fees/structures/new"
          className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
        >
          <Plus size={16} /> Add Fee Structure
        </Link>
      </div>

      <Card>
        <FeeStructuresTable
          structures={structures}
          classes={classes}
          canManage
          duplicateAction={duplicateFeeStructureAction}
          toggleAction={toggleFeeStructureAction}
        />
      </Card>
    </div>
  );
}
