"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { Download, BellRing } from "lucide-react";
import { DataTable, type Column } from "@/components/data-table";
import { downloadCsv } from "@/lib/csv";
import type { FeeRecord, SchoolClass, Section, Student } from "@/types/database";

const statusStyles: Record<string, string> = {
  paid: "bg-success/10 text-success",
  partial: "bg-warning/10 text-warning",
  unpaid: "bg-muted/10 text-muted",
  overdue: "bg-danger/10 text-danger",
};

export function OutstandingTable({
  fees,
  students,
  classes,
  sections,
  sendReminderAction,
}: {
  fees: FeeRecord[];
  students: Student[];
  classes: SchoolClass[];
  sections: Section[];
  sendReminderAction: (feeId: string) => Promise<{ error?: string; success?: string }>;
}) {
  const [classFilter, setClassFilter] = useState("");
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  const outstanding = useMemo(() => fees.filter((f) => f.balance > 0), [fees]);
  const filtered = useMemo(() => {
    if (!classFilter) return outstanding;
    return outstanding.filter((f) => students.find((s) => s.id === f.student_id)?.class_id === classFilter);
  }, [outstanding, classFilter, students]);

  const totalOutstanding = filtered.reduce((s, f) => s + f.balance, 0);

  const columns: Column<FeeRecord>[] = [
    {
      key: "student",
      header: "Student",
      render: (f) => {
        const s = students.find((st) => st.id === f.student_id);
        return (
          <div>
            <p className="font-medium">{s?.full_name ?? "—"}</p>
            <p className="text-xs text-muted">{s?.admission_number}</p>
          </div>
        );
      },
    },
    {
      key: "class",
      header: "Class",
      render: (f) => {
        const s = students.find((st) => st.id === f.student_id);
        return `${classes.find((c) => c.id === s?.class_id)?.name ?? "—"} ${sections.find((sec) => sec.id === s?.section_id)?.name ?? ""}`;
      },
      hideOnMobile: true,
    },
    { key: "title", header: "Fee", render: (f) => f.title },
    { key: "due", header: "Due Date", render: (f) => new Date(f.due_date).toLocaleDateString(), hideOnMobile: true },
    { key: "balance", header: "Balance", render: (f) => <span className="font-semibold text-danger">PKR {f.balance.toLocaleString()}</span> },
    {
      key: "status",
      header: "Status",
      render: (f) => <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${statusStyles[f.status]}`}>{f.status}</span>,
    },
    {
      key: "actions",
      header: "",
      render: (f) => (
        <div className="flex items-center justify-end gap-2">
          <Link href={`/fees/account/${f.student_id}`} className="text-xs font-medium text-primary hover:underline">
            Account
          </Link>
          <Link href={`/fees/collect?student=${f.student_id}`} className="text-xs font-medium text-primary hover:underline">
            Collect
          </Link>
          <button
            disabled={pending}
            onClick={() =>
              startTransition(async () => {
                const res = await sendReminderAction(f.id);
                setMessage(res.success ?? res.error ?? null);
              })
            }
            className="inline-flex items-center gap-1 text-xs font-medium text-warning hover:underline"
            aria-label="Send reminder"
          >
            <BellRing size={13} /> Remind
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      {message && <p className="border-b border-border bg-primary/5 px-4 py-2 text-sm">{message}</p>}
      <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <select
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
          >
            <option value="">All classes</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <p className="text-sm text-muted">
            Total outstanding: <span className="font-semibold text-danger">PKR {totalOutstanding.toLocaleString()}</span>
          </p>
        </div>
        <button
          onClick={() =>
            downloadCsv(
              "outstanding-fees.csv",
              ["Student", "Admission #", "Class", "Fee", "Due Date", "Balance", "Status"],
              filtered.map((f) => {
                const s = students.find((st) => st.id === f.student_id);
                return [
                  s?.full_name ?? "",
                  s?.admission_number ?? "",
                  classes.find((c) => c.id === s?.class_id)?.name ?? "",
                  f.title,
                  f.due_date,
                  f.balance,
                  f.status,
                ];
              })
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
        rowKey={(f) => f.id}
        searchKeys={(f) => `${students.find((s) => s.id === f.student_id)?.full_name ?? ""} ${f.title}`}
        emptyLabel="No outstanding fees — everyone is paid up."
      />
    </div>
  );
}
