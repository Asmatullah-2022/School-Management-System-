"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Download, Receipt, Undo2 } from "lucide-react";
import { DataTable, type Column } from "@/components/data-table";
import { downloadCsv } from "@/lib/csv";
import type { Payment, Student } from "@/types/database";

export function PaymentHistoryTable({ payments, students }: { payments: Payment[]; students: Student[] }) {
  const [methodFilter, setMethodFilter] = useState("");

  const filtered = useMemo(() => (methodFilter ? payments.filter((p) => p.payment_method === methodFilter) : payments), [payments, methodFilter]);
  const methods = useMemo(() => Array.from(new Set(payments.map((p) => p.payment_method))), [payments]);

  const columns: Column<Payment>[] = [
    { key: "receipt", header: "Receipt #", render: (p) => <span className="font-medium">{p.receipt_number}</span> },
    {
      key: "student",
      header: "Student",
      render: (p) => students.find((s) => s.id === p.student_id)?.full_name ?? "—",
    },
    { key: "date", header: "Date", render: (p) => new Date(p.payment_date).toLocaleDateString(), hideOnMobile: true },
    { key: "method", header: "Method", render: (p) => <span className="capitalize">{p.payment_method.replace("_", " ")}</span>, hideOnMobile: true },
    { key: "amount", header: "Amount", render: (p) => `PKR ${p.amount_paid.toLocaleString()}` },
    {
      key: "actions",
      header: "",
      render: (p) => (
        <div className="flex items-center justify-end gap-3">
          <Link href={`/print/receipt/${p.id}`} target="_blank" className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline">
            <Receipt size={13} /> Receipt
          </Link>
          <Link href={`/fees/refunds/new?paymentId=${p.id}`} className="inline-flex items-center gap-1 text-xs font-medium text-danger hover:underline">
            <Undo2 size={13} /> Refund
          </Link>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between">
        <select value={methodFilter} onChange={(e) => setMethodFilter(e.target.value)} className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary">
          <option value="">All payment methods</option>
          {methods.map((m) => (
            <option key={m} value={m} className="capitalize">{m.replace("_", " ")}</option>
          ))}
        </select>
        <button
          onClick={() =>
            downloadCsv(
              "payment-history.csv",
              ["Receipt #", "Student", "Date", "Method", "Amount"],
              filtered.map((p) => [
                p.receipt_number,
                students.find((s) => s.id === p.student_id)?.full_name ?? "",
                p.payment_date,
                p.payment_method,
                p.amount_paid,
              ])
            )
          }
          className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm font-medium hover:bg-background"
        >
          <Download size={15} /> Export CSV
        </button>
      </div>
      <DataTable
        columns={columns}
        rows={filtered}
        rowKey={(p) => p.id}
        searchKeys={(p) => `${students.find((s) => s.id === p.student_id)?.full_name ?? ""} ${p.receipt_number}`}
        emptyLabel="No payments recorded yet."
      />
    </div>
  );
}
