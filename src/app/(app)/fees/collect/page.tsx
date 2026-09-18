import { redirect } from "next/navigation";
import { getSession, isFinanceStaff } from "@/lib/auth/session";
import { listFees } from "@/lib/data/finance";
import { listStudents } from "@/lib/data/students";
import { Card } from "@/components/ui/card";
import { CollectPaymentForm } from "@/components/finance/collect-payment-form";
import { recordPaymentAction } from "./actions";

export default async function CollectPaymentPage({ searchParams }: { searchParams: Promise<{ student?: string }> }) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!isFinanceStaff(session.profile.role)) redirect("/fees");

  const { student } = await searchParams;
  const [fees, students] = await Promise.all([listFees(), listStudents()]);

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div>
        <h1 className="text-xl font-semibold">Collect Payment</h1>
        <p className="text-sm text-muted">Search a student, allocate the amount across their outstanding charges, and generate a receipt.</p>
      </div>
      <Card className="p-5 sm:p-6">
        <CollectPaymentForm students={students} fees={fees} initialStudentId={student} action={recordPaymentAction} />
      </Card>
    </div>
  );
}
