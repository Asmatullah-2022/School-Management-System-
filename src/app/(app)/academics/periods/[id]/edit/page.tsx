import { notFound, redirect } from "next/navigation";
import { getSession, isSchoolAdmin } from "@/lib/auth/session";
import { listPeriods } from "@/lib/data/periods";
import { Card } from "@/components/ui/card";
import { PeriodForm } from "@/components/academics/period-form";
import { updatePeriodAction } from "../../actions";

export default async function EditPeriodPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || !isSchoolAdmin(session.profile.role)) redirect("/academics/periods");

  const { id } = await params;
  const period = (await listPeriods()).find((p) => p.id === id);
  if (!period) notFound();

  return (
    <div className="mx-auto max-w-xl space-y-4">
      <div>
        <h1 className="text-xl font-semibold">Edit Period</h1>
        <p className="text-sm text-muted">Update {period.name}.</p>
      </div>
      <Card className="p-5 sm:p-6">
        <PeriodForm action={updatePeriodAction.bind(null, id)} defaultValues={period} submitLabel="Update Period" />
      </Card>
    </div>
  );
}
