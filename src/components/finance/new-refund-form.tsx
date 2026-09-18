"use client";

import { useMemo, useState, useTransition } from "react";
import type { FeeRecord, Payment, PaymentAllocation, Refund, Student } from "@/types/database";

export function NewRefundForm({
  payments,
  allocations,
  refunds,
  fees,
  students,
  initialPaymentId,
  action,
}: {
  payments: Payment[];
  allocations: PaymentAllocation[];
  refunds: Refund[];
  fees: FeeRecord[];
  students: Student[];
  initialPaymentId?: string;
  action: (formData: FormData) => Promise<{ error?: string } | void>;
}) {
  const [query, setQuery] = useState("");
  const [paymentId, setPaymentId] = useState(initialPaymentId ?? "");
  const [feeId, setFeeId] = useState("");
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const matches = useMemo(() => {
    if (!query.trim() || paymentId) return [];
    const q = query.toLowerCase();
    return payments
      .filter((p) => p.receipt_number.toLowerCase().includes(q) || (students.find((s) => s.id === p.student_id)?.full_name ?? "").toLowerCase().includes(q))
      .slice(0, 8);
  }, [query, paymentId, payments, students]);

  const payment = payments.find((p) => p.id === paymentId);
  const paymentAllocations = allocations.filter((a) => a.payment_id === paymentId);

  const eligibleFor = (fId: string) => {
    const allocated = paymentAllocations.filter((a) => a.fee_id === fId).reduce((s, a) => s + a.amount, 0);
    const alreadyRefunded = refunds.filter((r) => r.payment_id === paymentId && r.fee_id === fId).reduce((s, r) => s + r.amount, 0);
    return allocated - alreadyRefunded;
  };

  const eligible = feeId ? eligibleFor(feeId) : 0;

  return (
    <div className="space-y-4">
      {error && <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>}

      {!paymentId && (
        <div>
          <label className="mb-1 block text-sm font-medium">Search Payment</label>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Receipt number or student name…"
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
          />
          {matches.length > 0 && (
            <ul className="mt-1 divide-y divide-border rounded-lg border border-border bg-surface shadow-sm">
              {matches.map((p) => (
                <li key={p.id}>
                  <button
                    type="button"
                    onClick={() => {
                      setPaymentId(p.id);
                      setQuery("");
                    }}
                    className="block w-full px-3 py-2 text-left text-sm hover:bg-background"
                  >
                    <span className="font-medium">{p.receipt_number}</span> — {students.find((s) => s.id === p.student_id)?.full_name} — PKR {p.amount_paid.toLocaleString()}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {payment && (
        <div className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border border-border bg-background px-3 py-2.5">
            <div>
              <p className="text-sm font-medium">Receipt {payment.receipt_number}</p>
              <p className="text-xs text-muted">{students.find((s) => s.id === payment.student_id)?.full_name} · PKR {payment.amount_paid.toLocaleString()} paid</p>
            </div>
            <button type="button" onClick={() => setPaymentId("")} className="text-xs font-medium text-primary hover:underline">
              Change
            </button>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Refund against charge</label>
            <select value={feeId} onChange={(e) => setFeeId(e.target.value)} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary">
              <option value="">Select charge</option>
              {paymentAllocations.map((a) => (
                <option key={a.fee_id} value={a.fee_id} disabled={eligibleFor(a.fee_id) <= 0}>
                  {fees.find((f) => f.id === a.fee_id)?.title ?? "Fee"} — eligible PKR {eligibleFor(a.fee_id).toLocaleString()}
                </option>
              ))}
            </select>
          </div>

          {feeId && (
            <>
              <div>
                <label className="mb-1 block text-sm font-medium">Refund Amount (max PKR {eligible.toLocaleString()})</label>
                <input
                  type="number"
                  min={0.01}
                  max={eligible}
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Reason (required)</label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={3}
                  placeholder="Why is this refund being issued?"
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                />
              </div>
              <button
                type="button"
                disabled={pending}
                onClick={() => {
                  setError(null);
                  const num = Number(amount);
                  if (!num || num <= 0) return setError("Enter a valid refund amount.");
                  if (num > eligible) return setError(`Refund amount exceeds the eligible paid amount (PKR ${eligible.toLocaleString()}).`);
                  if (!reason.trim()) return setError("A reason is required to issue a refund.");
                  const formData = new FormData();
                  formData.set("payment_id", paymentId);
                  formData.set("fee_id", feeId);
                  formData.set("student_id", payment.student_id);
                  formData.set("amount", String(num));
                  formData.set("reason", reason);
                  startTransition(async () => {
                    const res = await action(formData);
                    if (res?.error) setError(res.error);
                  });
                }}
                className="w-full rounded-lg bg-danger px-4 py-2.5 text-sm font-medium text-white hover:opacity-90 disabled:opacity-60"
              >
                {pending ? "Processing…" : "Issue Refund"}
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
