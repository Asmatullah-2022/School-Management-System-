import { redirect } from "next/navigation";
import { getSession, isSchoolAdmin } from "@/lib/auth/session";
import { Card } from "@/components/ui/card";
import { PeriodForm } from "@/components/academics/period-form";
import { createPeriodAction } from "../actions";

export default async function NewPeriodPage() {
  const session = await getSession();
  if (!session || !isSchoolAdmin(session.profile.role)) redirect("/academics/periods");

  return (
    <div className="mx-auto max-w-xl space-y-4">
      <div>
        <h1 className="text-xl font-semibold">Add Period</h1>
        <p className="text-sm text-muted">Periods and breaks are shared by every class timetable.</p>
      </div>
      <Card className="p-5 sm:p-6">
        <PeriodForm action={createPeriodAction} />
      </Card>
    </div>
  );
}
