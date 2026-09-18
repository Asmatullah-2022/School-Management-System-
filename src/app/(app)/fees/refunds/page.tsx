import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus } from "lucide-react";
import { getSession, isFinanceStaff } from "@/lib/auth/session";
import { listRefunds, listFees } from "@/lib/data/finance";
import { listStudents } from "@/lib/data/students";
import { Card, EmptyState } from "@/components/ui/card";

export default async function RefundsPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!isFinanceStaff(session.profile.role)) redirect("/fees");

  const [refunds, students, fees] = await Promise.all([listRefunds(), listStudents(), listFees()]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold">Refunds</h1>
          <p className="text-sm text-muted">Controlled, capped, and permanently audit-logged reversals of a payment.</p>
        </div>
        <Link href="/fees/refunds/new" className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90">
          <Plus size={16} /> New Refund
        </Link>
      </div>

      <Card>
        {refunds.length === 0 ? (
          <EmptyState label="No refunds have been issued." />
        ) : (
          <ul className="divide-y divide-border">
            {refunds.map((r) => (
              <li key={r.id} className="px-5 py-3 text-sm">
                <div className="flex items-center justify-between">
                  <p className="font-medium">
                    {students.find((s) => s.id === r.student_id)?.full_name ?? "—"} — PKR {r.amount.toLocaleString()}
                  </p>
                  <span className="text-xs text-muted">{r.created_at ? new Date(r.created_at).toLocaleString() : ""}</span>
                </div>
                <p className="text-xs text-muted">Against: {fees.find((f) => f.id === r.fee_id)?.title ?? "—"}</p>
                <p className="text-xs text-muted">Reason: {r.reason}</p>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
