// Pure, side-effect-free report builders shared by the on-screen Finance
// Reports Center, its CSV/Excel export, and the /print/finance-report
// route — one calculation per report, used everywhere that report appears,
// so what a user sees, exports, and prints can never disagree.
import type {
  Discount,
  FeeDiscount,
  FeePeriod,
  FeeRecord,
  FeeStructure,
  Payment,
  Profile,
  Refund,
  Scholarship,
  SchoolClass,
  Section,
  Student,
} from "@/types/database";

export interface FinanceDataset {
  fees: FeeRecord[];
  payments: Payment[];
  refunds: Refund[];
  discounts: Discount[];
  scholarships: Scholarship[];
  feeDiscounts: FeeDiscount[];
  feeStructures: FeeStructure[];
  feePeriods: FeePeriod[];
  students: Student[];
  classes: SchoolClass[];
  sections: Section[];
  profiles: Profile[];
}

const nameOf = (id: string | null | undefined, list: { id: string; full_name: string }[]) =>
  list.find((x) => x.id === id)?.full_name ?? "—";

const classNameOf = (student: Student | undefined, classes: SchoolClass[]) =>
  classes.find((c) => c.id === student?.class_id)?.name ?? "—";

const sectionNameOf = (student: Student | undefined, sections: Section[]) =>
  sections.find((s) => s.id === student?.section_id)?.name ?? "—";

function feeTypeOf(fee: FeeRecord, structures: FeeStructure[]): string {
  return structures.find((s) => s.id === fee.fee_structure_id)?.fee_type ?? "other";
}

// ---------------------------------------------------------------------
// 1. Daily Collection Report
// ---------------------------------------------------------------------
export interface DailyCollectionRow {
  receiptNumber: string;
  date: string;
  student: string;
  className: string;
  feeType: string;
  amount: number;
  method: string;
  collectedBy: string;
}

export function buildDailyCollectionReport(data: FinanceDataset, date: string) {
  const rows: DailyCollectionRow[] = data.payments
    .filter((p) => p.payment_date === date)
    .map((p) => {
      const student = data.students.find((s) => s.id === p.student_id);
      const fee = data.fees.find((f) => f.id === p.fee_id);
      return {
        receiptNumber: p.receipt_number,
        date: p.payment_date,
        student: student?.full_name ?? "—",
        className: classNameOf(student, data.classes),
        feeType: fee ? feeTypeOf(fee, data.feeStructures) : "other",
        amount: p.amount_paid,
        method: p.payment_method,
        collectedBy: nameOf(p.received_by, data.profiles),
      };
    });

  const refundsToday = data.refunds.filter((r) => (r.created_at ?? "").slice(0, 10) === date);
  const totalCollection = rows.reduce((s, r) => s + r.amount, 0);
  const totalRefunds = refundsToday.reduce((s, r) => s + r.amount, 0);

  return {
    rows,
    summary: {
      totalTransactions: rows.length,
      totalCollection,
      totalRefunds,
      netCollection: totalCollection - totalRefunds,
    },
  };
}

// ---------------------------------------------------------------------
// 2. Monthly Collection Report
// ---------------------------------------------------------------------
export interface MonthlyTrendPoint {
  label: string;
  collected: number;
}

export function buildMonthlyCollectionReport(data: FinanceDataset, month: number, year: number) {
  const inMonth = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.getMonth() + 1 === month && d.getFullYear() === year;
  };

  const feesForMonth = data.fees.filter((f) => inMonth(f.due_date));
  const paymentsForMonth = data.payments.filter((p) => inMonth(p.payment_date));
  const refundsForMonth = data.refunds.filter((r) => r.created_at && inMonth(r.created_at));

  const totalExpected = feesForMonth.reduce((s, f) => s + f.amount, 0);
  const totalDiscounts = feesForMonth.reduce((s, f) => s + f.discount, 0);
  const totalCollected = paymentsForMonth.reduce((s, p) => s + p.amount_paid, 0);
  const totalOutstanding = feesForMonth.reduce((s, f) => s + f.balance, 0);
  const totalRefunds = refundsForMonth.reduce((s, r) => s + r.amount, 0);

  const trend: MonthlyTrendPoint[] = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(year, month - 1 - (5 - i), 1);
    const label = d.toLocaleString("en", { month: "short", year: "2-digit" });
    const collected = data.payments
      .filter((p) => {
        const pd = new Date(p.payment_date);
        return pd.getMonth() === d.getMonth() && pd.getFullYear() === d.getFullYear();
      })
      .reduce((s, p) => s + p.amount_paid, 0);
    return { label, collected };
  });

  return {
    summary: {
      totalExpected,
      totalCollected,
      totalOutstanding,
      totalDiscounts,
      totalRefunds,
      netCollection: totalCollected - totalRefunds,
    },
    trend,
  };
}

// ---------------------------------------------------------------------
// 3. Student Fee Report
// ---------------------------------------------------------------------
export interface StudentFeeReportRow {
  title: string;
  amount: number;
  discount: number;
  scholarshipApplied: number;
  paid: number;
  balance: number;
  status: string;
}

export function buildStudentFeeReport(data: FinanceDataset, studentId: string) {
  const student = data.students.find((s) => s.id === studentId);
  const fees = data.fees.filter((f) => f.student_id === studentId);
  const rows: StudentFeeReportRow[] = fees.map((f) => {
    const applied = data.feeDiscounts.filter((fd) => fd.fee_id === f.id);
    const scholarshipApplied = applied.filter((a) => a.scholarship_id).reduce((s, a) => s + a.applied_amount, 0);
    return {
      title: f.title,
      amount: f.amount,
      discount: f.discount - scholarshipApplied,
      scholarshipApplied,
      paid: f.paid_amount,
      balance: f.balance,
      status: f.status,
    };
  });
  const payments = data.payments.filter((p) => p.student_id === studentId).sort((a, b) => (a.payment_date < b.payment_date ? 1 : -1));

  return {
    student,
    className: classNameOf(student, data.classes),
    rows,
    payments,
    totals: {
      totalCharged: rows.reduce((s, r) => s + r.amount, 0),
      totalDiscount: rows.reduce((s, r) => s + r.discount + r.scholarshipApplied, 0),
      totalPaid: rows.reduce((s, r) => s + r.paid, 0),
      totalBalance: rows.reduce((s, r) => s + r.balance, 0),
    },
  };
}

// ---------------------------------------------------------------------
// 4. Outstanding Fee Report (aggregated per student, sortable)
// ---------------------------------------------------------------------
export interface OutstandingReportRow {
  studentId: string;
  student: string;
  className: string;
  sectionName: string;
  totalDue: number;
  paid: number;
  balance: number;
  earliestDueDate: string;
  daysOverdue: number;
  status: string;
}

export function buildOutstandingReport(data: FinanceDataset, today = new Date()): OutstandingReportRow[] {
  const byStudent = new Map<string, FeeRecord[]>();
  for (const f of data.fees) {
    if (f.balance <= 0) continue;
    if (!byStudent.has(f.student_id)) byStudent.set(f.student_id, []);
    byStudent.get(f.student_id)!.push(f);
  }

  const rows: OutstandingReportRow[] = [];
  for (const [studentId, fees] of byStudent) {
    const student = data.students.find((s) => s.id === studentId);
    const earliest = fees.reduce((min, f) => (f.due_date < min ? f.due_date : min), fees[0].due_date);
    const daysOverdue = Math.max(0, Math.floor((today.getTime() - new Date(earliest).getTime()) / 86400000));
    rows.push({
      studentId,
      student: student?.full_name ?? "—",
      className: classNameOf(student, data.classes),
      sectionName: sectionNameOf(student, data.sections),
      totalDue: fees.reduce((s, f) => s + (f.amount - f.discount), 0),
      paid: fees.reduce((s, f) => s + f.paid_amount, 0),
      balance: fees.reduce((s, f) => s + f.balance, 0),
      earliestDueDate: earliest,
      daysOverdue,
      status: fees.some((f) => f.status === "overdue") ? "overdue" : "partial",
    });
  }
  return rows.sort((a, b) => b.balance - a.balance);
}

// ---------------------------------------------------------------------
// 5. Class-wise Collection
// ---------------------------------------------------------------------
export interface ClassCollectionRow {
  className: string;
  expected: number;
  collected: number;
  outstanding: number;
}

export function buildClassWiseCollection(data: FinanceDataset): ClassCollectionRow[] {
  return data.classes.map((c) => {
    const studentIds = new Set(data.students.filter((s) => s.class_id === c.id).map((s) => s.id));
    const classFees = data.fees.filter((f) => studentIds.has(f.student_id));
    return {
      className: c.name,
      expected: classFees.reduce((s, f) => s + (f.amount - f.discount), 0),
      collected: classFees.reduce((s, f) => s + f.paid_amount, 0),
      outstanding: classFees.reduce((s, f) => s + f.balance, 0),
    };
  });
}

// ---------------------------------------------------------------------
// 6. Fee-Type Collection
// ---------------------------------------------------------------------
export interface FeeTypeCollectionRow {
  feeType: string;
  expected: number;
  collected: number;
  outstanding: number;
}

export function buildFeeTypeCollection(data: FinanceDataset): FeeTypeCollectionRow[] {
  const totals = new Map<string, { expected: number; collected: number; outstanding: number }>();
  for (const f of data.fees) {
    const type = feeTypeOf(f, data.feeStructures);
    const bucket = totals.get(type) ?? { expected: 0, collected: 0, outstanding: 0 };
    bucket.expected += f.amount - f.discount;
    bucket.collected += f.paid_amount;
    bucket.outstanding += f.balance;
    totals.set(type, bucket);
  }
  return Array.from(totals.entries()).map(([feeType, v]) => ({ feeType, ...v }));
}

// ---------------------------------------------------------------------
// 7. Payment Method Report
// ---------------------------------------------------------------------
export interface PaymentMethodRow {
  method: string;
  transactionCount: number;
  totalAmount: number;
}

export function buildPaymentMethodReport(data: FinanceDataset): PaymentMethodRow[] {
  const totals = new Map<string, { count: number; amount: number }>();
  for (const p of data.payments) {
    const bucket = totals.get(p.payment_method) ?? { count: 0, amount: 0 };
    bucket.count += 1;
    bucket.amount += p.amount_paid;
    totals.set(p.payment_method, bucket);
  }
  return Array.from(totals.entries()).map(([method, v]) => ({ method, transactionCount: v.count, totalAmount: v.amount }));
}

// ---------------------------------------------------------------------
// 8. Discount Report
// ---------------------------------------------------------------------
export interface DiscountReportRow {
  student: string;
  className: string;
  originalAmount: number;
  discountAmount: number;
  netAmount: number;
  discountType: string;
  addedBy: string;
  date: string;
}

export function buildDiscountReport(data: FinanceDataset): DiscountReportRow[] {
  return data.feeDiscounts
    .filter((fd) => fd.discount_id)
    .map((fd) => {
      const fee = data.fees.find((f) => f.id === fd.fee_id);
      const student = data.students.find((s) => s.id === fee?.student_id);
      const discount = data.discounts.find((d) => d.id === fd.discount_id);
      return {
        student: student?.full_name ?? "—",
        className: classNameOf(student, data.classes),
        originalAmount: fee?.amount ?? 0,
        discountAmount: fd.applied_amount,
        netAmount: (fee?.amount ?? 0) - fd.applied_amount,
        discountType: discount ? `${discount.name} (${discount.kind === "percentage" ? `${discount.value}%` : `PKR ${discount.value}`})` : "—",
        addedBy: nameOf(discount?.created_by, data.profiles),
        date: fd.created_at ?? "",
      };
    });
}

// ---------------------------------------------------------------------
// 9. Scholarship Report
// ---------------------------------------------------------------------
export interface ScholarshipReportRow {
  student: string;
  className: string;
  scholarshipType: string;
  amountOrPercent: string;
  reason: string;
  proposedDate: string;
  approvedDate: string;
  approvedBy: string;
  status: string;
}

export function buildScholarshipReport(data: FinanceDataset): ScholarshipReportRow[] {
  return data.scholarships.map((s) => {
    const student = data.students.find((st) => st.id === s.student_id);
    return {
      student: student?.full_name ?? "—",
      className: classNameOf(student, data.classes),
      scholarshipType: s.name,
      amountOrPercent: s.kind === "percentage" ? `${s.value}%` : `PKR ${s.value.toLocaleString()}`,
      reason: s.notes ?? "—",
      proposedDate: s.created_at ?? "",
      approvedDate: s.approved_at ?? "—",
      approvedBy: s.approved_by ? nameOf(s.approved_by, data.profiles) : "—",
      status: s.status,
    };
  });
}

// ---------------------------------------------------------------------
// 10. Refund Report
// ---------------------------------------------------------------------
export interface RefundReportRow {
  refundId: string;
  receiptNumber: string;
  student: string;
  originalPayment: number;
  refundAmount: number;
  reason: string;
  approvedBy: string;
  date: string;
  status: string;
}

export function buildRefundReport(data: FinanceDataset): RefundReportRow[] {
  return data.refunds.map((r) => {
    const payment = data.payments.find((p) => p.id === r.payment_id);
    const student = data.students.find((s) => s.id === r.student_id);
    return {
      refundId: r.id,
      receiptNumber: payment?.receipt_number ?? "—",
      student: student?.full_name ?? "—",
      originalPayment: payment?.amount_paid ?? 0,
      refundAmount: r.amount,
      reason: r.reason,
      approvedBy: nameOf(r.refunded_by, data.profiles),
      date: r.created_at ?? "",
      status: r.status,
    };
  });
}

// ---------------------------------------------------------------------
// 11. Financial Summary
// ---------------------------------------------------------------------
export function buildFinancialSummary(data: FinanceDataset) {
  const totalExpected = data.fees.reduce((s, f) => s + f.amount, 0);
  const totalCollected = data.payments.reduce((s, p) => s + p.amount_paid, 0);
  const totalOutstanding = data.fees.reduce((s, f) => s + f.balance, 0);
  const totalDiscounts = data.feeDiscounts.filter((fd) => fd.discount_id).reduce((s, fd) => s + fd.applied_amount, 0);
  const totalScholarships = data.feeDiscounts.filter((fd) => fd.scholarship_id).reduce((s, fd) => s + fd.applied_amount, 0);
  const totalRefunds = data.refunds.reduce((s, r) => s + r.amount, 0);
  const netCollection = totalCollected - totalRefunds;

  return {
    totalExpected,
    totalCollected,
    totalOutstanding,
    totalDiscounts,
    totalScholarships,
    totalRefunds,
    netCollection,
    collectionRate: totalExpected > 0 ? (totalCollected / totalExpected) * 100 : 0,
    outstandingRate: totalExpected > 0 ? (totalOutstanding / totalExpected) * 100 : 0,
    paymentCount: data.payments.length,
  };
}
