import { redirect } from "next/navigation";
import { getSession, isFinanceStaff } from "@/lib/auth/session";
import { listPayments, listPaymentAllocations, listRefunds, listFees } from "@/lib/data/finance";
import { listStudents } from "@/lib/data/students";
import { Card } from "@/components/ui/card";
import { NewRefundForm } from "@/components/finance/new-refund-form";
import { recordRefundAction } from "../actions";

export default async function NewRefundPage({ searchParams }: { searchParams: Promise<{ paymentId?: string }> }) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!isFinanceStaff(session.profile.role)) redirect("/fees");

  const { paymentId } = await searchParams;
  const [payments, allocations, refunds, fees, students] = await Promise.all([
    listPayments(),
    listPaymentAllocations(),
    listRefunds(),
    listFees(),
    listStudents(),
  ]);

  return (
    <div className="mx-auto max-w-xl space-y-4">
      <div>
        <h1 className="text-xl font-semibold">Issue Refund</h1>
        <p className="text-sm text-muted">Refunds are capped at the eligible paid amount and always require a reason.</p>
      </div>
      <Card className="p-5 sm:p-6">
        <NewRefundForm payments={payments} allocations={allocations} refunds={refunds} fees={fees} students={students} initialPaymentId={paymentId} action={recordRefundAction} />
      </Card>
    </div>
  );
}
