"use client";

import { useMemo, useState } from "react";
import { Card, CardHeader, EmptyState } from "@/components/ui/card";
import { DataTable, type Column } from "@/components/data-table";
import { ExportBar } from "@/components/finance/export-bar";
import {
  buildClassWiseCollection,
  buildDailyCollectionReport,
  buildDiscountReport,
  buildFeeTypeCollection,
  buildFinancialSummary,
  buildMonthlyCollectionReport,
  buildOutstandingReport,
  buildPaymentMethodReport,
  buildRefundReport,
  buildScholarshipReport,
  buildStudentFeeReport,
  type FinanceDataset,
} from "@/lib/reports/finance-reports";
import type { Student } from "@/types/database";

const REPORTS = [
  { key: "daily", label: "Daily Collection" },
  { key: "monthly", label: "Monthly Collection" },
  { key: "student", label: "Student Fee Report" },
  { key: "outstanding", label: "Outstanding Fee Report" },
  { key: "class", label: "Class-wise Collection" },
  { key: "fee-type", label: "Fee-Type Collection" },
  { key: "method", label: "Payment Method Report" },
  { key: "discount", label: "Discount Report" },
  { key: "scholarship", label: "Scholarship Report" },
  { key: "refund", label: "Refund Report" },
  { key: "summary", label: "Financial Summary" },
] as const;

type ReportKey = (typeof REPORTS)[number]["key"];

const money = (n: number) => `PKR ${Math.round(n).toLocaleString()}`;

export function FinanceReportsCenter({ data, generatedLine }: { data: FinanceDataset; generatedLine: string }) {
  const [report, setReport] = useState<ReportKey>("daily");
  const today = new Date();
  const [date, setDate] = useState(today.toISOString().slice(0, 10));
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [year, setYear] = useState(today.getFullYear());
  const [studentQuery, setStudentQuery] = useState("");
  const [studentId, setStudentId] = useState("");

  const studentMatches = useMemo(() => {
    if (!studentQuery.trim() || studentId) return [];
    const q = studentQuery.toLowerCase();
    return data.students.filter((s) => s.full_name.toLowerCase().includes(q) || s.admission_number.toLowerCase().includes(q)).slice(0, 8);
  }, [studentQuery, studentId, data.students]);

  const printParams = (extra: Record<string, string>) => new URLSearchParams({ key: report, ...extra }).toString();

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <label className="mb-1 block text-sm font-medium">Report Type</label>
        <select
          value={report}
          onChange={(e) => setReport(e.target.value as ReportKey)}
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary sm:w-80"
        >
          {REPORTS.map((r) => (
            <option key={r.key} value={r.key}>{r.label}</option>
          ))}
        </select>
        <p className="mt-2 text-xs text-muted">{generatedLine}</p>
      </Card>

      {report === "daily" && (
        <DailyCollectionReport data={data} date={date} setDate={setDate} printParams={printParams} />
      )}
      {report === "monthly" && (
        <MonthlyCollectionReport data={data} month={month} year={year} setMonth={setMonth} setYear={setYear} printParams={printParams} />
      )}
      {report === "student" && (
        <StudentFeeReportView
          data={data}
          studentId={studentId}
          studentQuery={studentQuery}
          setStudentQuery={setStudentQuery}
          setStudentId={setStudentId}
          matches={studentMatches}
          printParams={printParams}
        />
      )}
      {report === "outstanding" && <OutstandingReportView data={data} printParams={printParams} />}
      {report === "class" && <ClassWiseReportView data={data} printParams={printParams} />}
      {report === "fee-type" && <FeeTypeReportView data={data} printParams={printParams} />}
      {report === "method" && <PaymentMethodReportView data={data} printParams={printParams} />}
      {report === "discount" && <DiscountReportView data={data} printParams={printParams} />}
      {report === "scholarship" && <ScholarshipReportView data={data} printParams={printParams} />}
      {report === "refund" && <RefundReportView data={data} printParams={printParams} />}
      {report === "summary" && <FinancialSummaryView data={data} printParams={printParams} />}
    </div>
  );
}

function DailyCollectionReport({
  data,
  date,
  setDate,
  printParams,
}: {
  data: FinanceDataset;
  date: string;
  setDate: (d: string) => void;
  printParams: (extra: Record<string, string>) => string;
}) {
  const { rows, summary } = buildDailyCollectionReport(data, date);
  const columns: Column<(typeof rows)[number]>[] = [
    { key: "receipt", header: "Receipt No.", render: (r) => r.receiptNumber },
    { key: "student", header: "Student", render: (r) => r.student },
    { key: "class", header: "Class", render: (r) => r.className, hideOnMobile: true },
    { key: "type", header: "Fee Type", render: (r) => <span className="capitalize">{r.feeType}</span>, hideOnMobile: true },
    { key: "amount", header: "Amount", render: (r) => money(r.amount) },
    { key: "method", header: "Method", render: (r) => <span className="capitalize">{r.method.replace("_", " ")}</span>, hideOnMobile: true },
    { key: "by", header: "Collected By", render: (r) => r.collectedBy, hideOnMobile: true },
  ];

  return (
    <Card>
      <CardHeader
        title="Daily Collection Report"
        action={
          <ExportBar
            filenameBase={`daily-collection-${date}`}
            sheetName="Daily Collection"
            headers={["Receipt No.", "Student", "Class", "Fee Type", "Amount", "Method", "Collected By"]}
            rows={rows.map((r) => [r.receiptNumber, r.student, r.className, r.feeType, r.amount, r.method, r.collectedBy])}
            printHref={`/print/finance-report?${printParams({ date })}`}
          />
        }
      />
      <div className="flex flex-wrap items-center gap-3 border-b border-border p-4">
        <label className="text-sm font-medium">Date</label>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
      </div>
      <div className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-4">
        <Stat label="Total Transactions" value={summary.totalTransactions} />
        <Stat label="Total Collection" value={money(summary.totalCollection)} tone="text-success" />
        <Stat label="Refunds" value={money(summary.totalRefunds)} tone="text-danger" />
        <Stat label="Net Collection" value={money(summary.netCollection)} tone="text-primary" />
      </div>
      {rows.length === 0 ? <EmptyState label="No payments collected on this date." /> : (
        <DataTable columns={columns} rows={rows} rowKey={(r) => r.receiptNumber} searchKeys={(r) => `${r.student} ${r.receiptNumber}`} emptyLabel="No results." />
      )}
    </Card>
  );
}

function MonthlyCollectionReport({
  data,
  month,
  year,
  setMonth,
  setYear,
  printParams,
}: {
  data: FinanceDataset;
  month: number;
  year: number;
  setMonth: (m: number) => void;
  setYear: (y: number) => void;
  printParams: (extra: Record<string, string>) => string;
}) {
  const { summary, trend } = buildMonthlyCollectionReport(data, month, year);
  const monthName = new Date(year, month - 1, 1).toLocaleString("en", { month: "long" });

  return (
    <Card>
      <CardHeader
        title="Monthly Collection Report"
        action={
          <ExportBar
            filenameBase={`monthly-collection-${year}-${month}`}
            sheetName="Monthly Collection"
            headers={["Metric", "Amount"]}
            rows={[
              ["Total Expected", summary.totalExpected],
              ["Total Collected", summary.totalCollected],
              ["Total Outstanding", summary.totalOutstanding],
              ["Total Discounts", summary.totalDiscounts],
              ["Total Refunds", summary.totalRefunds],
              ["Net Collection", summary.netCollection],
            ]}
            printHref={`/print/finance-report?${printParams({ month: String(month), year: String(year) })}`}
          />
        }
      />
      <div className="flex flex-wrap items-center gap-3 border-b border-border p-4">
        <select value={month} onChange={(e) => setMonth(Number(e.target.value))} className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary">
          {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
            <option key={m} value={m}>{new Date(2000, m - 1, 1).toLocaleString("en", { month: "long" })}</option>
          ))}
        </select>
        <input type="number" value={year} onChange={(e) => setYear(Number(e.target.value))} className="w-24 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
        <span className="text-sm text-muted">{monthName} {year}</span>
      </div>
      <div className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-3">
        <Stat label="Total Expected" value={money(summary.totalExpected)} />
        <Stat label="Total Collected" value={money(summary.totalCollected)} tone="text-success" />
        <Stat label="Total Outstanding" value={money(summary.totalOutstanding)} tone="text-danger" />
        <Stat label="Total Discounts" value={money(summary.totalDiscounts)} tone="text-accent" />
        <Stat label="Total Refunds" value={money(summary.totalRefunds)} tone="text-danger" />
        <Stat label="Net Collection" value={money(summary.netCollection)} tone="text-primary" />
      </div>
      <div className="border-t border-border p-4">
        <p className="mb-2 text-sm font-medium">6-Month Trend</p>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[400px] text-left text-sm">
            <thead>
              <tr className="border-b border-border text-xs uppercase text-muted"><th className="py-1.5">Month</th><th className="py-1.5">Collected</th></tr>
            </thead>
            <tbody>
              {trend.map((t) => (
                <tr key={t.label} className="border-b border-border/50"><td className="py-1.5">{t.label}</td><td className="py-1.5">{money(t.collected)}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Card>
  );
}

function StudentFeeReportView({
  data,
  studentId,
  studentQuery,
  setStudentQuery,
  setStudentId,
  matches,
  printParams,
}: {
  data: FinanceDataset;
  studentId: string;
  studentQuery: string;
  setStudentQuery: (q: string) => void;
  setStudentId: (id: string) => void;
  matches: Student[];
  printParams: (extra: Record<string, string>) => string;
}) {
  const report = studentId ? buildStudentFeeReport(data, studentId) : null;

  return (
    <Card>
      <CardHeader
        title="Student Fee Report"
        action={
          report && (
            <ExportBar
              filenameBase={`student-fee-report-${report.student?.admission_number ?? studentId}`}
              sheetName="Student Fee Report"
              headers={["Fee", "Amount", "Discount", "Scholarship", "Paid", "Balance", "Status"]}
              rows={report.rows.map((r) => [r.title, r.amount, r.discount, r.scholarshipApplied, r.paid, r.balance, r.status])}
              printHref={`/print/finance-report?${printParams({ studentId })}`}
            />
          )
        }
      />
      <div className="border-b border-border p-4">
        {!studentId ? (
          <div className="relative">
            <input
              value={studentQuery}
              onChange={(e) => setStudentQuery(e.target.value)}
              placeholder="Search student by name or admission number…"
              className="w-full max-w-md rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
            />
            {matches.length > 0 && (
              <ul className="mt-1 max-w-md divide-y divide-border rounded-lg border border-border bg-surface shadow-sm">
                {matches.map((s) => (
                  <li key={s.id}>
                    <button onClick={() => { setStudentId(s.id); setStudentQuery(""); }} className="block w-full px-3 py-2 text-left text-sm hover:bg-background">
                      {s.full_name} <span className="text-xs text-muted">#{s.admission_number}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">{report?.student?.full_name} — {report?.className}</p>
            <button onClick={() => setStudentId("")} className="text-xs font-medium text-primary hover:underline">Change</button>
          </div>
        )}
      </div>

      {!report ? (
        <EmptyState label="Search and select a student to view their fee report." />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-4">
            <Stat label="Total Charged" value={money(report.totals.totalCharged)} />
            <Stat label="Total Discount" value={money(report.totals.totalDiscount)} tone="text-accent" />
            <Stat label="Total Paid" value={money(report.totals.totalPaid)} tone="text-success" />
            <Stat label="Balance" value={money(report.totals.totalBalance)} tone={report.totals.totalBalance > 0 ? "text-danger" : "text-success"} />
          </div>
          <div className="overflow-x-auto border-t border-border">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border text-xs uppercase text-muted">
                  <th className="px-4 py-2">Fee</th><th className="px-4 py-2">Amount</th><th className="px-4 py-2">Discount</th><th className="px-4 py-2">Scholarship</th><th className="px-4 py-2">Paid</th><th className="px-4 py-2">Balance</th><th className="px-4 py-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {report.rows.map((r, i) => (
                  <tr key={i}>
                    <td className="px-4 py-2 font-medium">{r.title}</td>
                    <td className="px-4 py-2">{money(r.amount)}</td>
                    <td className="px-4 py-2 text-accent">{r.discount > 0 ? money(r.discount) : "—"}</td>
                    <td className="px-4 py-2 text-primary">{r.scholarshipApplied > 0 ? money(r.scholarshipApplied) : "—"}</td>
                    <td className="px-4 py-2 text-success">{money(r.paid)}</td>
                    <td className="px-4 py-2 font-semibold">{r.balance > 0 ? money(r.balance) : "—"}</td>
                    <td className="px-4 py-2 capitalize">{r.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="border-t border-border p-4">
            <p className="mb-2 text-sm font-medium">Payment History</p>
            {report.payments.length === 0 ? <p className="text-sm text-muted">No payments yet.</p> : (
              <ul className="divide-y divide-border">
                {report.payments.map((p) => (
                  <li key={p.id} className="flex items-center justify-between py-2 text-sm">
                    <span>{p.receipt_number} · {new Date(p.payment_date).toLocaleDateString()}</span>
                    <span className="font-medium">{money(p.amount_paid)}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </Card>
  );
}

function OutstandingReportView({ data, printParams }: { data: FinanceDataset; printParams: (extra: Record<string, string>) => string }) {
  const rows = buildOutstandingReport(data);
  const columns: Column<(typeof rows)[number]>[] = [
    { key: "student", header: "Student", render: (r) => r.student },
    { key: "class", header: "Class", render: (r) => `${r.className} ${r.sectionName}`, hideOnMobile: true },
    { key: "due", header: "Total Due", render: (r) => money(r.totalDue), sortValue: (r) => r.totalDue },
    { key: "paid", header: "Paid", render: (r) => money(r.paid), hideOnMobile: true, sortValue: (r) => r.paid },
    { key: "balance", header: "Balance", render: (r) => <span className="font-semibold text-danger">{money(r.balance)}</span>, sortValue: (r) => r.balance },
    { key: "overdue", header: "Days Overdue", render: (r) => r.daysOverdue, hideOnMobile: true, sortValue: (r) => r.daysOverdue },
    { key: "status", header: "Status", render: (r) => <span className="capitalize">{r.status}</span> },
  ];

  return (
    <Card>
      <CardHeader
        title="Outstanding Fee Report"
        action={
          <ExportBar
            filenameBase="outstanding-fee-report"
            sheetName="Outstanding"
            headers={["Student", "Class", "Section", "Total Due", "Paid", "Balance", "Due Date", "Days Overdue", "Status"]}
            rows={rows.map((r) => [r.student, r.className, r.sectionName, r.totalDue, r.paid, r.balance, r.earliestDueDate, r.daysOverdue, r.status])}
            printHref={`/print/finance-report?${printParams({})}`}
          />
        }
      />
      <p className="px-4 pt-3 text-xs text-muted">Click a column header to sort. Sorted by balance (highest first) by default.</p>
      {rows.length === 0 ? <EmptyState label="No outstanding balances." /> : (
        <DataTable columns={columns} rows={rows} rowKey={(r) => r.studentId} searchKeys={(r) => `${r.student} ${r.className}`} emptyLabel="No results." />
      )}
    </Card>
  );
}

function ClassWiseReportView({ data, printParams }: { data: FinanceDataset; printParams: (extra: Record<string, string>) => string }) {
  const rows = buildClassWiseCollection(data);
  return (
    <Card>
      <CardHeader
        title="Class-wise Collection"
        action={
          <ExportBar
            filenameBase="class-wise-collection"
            sheetName="Class-wise Collection"
            headers={["Class", "Expected", "Collected", "Outstanding"]}
            rows={rows.map((r) => [r.className, r.expected, r.collected, r.outstanding])}
            printHref={`/print/finance-report?${printParams({})}`}
          />
        }
      />
      <ul className="divide-y divide-border">
        {rows.map((r) => (
          <li key={r.className} className="grid grid-cols-2 gap-2 px-5 py-3 text-sm sm:grid-cols-4 sm:items-center">
            <span className="font-medium sm:col-span-1">{r.className}</span>
            <span>Expected: <b>{money(r.expected)}</b></span>
            <span className="text-success">Collected: <b>{money(r.collected)}</b></span>
            <span className="text-danger">Outstanding: <b>{money(r.outstanding)}</b></span>
          </li>
        ))}
      </ul>
    </Card>
  );
}

function FeeTypeReportView({ data, printParams }: { data: FinanceDataset; printParams: (extra: Record<string, string>) => string }) {
  const rows = buildFeeTypeCollection(data);
  return (
    <Card>
      <CardHeader
        title="Fee-Type Collection"
        action={
          <ExportBar
            filenameBase="fee-type-collection"
            sheetName="Fee-Type Collection"
            headers={["Fee Type", "Expected", "Collected", "Outstanding"]}
            rows={rows.map((r) => [r.feeType, r.expected, r.collected, r.outstanding])}
            printHref={`/print/finance-report?${printParams({})}`}
          />
        }
      />
      <ul className="divide-y divide-border">
        {rows.map((r) => (
          <li key={r.feeType} className="grid grid-cols-2 gap-2 px-5 py-3 text-sm sm:grid-cols-4 sm:items-center">
            <span className="font-medium capitalize sm:col-span-1">{r.feeType}</span>
            <span>Expected: <b>{money(r.expected)}</b></span>
            <span className="text-success">Collected: <b>{money(r.collected)}</b></span>
            <span className="text-danger">Outstanding: <b>{money(r.outstanding)}</b></span>
          </li>
        ))}
      </ul>
    </Card>
  );
}

function PaymentMethodReportView({ data, printParams }: { data: FinanceDataset; printParams: (extra: Record<string, string>) => string }) {
  const rows = buildPaymentMethodReport(data);
  return (
    <Card>
      <CardHeader
        title="Payment Method Report"
        action={
          <ExportBar
            filenameBase="payment-method-report"
            sheetName="Payment Methods"
            headers={["Method", "Transaction Count", "Total Amount"]}
            rows={rows.map((r) => [r.method, r.transactionCount, r.totalAmount])}
            printHref={`/print/finance-report?${printParams({})}`}
          />
        }
      />
      {rows.length === 0 ? <EmptyState label="No payments recorded yet." /> : (
        <ul className="divide-y divide-border">
          {rows.map((r) => (
            <li key={r.method} className="flex items-center justify-between px-5 py-3 text-sm capitalize">
              <span>{r.method.replace("_", " ")}</span>
              <span className="text-muted">{r.transactionCount} transaction(s)</span>
              <span className="font-semibold">{money(r.totalAmount)}</span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

function DiscountReportView({ data, printParams }: { data: FinanceDataset; printParams: (extra: Record<string, string>) => string }) {
  const rows = buildDiscountReport(data);
  const total = rows.reduce((s, r) => s + r.discountAmount, 0);
  const columns: Column<(typeof rows)[number]>[] = [
    { key: "student", header: "Student", render: (r) => r.student },
    { key: "class", header: "Class", render: (r) => r.className, hideOnMobile: true },
    { key: "original", header: "Original", render: (r) => money(r.originalAmount) },
    { key: "discount", header: "Discount", render: (r) => money(r.discountAmount) },
    { key: "net", header: "Net", render: (r) => money(r.netAmount), hideOnMobile: true },
    { key: "type", header: "Type", render: (r) => r.discountType, hideOnMobile: true },
    { key: "by", header: "Added By", render: (r) => r.addedBy, hideOnMobile: true },
  ];

  return (
    <Card>
      <CardHeader
        title="Discount Report"
        action={
          <ExportBar
            filenameBase="discount-report"
            sheetName="Discounts"
            headers={["Student", "Class", "Original Amount", "Discount", "Net Amount", "Discount Type", "Added By", "Date"]}
            rows={rows.map((r) => [r.student, r.className, r.originalAmount, r.discountAmount, r.netAmount, r.discountType, r.addedBy, r.date])}
            printHref={`/print/finance-report?${printParams({})}`}
          />
        }
      />
      <p className="px-4 pt-3 text-sm">Total discount given: <span className="font-semibold text-accent">{money(total)}</span></p>
      {rows.length === 0 ? <EmptyState label="No discounts have been applied yet." /> : (
        <DataTable columns={columns} rows={rows} rowKey={(r) => `${r.student}-${r.date}-${r.discountAmount}`} searchKeys={(r) => `${r.student} ${r.className}`} emptyLabel="No results." />
      )}
    </Card>
  );
}

function ScholarshipReportView({ data, printParams }: { data: FinanceDataset; printParams: (extra: Record<string, string>) => string }) {
  const rows = buildScholarshipReport(data);
  const totalApproved = data.feeDiscounts.filter((fd) => fd.scholarship_id).reduce((s, fd) => s + fd.applied_amount, 0);
  const columns: Column<(typeof rows)[number]>[] = [
    { key: "student", header: "Student", render: (r) => r.student },
    { key: "class", header: "Class", render: (r) => r.className, hideOnMobile: true },
    { key: "type", header: "Type", render: (r) => r.scholarshipType },
    { key: "amount", header: "Amount / %", render: (r) => r.amountOrPercent },
    { key: "reason", header: "Reason", render: (r) => r.reason, hideOnMobile: true },
    { key: "by", header: "Approved By", render: (r) => r.approvedBy, hideOnMobile: true },
    { key: "status", header: "Status", render: (r) => <span className="capitalize">{r.status}</span> },
  ];

  return (
    <Card>
      <CardHeader
        title="Scholarship Report"
        action={
          <ExportBar
            filenameBase="scholarship-report"
            sheetName="Scholarships"
            headers={["Student", "Class", "Type", "Amount/%", "Reason", "Proposed Date", "Approved Date", "Approved By", "Status"]}
            rows={rows.map((r) => [r.student, r.className, r.scholarshipType, r.amountOrPercent, r.reason, r.proposedDate, r.approvedDate, r.approvedBy, r.status])}
            printHref={`/print/finance-report?${printParams({})}`}
          />
        }
      />
      <p className="px-4 pt-3 text-sm">Total scholarship value applied to charges: <span className="font-semibold text-primary">{money(totalApproved)}</span></p>
      {rows.length === 0 ? <EmptyState label="No scholarships proposed yet." /> : (
        <DataTable columns={columns} rows={rows} rowKey={(r) => `${r.student}-${r.scholarshipType}-${r.proposedDate}`} searchKeys={(r) => `${r.student} ${r.className}`} emptyLabel="No results." />
      )}
    </Card>
  );
}

function RefundReportView({ data, printParams }: { data: FinanceDataset; printParams: (extra: Record<string, string>) => string }) {
  const rows = buildRefundReport(data);
  const total = rows.reduce((s, r) => s + r.refundAmount, 0);
  const columns: Column<(typeof rows)[number]>[] = [
    { key: "receipt", header: "Receipt", render: (r) => r.receiptNumber },
    { key: "student", header: "Student", render: (r) => r.student },
    { key: "original", header: "Original Payment", render: (r) => money(r.originalPayment), hideOnMobile: true },
    { key: "refund", header: "Refund Amount", render: (r) => money(r.refundAmount) },
    { key: "reason", header: "Reason", render: (r) => r.reason, hideOnMobile: true },
    { key: "by", header: "Approved By", render: (r) => r.approvedBy, hideOnMobile: true },
    { key: "date", header: "Date", render: (r) => (r.date ? new Date(r.date).toLocaleDateString() : "—") },
  ];

  return (
    <Card>
      <CardHeader
        title="Refund Report"
        action={
          <ExportBar
            filenameBase="refund-report"
            sheetName="Refunds"
            headers={["Refund ID", "Receipt", "Student", "Original Payment", "Refund Amount", "Reason", "Approved By", "Date", "Status"]}
            rows={rows.map((r) => [r.refundId, r.receiptNumber, r.student, r.originalPayment, r.refundAmount, r.reason, r.approvedBy, r.date, r.status])}
            printHref={`/print/finance-report?${printParams({})}`}
          />
        }
      />
      <p className="px-4 pt-3 text-sm">Total refunded: <span className="font-semibold text-danger">{money(total)}</span></p>
      {rows.length === 0 ? <EmptyState label="No refunds have been issued." /> : (
        <DataTable columns={columns} rows={rows} rowKey={(r) => r.refundId} searchKeys={(r) => `${r.student} ${r.receiptNumber}`} emptyLabel="No results." />
      )}
    </Card>
  );
}

function FinancialSummaryView({ data, printParams }: { data: FinanceDataset; printParams: (extra: Record<string, string>) => string }) {
  const s = buildFinancialSummary(data);
  return (
    <Card>
      <CardHeader
        title="Financial Summary"
        action={
          <ExportBar
            filenameBase="financial-summary"
            sheetName="Financial Summary"
            headers={["Metric", "Value"]}
            rows={[
              ["Total Expected", s.totalExpected],
              ["Total Collected", s.totalCollected],
              ["Total Outstanding", s.totalOutstanding],
              ["Total Discounts", s.totalDiscounts],
              ["Total Scholarships", s.totalScholarships],
              ["Total Refunds", s.totalRefunds],
              ["Net Collection", s.netCollection],
              ["Collection Rate (%)", s.collectionRate.toFixed(1)],
              ["Outstanding Rate (%)", s.outstandingRate.toFixed(1)],
              ["Payment Count", s.paymentCount],
            ]}
            printHref={`/print/finance-report?${printParams({})}`}
          />
        }
      />
      <div className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-3">
        <Stat label="Total Expected" value={money(s.totalExpected)} />
        <Stat label="Total Collected" value={money(s.totalCollected)} tone="text-success" />
        <Stat label="Total Outstanding" value={money(s.totalOutstanding)} tone="text-danger" />
        <Stat label="Total Discounts" value={money(s.totalDiscounts)} tone="text-accent" />
        <Stat label="Total Scholarships" value={money(s.totalScholarships)} tone="text-accent" />
        <Stat label="Total Refunds" value={money(s.totalRefunds)} tone="text-danger" />
        <Stat label="Net Collection" value={money(s.netCollection)} tone="text-primary" />
        <Stat label="Collection Rate" value={`${s.collectionRate.toFixed(1)}%`} />
        <Stat label="Outstanding Rate" value={`${s.outstandingRate.toFixed(1)}%`} />
        <Stat label="Payment Count" value={s.paymentCount} />
      </div>
    </Card>
  );
}

function Stat({ label, value, tone }: { label: string; value: string | number; tone?: string }) {
  return (
    <div className="rounded-xl border border-border bg-background p-3">
      <p className="text-xs text-muted">{label}</p>
      <p className={`mt-1 text-base font-semibold ${tone ?? ""}`}>{value}</p>
    </div>
  );
}
