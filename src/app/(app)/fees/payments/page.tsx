import { redirect } from "next/navigation";
import { getSession, isFinanceStaff } from "@/lib/auth/session";
import { listPayments } from "@/lib/data/finance";
import { listStudents } from "@/lib/data/students";
import { Card } from "@/components/ui/card";
import { PaymentHistoryTable } from "@/components/finance/payment-history-table";

export default async function PaymentHistoryPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!isFinanceStaff(session.profile.role)) redirect("/fees");

  const [payments, students] = await Promise.all([listPayments(), listStudents()]);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold">Payment History</h1>
        <p className="text-sm text-muted">Every payment ever recorded — searchable, filterable, and exportable.</p>
      </div>
      <Card>
        <PaymentHistoryTable payments={payments} students={students} />
      </Card>
    </div>
  );
}
