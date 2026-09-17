import { listFees } from "@/lib/data/records";
import { listStudents } from "@/lib/data/students";
import { StatCard } from "@/components/dashboard/stat-card";
import { Card } from "@/components/ui/card";
import { FeesTable } from "@/components/fees/fees-table";
import { Wallet, TrendingUp, AlertCircle, CheckCircle2 } from "lucide-react";

export default async function FeesPage() {
  const [fees, students] = await Promise.all([listFees(), listStudents()]);

  const totalCollected = fees.filter((f) => f.status === "paid").reduce((s, f) => s + (f.amount - f.discount), 0);
  const outstanding = fees.filter((f) => f.status !== "paid").reduce((s, f) => s + (f.amount - f.discount), 0);
  const paidCount = fees.filter((f) => f.status === "paid").length;
  const unpaidCount = fees.filter((f) => f.status !== "paid").length;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold">Fees & Finance</h1>
        <p className="text-sm text-muted">Track collections, dues, and payment status across the school.</p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Total Collected" value={`PKR ${totalCollected.toLocaleString()}`} icon={TrendingUp} tone="success" />
        <StatCard label="Outstanding" value={`PKR ${outstanding.toLocaleString()}`} icon={AlertCircle} tone="danger" />
        <StatCard label="Paid Students" value={paidCount} icon={CheckCircle2} tone="primary" />
        <StatCard label="Unpaid Students" value={unpaidCount} icon={Wallet} tone="warning" />
      </div>

      <Card>
        <FeesTable fees={fees} students={students} />
      </Card>
    </div>
  );
}
