import { redirect } from "next/navigation";
import { getSession, isFinanceStaff } from "@/lib/auth/session";
import { listFees } from "@/lib/data/finance";
import { listStudents } from "@/lib/data/students";
import { listClasses, listSections } from "@/lib/data/academics";
import { Card } from "@/components/ui/card";
import { OutstandingTable } from "@/components/finance/outstanding-table";
import { sendFeeReminderAction } from "./actions";

export default async function OutstandingFeesPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!isFinanceStaff(session.profile.role)) redirect("/fees");

  const [fees, students, classes, sections] = await Promise.all([listFees(), listStudents(), listClasses(), listSections()]);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold">Outstanding Fees</h1>
        <p className="text-sm text-muted">Every unpaid or partially-paid charge across the school.</p>
      </div>
      <Card>
        <OutstandingTable fees={fees} students={students} classes={classes} sections={sections} sendReminderAction={sendFeeReminderAction} />
      </Card>
    </div>
  );
}
