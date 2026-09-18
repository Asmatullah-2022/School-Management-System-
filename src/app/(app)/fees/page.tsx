import Link from "next/link";
import { redirect } from "next/navigation";
import { Wallet, TrendingUp, AlertCircle, Receipt } from "lucide-react";
import { getSession, isFinanceStaff } from "@/lib/auth/session";
import { listFees, listPayments, listRefunds, listScholarships } from "@/lib/data/finance";
import { listStudents } from "@/lib/data/students";
import { listClasses } from "@/lib/data/academics";
import { getChildStudentIdsForProfile, getStudentIdForProfile } from "@/lib/data/people";
import { listNotificationsFor } from "@/lib/data/notifications";
import { StatCard } from "@/components/dashboard/stat-card";
import { Card, CardHeader, EmptyState } from "@/components/ui/card";
import { FeeCollectionChart, ClassDistributionChart } from "@/components/dashboard/charts";

export default async function FeesPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  if (!isFinanceStaff(session.profile.role)) {
    return <MyFeesView profileId={session.profile.id} role={session.profile.role} />;
  }

  const [fees, payments, refunds, scholarships, students, classes] = await Promise.all([
    listFees(),
    listPayments(),
    listRefunds(),
    listScholarships(),
    listStudents(),
    listClasses(),
  ]);

  const totalCollected = payments.reduce((s, p) => s + p.amount_paid, 0) - refunds.reduce((s, r) => s + r.amount, 0);
  const totalOutstanding = fees.reduce((s, f) => s + f.balance, 0);
  const overdueCount = fees.filter((f) => f.status === "overdue").length;
  const pendingScholarships = scholarships.filter((s) => s.status === "pending").length;

  const now = new Date();
  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    return { key: `${d.getFullYear()}-${d.getMonth() + 1}`, label: d.toLocaleString("en", { month: "short" }) };
  });
  const collectionTrend = months.map((m) => ({
    month: m.label,
    collected: payments
      .filter((p) => {
        const d = new Date(p.payment_date);
        return `${d.getFullYear()}-${d.getMonth() + 1}` === m.key;
      })
      .reduce((s, p) => s + p.amount_paid, 0),
  }));

  const outstandingByClass = classes
    .map((c) => ({
      name: c.name,
      value: fees
        .filter((f) => students.find((s) => s.id === f.student_id)?.class_id === c.id)
        .reduce((s, f) => s + f.balance, 0),
    }))
    .filter((c) => c.value > 0);

  const methodTotals = new Map<string, number>();
  for (const p of payments) methodTotals.set(p.payment_method, (methodTotals.get(p.payment_method) ?? 0) + p.amount_paid);
  const byMethod = Array.from(methodTotals.entries()).map(([name, value]) => ({ name: name.replace("_", " "), value }));

  const recentPayments = [...payments].sort((a, b) => (a.payment_date < b.payment_date ? 1 : -1)).slice(0, 6);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold">Finance Dashboard</h1>
          <p className="text-sm text-muted">Fee collection, outstanding balances, and payment activity across the school.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/fees/collect" className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90">
            <Wallet size={16} /> Collect Payment
          </Link>
          <Link href="/fees/generate" className="inline-flex items-center gap-1.5 rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-background">
            Generate Fees
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Net Collected" value={`PKR ${totalCollected.toLocaleString()}`} icon={TrendingUp} tone="success" />
        <StatCard label="Outstanding" value={`PKR ${totalOutstanding.toLocaleString()}`} icon={AlertCircle} tone="danger" />
        <StatCard label="Overdue Charges" value={overdueCount} icon={AlertCircle} tone="warning" />
        <StatCard label="Scholarships Pending" value={pendingScholarships} icon={Wallet} tone="accent" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title="Collection Trend (Last 6 Months)" />
          <div className="p-4">
            <FeeCollectionChart data={collectionTrend} />
          </div>
        </Card>
        <Card>
          <CardHeader title="Outstanding by Class" />
          <div className="p-4">
            {outstandingByClass.length === 0 ? <EmptyState label="No outstanding balances." /> : <ClassDistributionChart data={outstandingByClass} />}
          </div>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title="Payments by Method" />
          <div className="p-4">
            {byMethod.length === 0 ? <EmptyState label="No payments recorded yet." /> : <ClassDistributionChart data={byMethod} />}
          </div>
        </Card>
        <Card>
          <CardHeader title="Recent Payments" action={<Link href="/fees/payments" className="text-xs font-medium text-primary hover:underline">View all</Link>} />
          {recentPayments.length === 0 ? (
            <EmptyState label="No payments yet." />
          ) : (
            <ul className="divide-y divide-border">
              {recentPayments.map((p) => (
                <li key={p.id} className="flex items-center justify-between px-5 py-3 text-sm">
                  <div>
                    <p className="font-medium">{students.find((s) => s.id === p.student_id)?.full_name ?? "—"}</p>
                    <p className="text-xs text-muted">{p.receipt_number} · {new Date(p.payment_date).toLocaleDateString()}</p>
                  </div>
                  <span className="font-semibold text-success">PKR {p.amount_paid.toLocaleString()}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}

async function MyFeesView({ profileId, role }: { profileId: string; role: string }) {
  const studentIds = role === "student" ? [await getStudentIdForProfile(profileId)].filter(Boolean) as string[] : await getChildStudentIdsForProfile(profileId);

  if (studentIds.length === 0) {
    return (
      <div className="space-y-4">
        <h1 className="text-xl font-semibold">My Fees</h1>
        <Card><EmptyState label="No fee records linked to your account yet." /></Card>
      </div>
    );
  }

  const [fees, students, payments, notifications] = await Promise.all([
    listFees(),
    listStudents(),
    listPayments(),
    listNotificationsFor(profileId),
  ]);
  const myFees = fees.filter((f) => studentIds.includes(f.student_id));
  const myPayments = payments.filter((p) => studentIds.includes(p.student_id)).sort((a, b) => (a.payment_date < b.payment_date ? 1 : -1));
  const totalOutstanding = myFees.reduce((s, f) => s + f.balance, 0);
  const reminders = notifications.filter((n) => n.type === "fee_reminder").slice(0, 5);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold">My Fees</h1>
        <p className="text-sm text-muted">Fee charges and payment history for {role === "student" ? "your account" : "your children"}.</p>
      </div>

      <StatCard label="Total Outstanding" value={`PKR ${totalOutstanding.toLocaleString()}`} icon={AlertCircle} tone={totalOutstanding > 0 ? "danger" : "success"} />

      {reminders.length > 0 && (
        <Card>
          <CardHeader title="Fee Reminders" />
          <ul className="divide-y divide-border">
            {reminders.map((n) => (
              <li key={n.id} className="px-5 py-3 text-sm">
                <p className="font-medium">{n.title}</p>
                <p className="text-xs text-muted">{n.message}</p>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {studentIds.map((sid) => {
        const student = students.find((s) => s.id === sid);
        const childFees = myFees.filter((f) => f.student_id === sid);
        return (
          <Card key={sid}>
            <CardHeader title={student?.full_name ?? "Student"} action={<Link href={`/fees/account/${sid}`} className="text-xs font-medium text-primary hover:underline">View Full Account</Link>} />
            {childFees.length === 0 ? (
              <EmptyState label="No fee charges yet." />
            ) : (
              <ul className="divide-y divide-border">
                {childFees.map((f) => (
                  <li key={f.id} className="flex items-center justify-between px-5 py-3 text-sm">
                    <div>
                      <p className="font-medium">{f.title}</p>
                      <p className="text-xs text-muted">Due {new Date(f.due_date).toLocaleDateString()}</p>
                    </div>
                    <span className={`font-semibold ${f.balance > 0 ? "text-danger" : "text-success"}`}>
                      {f.balance > 0 ? `PKR ${f.balance.toLocaleString()} due` : "Paid"}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        );
      })}

      <Card>
        <CardHeader title="Recent Payments" />
        {myPayments.length === 0 ? (
          <EmptyState label="No payments recorded yet." />
        ) : (
          <ul className="divide-y divide-border">
            {myPayments.slice(0, 10).map((p) => (
              <li key={p.id} className="flex items-center justify-between px-5 py-3 text-sm">
                <div>
                  <p className="font-medium">PKR {p.amount_paid.toLocaleString()}</p>
                  <p className="text-xs text-muted">{p.receipt_number} · {new Date(p.payment_date).toLocaleDateString()}</p>
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
