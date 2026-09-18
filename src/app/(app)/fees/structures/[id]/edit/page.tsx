import { notFound, redirect } from "next/navigation";
import { getSession, isFinanceStaff } from "@/lib/auth/session";
import { listFeeStructures } from "@/lib/data/finance";
import { listClasses } from "@/lib/data/academics";
import { Card } from "@/components/ui/card";
import { FeeStructureForm } from "@/components/finance/fee-structure-form";
import { updateFeeStructureAction } from "../../actions";

export default async function EditFeeStructurePage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!isFinanceStaff(session.profile.role)) redirect("/fees");

  const { id } = await params;
  const [structures, classes] = await Promise.all([listFeeStructures(), listClasses()]);
  const structure = structures.find((s) => s.id === id);
  if (!structure) notFound();

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div>
        <h1 className="text-xl font-semibold">Edit Fee Structure</h1>
        <p className="text-sm text-muted">{structure.name}</p>
      </div>
      <Card className="p-5 sm:p-6">
        <FeeStructureForm structure={structure} classes={classes} action={updateFeeStructureAction.bind(null, id)} />
      </Card>
    </div>
  );
}
