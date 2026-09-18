"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { Search, Receipt } from "lucide-react";
import type { FeeRecord, Student } from "@/types/database";

const PAYMENT_METHODS = [
  { value: "cash", label: "Cash" },
  { value: "bank_transfer", label: "Bank Transfer" },
  { value: "cheque", label: "Cheque" },
  { value: "easypaisa", label: "Easypaisa" },
  { value: "jazzcash", label: "JazzCash" },
  { value: "card", label: "Debit/Credit Card" },
];

export function CollectPaymentForm({
  students,
  fees,
  initialStudentId,
  action,
}: {
  students: Student[];
  fees: FeeRecord[];
  initialStudentId?: string;
  action: (formData: FormData) => Promise<{ error?: string; paymentId?: string; receiptNumber?: string }>;
}) {
  const [query, setQuery] = useState("");
  const [studentId, setStudentId] = useState(initialStudentId ?? "");
  const [amounts, setAmounts] = useState<Record<string, string>>({});
  const [method, setMethod] = useState("cash");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{ paymentId: string; receiptNumber: string } | null>(null);
  const [pending, startTransition] = useTransition();

  const matches = useMemo(() => {
    if (!query.trim() || studentId) return [];
    const q = query.toLowerCase();
    return students.filter((s) => s.full_name.toLowerCase().includes(q) || s.admission_number.toLowerCase().includes(q) || (s.roll_number ?? "").toLowerCase().includes(q)).slice(0, 8);
  }, [query, studentId, students]);

  const student = students.find((s) => s.id === studentId);
  const outstandingFees = fees.filter((f) => f.student_id === studentId && f.balance > 0);
  const total = outstandingFees.reduce((sum, f) => sum + (Number(amounts[f.id]) || 0), 0);

  if (success) {
    return (
      <div className="space-y-3 rounded-xl border border-success/30 bg-success/5 p-5 text-center">
        <p className="text-base font-semibold text-success">Payment recorded — Receipt {success.receiptNumber}</p>
        <div className="flex justify-center gap-3">
          <Link href={`/print/receipt/${success.paymentId}`} target="_blank" className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90">
            <Receipt size={15} /> View / Print Receipt
          </Link>
          <button
            onClick={() => {
              setSuccess(null);
              setStudentId("");
              setQuery("");
              setAmounts({});
            }}
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-background"
          >
            Collect Another Payment
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>}

      {!studentId && (
        <div className="relative">
          <label className="mb-1 block text-sm font-medium">Search Student</label>
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Name, admission number, or roll number…"
              className="w-full rounded-lg border border-border bg-background py-2.5 pl-9 pr-3 text-sm outline-none focus:border-primary"
            />
          </div>
          {matches.length > 0 && (
            <ul className="mt-1 divide-y divide-border rounded-lg border border-border bg-surface shadow-sm">
              {matches.map((s) => (
                <li key={s.id}>
                  <button
                    type="button"
                    onClick={() => {
                      setStudentId(s.id);
                      setQuery("");
                    }}
                    className="block w-full px-3 py-2 text-left text-sm hover:bg-background"
                  >
                    <span className="font-medium">{s.full_name}</span>{" "}
                    <span className="text-xs text-muted">#{s.admission_number}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {student && (
        <div className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border border-border bg-background px-3 py-2.5">
            <div>
              <p className="text-sm font-medium">{student.full_name}</p>
              <p className="text-xs text-muted">#{student.admission_number}</p>
            </div>
            <button type="button" onClick={() => setStudentId("")} className="text-xs font-medium text-primary hover:underline">
              Change
            </button>
          </div>

          {outstandingFees.length === 0 ? (
            <p className="rounded-lg bg-success/10 px-3 py-2 text-sm text-success">This student has no outstanding fees.</p>
          ) : (
            <div className="space-y-2">
              <p className="text-sm font-medium">Allocate payment to charges</p>
              {outstandingFees.map((f) => (
                <div key={f.id} className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2.5">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{f.title}</p>
                    <p className="text-xs text-muted">Balance: PKR {f.balance.toLocaleString()}</p>
                  </div>
                  <input
                    type="number"
                    min={0}
                    max={f.balance}
                    step="0.01"
                    value={amounts[f.id] ?? ""}
                    onChange={(e) => setAmounts((prev) => ({ ...prev, [f.id]: e.target.value }))}
                    placeholder="0"
                    className="w-28 shrink-0 rounded-lg border border-border bg-background px-2 py-1.5 text-right text-sm outline-none focus:border-primary"
                  />
                </div>
              ))}

              <div>
                <label className="mb-1 block text-sm font-medium">Payment Method</label>
                <select value={method} onChange={(e) => setMethod(e.target.value)} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary">
                  {PAYMENT_METHODS.map((m) => (
                    <option key={m.value} value={m.value}>{m.label}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-between rounded-lg bg-primary/5 px-4 py-3">
                <span className="text-sm font-medium">Total Received</span>
                <span className="text-lg font-semibold text-primary">PKR {total.toLocaleString()}</span>
              </div>

              <button
                type="button"
                disabled={pending || total <= 0}
                onClick={() => {
                  setError(null);
                  const formData = new FormData();
                  formData.set("student_id", studentId);
                  formData.set("method", method);
                  formData.set(
                    "allocations",
                    JSON.stringify(outstandingFees.map((f) => ({ feeId: f.id, amount: Number(amounts[f.id]) || 0 })))
                  );
                  startTransition(async () => {
                    const res = await action(formData);
                    if (res.error) setError(res.error);
                    else if (res.paymentId && res.receiptNumber) setSuccess({ paymentId: res.paymentId, receiptNumber: res.receiptNumber });
                  });
                }}
                className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
              >
                {pending ? "Recording…" : "Record Payment & Generate Receipt"}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
