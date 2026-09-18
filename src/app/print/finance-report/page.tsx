import { redirect } from "next/navigation";
import { getSession, isFinanceStaff } from "@/lib/auth/session";
import { listFees, listPayments, listRefunds, listDiscounts, listScholarships, listFeeDiscounts, listFeeStructures, listFeePeriods } from "@/lib/data/finance";
import { listStudents } from "@/lib/data/students";
import { listClasses, listSections } from "@/lib/data/academics";
import { listProfiles } from "@/lib/data/profiles";
import { PrintButton } from "@/components/timetable/print-button";
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

const TITLES: Record<string, string> = {
  daily: "Daily Collection Report",
  monthly: "Monthly Collection Report",
  student: "Student Fee Report",
  outstanding: "Outstanding Fee Report",
  class: "Class-wise Collection",
  "fee-type": "Fee-Type Collection",
  method: "Payment Method Report",
  discount: "Discount Report",
  scholarship: "Scholarship Report",
  refund: "Refund Report",
  summary: "Financial Summary",
};

const money = (n: number) => `PKR ${Math.round(n).toLocaleString()}`;

function Table({ headers, rows }: { headers: string[]; rows: (string | number)[][] }) {
  return (
    <table className="w-full border-collapse text-sm">
      <thead>
        <tr>{headers.map((h) => <th key={h} className="border border-border px-2 py-1.5 text-left">{h}</th>)}</tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={i}>{r.map((c, j) => <td key={j} className="border border-border px-2 py-1.5">{c}</td>)}</tr>
        ))}
      </tbody>
    </table>
  );
}

export default async function PrintFinanceReportPage({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!isFinanceStaff(session.profile.role)) redirect("/fees");

  const params = await searchParams;
  const key = params.key ?? "summary";

  const [fees, payments, refunds, discounts, scholarships, feeDiscounts, feeStructures, feePeriods, students, classes, sections, profiles] =
    await Promise.all([
      listFees(),
      listPayments(),
      listRefunds(),
      listDiscounts(),
      listScholarships(),
      listFeeDiscounts(),
      listFeeStructures(),
      listFeePeriods(),
      listStudents(),
      listClasses(),
      listSections(),
      listProfiles(),
    ]);

  const data: FinanceDataset = { fees, payments, refunds, discounts, scholarships, feeDiscounts, feeStructures, feePeriods, students, classes, sections, profiles };

  let body: React.ReactNode = null;

  if (key === "daily") {
    const date = params.date ?? new Date().toISOString().slice(0, 10);
    const { rows, summary } = buildDailyCollectionReport(data, date);
    body = (
      <>
        <p className="mb-2 text-sm">Date: {new Date(date).toLocaleDateString()}</p>
        <Table headers={["Receipt No.", "Student", "Class", "Fee Type", "Amount", "Method", "Collected By"]} rows={rows.map((r) => [r.receiptNumber, r.student, r.className, r.feeType, money(r.amount), r.method, r.collectedBy])} />
        <p className="mt-3 text-sm">
          Total Transactions: {summary.totalTransactions} · Total Collection: {money(summary.totalCollection)} · Refunds: {money(summary.totalRefunds)} · Net: {money(summary.netCollection)}
        </p>
      </>
    );
  } else if (key === "monthly") {
    const month = Number(params.month ?? new Date().getMonth() + 1);
    const year = Number(params.year ?? new Date().getFullYear());
    const { summary, trend } = buildMonthlyCollectionReport(data, month, year);
    body = (
      <>
        <p className="mb-2 text-sm">Period: {new Date(year, month - 1, 1).toLocaleString("en", { month: "long", year: "numeric" })}</p>
        <Table
          headers={["Metric", "Amount"]}
          rows={[
            ["Total Expected", money(summary.totalExpected)],
            ["Total Collected", money(summary.totalCollected)],
            ["Total Outstanding", money(summary.totalOutstanding)],
            ["Total Discounts", money(summary.totalDiscounts)],
            ["Total Refunds", money(summary.totalRefunds)],
            ["Net Collection", money(summary.netCollection)],
          ]}
        />
        <p className="mb-1 mt-4 text-sm font-medium">6-Month Trend</p>
        <Table headers={["Month", "Collected"]} rows={trend.map((t) => [t.label, money(t.collected)])} />
      </>
    );
  } else if (key === "student") {
    const studentId = params.studentId ?? "";
    const report = buildStudentFeeReport(data, studentId);
    body = (
      <>
        <p className="mb-2 text-sm">Student: {report.student?.full_name ?? "—"} ({report.student?.admission_number}) · {report.className}</p>
        <Table headers={["Fee", "Amount", "Discount", "Scholarship", "Paid", "Balance", "Status"]} rows={report.rows.map((r) => [r.title, money(r.amount), money(r.discount), money(r.scholarshipApplied), money(r.paid), money(r.balance), r.status])} />
        <p className="mt-3 text-sm">
          Total Charged: {money(report.totals.totalCharged)} · Total Discount: {money(report.totals.totalDiscount)} · Total Paid: {money(report.totals.totalPaid)} · Balance: {money(report.totals.totalBalance)}
        </p>
      </>
    );
  } else if (key === "outstanding") {
    const rows = buildOutstandingReport(data);
    body = <Table headers={["Student", "Class", "Section", "Total Due", "Paid", "Balance", "Due Date", "Days Overdue", "Status"]} rows={rows.map((r) => [r.student, r.className, r.sectionName, money(r.totalDue), money(r.paid), money(r.balance), new Date(r.earliestDueDate).toLocaleDateString(), r.daysOverdue, r.status])} />;
  } else if (key === "class") {
    const rows = buildClassWiseCollection(data);
    body = <Table headers={["Class", "Expected", "Collected", "Outstanding"]} rows={rows.map((r) => [r.className, money(r.expected), money(r.collected), money(r.outstanding)])} />;
  } else if (key === "fee-type") {
    const rows = buildFeeTypeCollection(data);
    body = <Table headers={["Fee Type", "Expected", "Collected", "Outstanding"]} rows={rows.map((r) => [r.feeType, money(r.expected), money(r.collected), money(r.outstanding)])} />;
  } else if (key === "method") {
    const rows = buildPaymentMethodReport(data);
    body = <Table headers={["Method", "Transaction Count", "Total Amount"]} rows={rows.map((r) => [r.method, r.transactionCount, money(r.totalAmount)])} />;
  } else if (key === "discount") {
    const rows = buildDiscountReport(data);
    body = <Table headers={["Student", "Class", "Original", "Discount", "Net", "Type", "Added By", "Date"]} rows={rows.map((r) => [r.student, r.className, money(r.originalAmount), money(r.discountAmount), money(r.netAmount), r.discountType, r.addedBy, r.date ? new Date(r.date).toLocaleDateString() : ""])} />;
  } else if (key === "scholarship") {
    const rows = buildScholarshipReport(data);
    body = <Table headers={["Student", "Class", "Type", "Amount/%", "Reason", "Approved By", "Status"]} rows={rows.map((r) => [r.student, r.className, r.scholarshipType, r.amountOrPercent, r.reason, r.approvedBy, r.status])} />;
  } else if (key === "refund") {
    const rows = buildRefundReport(data);
    body = <Table headers={["Receipt", "Student", "Original Payment", "Refund Amount", "Reason", "Approved By", "Date", "Status"]} rows={rows.map((r) => [r.receiptNumber, r.student, money(r.originalPayment), money(r.refundAmount), r.reason, r.approvedBy, r.date ? new Date(r.date).toLocaleDateString() : "", r.status])} />;
  } else {
    const s = buildFinancialSummary(data);
    body = (
      <Table
        headers={["Metric", "Value"]}
        rows={[
          ["Total Expected", money(s.totalExpected)],
          ["Total Collected", money(s.totalCollected)],
          ["Total Outstanding", money(s.totalOutstanding)],
          ["Total Discounts", money(s.totalDiscounts)],
          ["Total Scholarships", money(s.totalScholarships)],
          ["Total Refunds", money(s.totalRefunds)],
          ["Net Collection", money(s.netCollection)],
          ["Collection Rate", `${s.collectionRate.toFixed(1)}%`],
          ["Outstanding Rate", `${s.outstandingRate.toFixed(1)}%`],
          ["Payment Count", s.paymentCount],
        ]}
      />
    );
  }

  return (
    <div className="mx-auto max-w-4xl p-6 print:p-0">
      <div className="mb-4 flex items-center justify-between print:hidden">
        <p className="text-sm text-muted">Print preview</p>
        <PrintButton />
      </div>
      <header className="mb-6 border-b-2 border-border pb-4 text-center">
        <h1 className="text-lg font-bold uppercase tracking-wide">{session.school.name}</h1>
        {session.school.address && <p className="text-sm text-muted">{session.school.address}</p>}
        <p className="mt-2 text-base font-semibold">{TITLES[key] ?? "Finance Report"}</p>
      </header>
      {body}
      <p className="mt-10 text-center text-xs text-muted">
        Generated by {session.profile.full_name} on {new Date().toLocaleString()} — {session.school.name}
      </p>
    </div>
  );
}
