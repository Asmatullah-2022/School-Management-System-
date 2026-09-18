import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, Receipt } from "lucide-react";
import { getSession, isFinanceStaff } from "@/lib/auth/session";
import { getStudent } from "@/lib/data/students";
import { getChildStudentIdsForProfile, getStudentIdForProfile } from "@/lib/data/people";
import { listFees, listPayments, listFeeDiscounts } from "@/lib/data/finance";
import { Card, CardHeader, EmptyState } from "@/components/ui/card";

const statusStyles: Record<string, string> = {
  paid: "bg-success/10 text-success",
  partial: "bg-warning/10 text-warning",
  unpaid: "bg-muted/10 text-muted",
  overdue: "bg-danger/10 text-danger",
};

export default async function FeeAccountPage({ params }: { params: Promise<{ studentId: string }> }) {
  const session = await getSession();
  if (!session) redirect("/login");

  const { studentId } = await params;
  const staff = isFinanceStaff(session.profile.role);
  if (!staff) {
    if (session.profile.role === "student") {
      const ownId = await getStudentIdForProfile(session.profile.id);
      if (ownId !== studentId) redirect("/fees");
    } else if (session.profile.role === "parent") {
      const childIds = await getChildStudentIdsForProfile(session.profile.id);
      if (!childIds.includes(studentId)) redirect("/fees");
    } else {
      redirect("/fees");
    }
  }

  const student = await getStudent(studentId);
  if (!student) notFound();

  const [allFees, allPayments, allDiscounts] = await Promise.all([listFees(), listPayments(), listFeeDiscounts()]);
  const fees = allFees.filter((f) => f.student_id === studentId).sort((a, b) => (a.due_date < b.due_date ? 1 : -1));
  const payments = allPayments.filter((p) => p.student_id === studentId);

  const totalCharged = fees.reduce((s, f) => s + f.amount, 0);
  const totalDiscount = fees.reduce((s, f) => s + f.discount, 0);
  const totalPaid = fees.reduce((s, f) => s + f.paid_amount, 0);
  const totalBalance = fees.reduce((s, f) => s + f.balance, 0);

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      {staff && (
        <Link href="/fees/outstanding" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-primary">
          <ArrowLeft size={15} /> Back to Outstanding Fees
        </Link>
      )}

      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold">{student.full_name}&apos;s Fee Account</h1>
        <p className="text-sm text-muted">Admission #{student.admission_number}</p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <SummaryStat label="Total Charged" value={totalCharged} />
        <SummaryStat label="Discounts Applied" value={totalDiscount} tone="text-accent" />
        <SummaryStat label="Total Paid" value={totalPaid} tone="text-success" />
        <SummaryStat label="Outstanding Balance" value={totalBalance} tone={totalBalance > 0 ? "text-danger" : "text-success"} />
      </div>

      <Card>
        <CardHeader title="Fee Charges" />
        {fees.length === 0 ? (
          <EmptyState label="No fee charges recorded yet." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border text-xs uppercase tracking-wide text-muted">
                  <th className="px-4 py-2.5 font-medium">Fee</th>
                  <th className="px-4 py-2.5 font-medium">Due Date</th>
                  <th className="px-4 py-2.5 font-medium">Amount</th>
                  <th className="px-4 py-2.5 font-medium">Discount</th>
                  <th className="px-4 py-2.5 font-medium">Paid</th>
                  <th className="px-4 py-2.5 font-medium">Balance</th>
                  <th className="px-4 py-2.5 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {fees.map((f) => (
                  <tr key={f.id}>
                    <td className="px-4 py-3 font-medium">{f.title}</td>
                    <td className="px-4 py-3 text-muted">{new Date(f.due_date).toLocaleDateString()}</td>
                    <td className="px-4 py-3">PKR {f.amount.toLocaleString()}</td>
                    <td className="px-4 py-3 text-accent">
                      {f.discount > 0 ? `-PKR ${f.discount.toLocaleString()}` : "—"}
                      {allDiscounts.filter((d) => d.fee_id === f.id).length > 0 && (
                        <span className="ml-1 text-xs text-muted">
                          ({allDiscounts.filter((d) => d.fee_id === f.id).length} applied)
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-success">PKR {f.paid_amount.toLocaleString()}</td>
                    <td className="px-4 py-3 font-semibold">{f.balance > 0 ? `PKR ${f.balance.toLocaleString()}` : "—"}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${statusStyles[f.status]}`}>{f.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Card>
        <CardHeader title="Payment History" />
        {payments.length === 0 ? (
          <EmptyState label="No payments recorded yet." />
        ) : (
          <ul className="divide-y divide-border">
            {payments.map((p) => (
              <li key={p.id} className="flex items-center justify-between px-4 py-3 text-sm">
                <div>
                  <p className="font-medium">PKR {p.amount_paid.toLocaleString()} · <span className="capitalize text-muted">{p.payment_method.replace("_", " ")}</span></p>
                  <p className="text-xs text-muted">{new Date(p.payment_date).toLocaleDateString()} · Receipt {p.receipt_number}</p>
                </div>
                <Link href={`/print/receipt/${p.id}`} target="_blank" className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline">
                  <Receipt size={13} /> Receipt
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}

function SummaryStat({ label, value, tone }: { label: string; value: number; tone?: string }) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-4 shadow-sm">
      <p className="text-xs font-medium text-muted">{label}</p>
      <p className={`mt-1.5 text-lg font-semibold tracking-tight ${tone ?? ""}`}>PKR {value.toLocaleString()}</p>
    </div>
  );
}
