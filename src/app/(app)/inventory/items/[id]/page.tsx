import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getSession, isSchoolStaff } from "@/lib/auth/session";
import { getInventoryItem, listInventoryTransactions } from "@/lib/data/inventory";
import { Card, CardHeader, EmptyState } from "@/components/ui/card";
import { TransactionForm } from "@/components/inventory/transaction-form";
import { createInventoryTransactionAction } from "../../actions";

const TYPE_LABELS: Record<string, string> = {
  stock_in: "Stock In", stock_out: "Stock Out", assignment: "Assignment", return: "Return",
  transfer: "Transfer", adjustment: "Adjustment", repair: "Repair", dispose: "Dispose",
};

export default async function InventoryItemDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!isSchoolStaff(session.profile.role)) redirect("/dashboard");

  const { id } = await params;
  const [item, transactions] = await Promise.all([getInventoryItem(id), listInventoryTransactions(id)]);
  if (!item) notFound();

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <Link href="/inventory/items" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-primary">
        <ArrowLeft size={15} /> Back to Items
      </Link>

      <Card className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-lg font-semibold">{item.name}</h1>
            <p className="text-sm text-muted">{item.asset_id} · {item.category ?? "Uncategorized"}</p>
          </div>
          <Link href={`/inventory/items/${id}/edit`} className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:bg-background">Edit Item</Link>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
          <div><p className="text-xs text-muted">Available / Total</p><p className="font-medium">{item.available_quantity} / {item.quantity}</p></div>
          <div><p className="text-xs text-muted">Unit Cost</p><p className="font-medium">PKR {(item.cost ?? 0).toLocaleString()}</p></div>
          <div><p className="text-xs text-muted">Total Value</p><p className="font-medium">PKR {((item.cost ?? 0) * item.quantity).toLocaleString()}</p></div>
          <div><p className="text-xs text-muted">Condition</p><p className="font-medium capitalize">{item.condition.replace("_", " ")}</p></div>
          <div><p className="text-xs text-muted">Location</p><p className="font-medium">{item.location ?? "—"}</p></div>
          <div><p className="text-xs text-muted">Supplier</p><p className="font-medium">{item.supplier ?? "—"}</p></div>
          <div><p className="text-xs text-muted">Status</p><p className="font-medium capitalize">{item.status}</p></div>
          {item.minimum_stock != null && (
            <div><p className="text-xs text-muted">Minimum Stock</p><p className={`font-medium ${item.available_quantity < item.minimum_stock ? "text-danger" : ""}`}>{item.minimum_stock}</p></div>
          )}
        </div>
        {item.description && <p className="mt-3 text-sm text-muted">{item.description}</p>}
      </Card>

      <Card>
        <CardHeader title="Record Transaction" />
        <div className="p-5">
          <TransactionForm action={createInventoryTransactionAction.bind(null, id)} />
        </div>
      </Card>

      <Card>
        <CardHeader title="Transaction History" />
        {transactions.length === 0 ? (
          <EmptyState label="No transactions recorded yet." />
        ) : (
          <ul className="divide-y divide-border">
            {transactions.map((t) => (
              <li key={t.id} className="flex items-center justify-between px-5 py-3 text-sm">
                <div>
                  <p className="font-medium">{TYPE_LABELS[t.transaction_type]} · Qty {t.quantity}</p>
                  <p className="text-xs text-muted">
                    {t.assigned_to_label && `${t.assigned_to_label} · `}
                    {t.reason && `${t.reason} · `}
                    {t.created_at ? new Date(t.created_at).toLocaleString() : ""}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
