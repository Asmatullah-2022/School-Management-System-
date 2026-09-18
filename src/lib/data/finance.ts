import "server-only";
import { isDemoMode } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import { demoStore } from "@/lib/demo/store";
import type {
  Discount,
  FeeDiscount,
  FeePeriod,
  FeeRecord,
  FeeStructure,
  FinancialSettings,
  Payment,
  PaymentAllocation,
  Refund,
  Scholarship,
} from "@/types/database";

// ---------------------------------------------------------------------
// FEE STRUCTURES
// ---------------------------------------------------------------------
export async function listFeeStructures(): Promise<FeeStructure[]> {
  if (isDemoMode()) return demoStore.listFeeStructures();
  const supabase = await createClient();
  const { data, error } = await supabase.from("fee_structures").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return data as FeeStructure[];
}

export async function createFeeStructure(input: {
  school_id: string;
  name: string;
  amount: number;
  frequency: FeeStructure["frequency"];
  fee_type: string;
  class_id?: string | null;
  academic_session_id?: string | null;
  created_by?: string;
}): Promise<FeeStructure> {
  if (isDemoMode()) return demoStore.createFeeStructure(input);
  const supabase = await createClient();
  const { data, error } = await supabase.from("fee_structures").insert(input).select().single();
  if (error) throw error;
  return data as FeeStructure;
}

export async function updateFeeStructure(id: string, data: Partial<FeeStructure>): Promise<FeeStructure | undefined> {
  if (isDemoMode()) return demoStore.updateFeeStructure(id, data);
  const supabase = await createClient();
  const { data: row, error } = await supabase.from("fee_structures").update(data).eq("id", id).select().single();
  if (error) throw error;
  return row as FeeStructure;
}

export async function duplicateFeeStructure(id: string): Promise<FeeStructure | undefined> {
  if (isDemoMode()) return demoStore.duplicateFeeStructure(id);
  const supabase = await createClient();
  const { data: source, error: fetchError } = await supabase.from("fee_structures").select("*").eq("id", id).single();
  if (fetchError) throw fetchError;
  const { id: _id, created_at: _createdAt, ...rest } = source as FeeStructure & { created_at: string };
  const { data, error } = await supabase.from("fee_structures").insert({ ...rest, name: `${rest.name} (Copy)` }).select().single();
  if (error) throw error;
  return data as FeeStructure;
}

// ---------------------------------------------------------------------
// FEE PERIODS
// ---------------------------------------------------------------------
export async function listFeePeriods(): Promise<FeePeriod[]> {
  if (isDemoMode()) return demoStore.listFeePeriods();
  const supabase = await createClient();
  const { data, error } = await supabase.from("fee_periods").select("*").order("year", { ascending: false }).order("month", { ascending: false });
  if (error) throw error;
  return data as FeePeriod[];
}

export async function ensureFeePeriod(schoolId: string, month: number, year: number, name: string): Promise<FeePeriod> {
  if (isDemoMode()) return demoStore.ensureFeePeriod(month, year, name);
  const supabase = await createClient();
  const { data: existing } = await supabase.from("fee_periods").select("*").eq("school_id", schoolId).eq("month", month).eq("year", year).maybeSingle();
  if (existing) return existing as FeePeriod;
  const start = `${year}-${String(month).padStart(2, "0")}-01`;
  const end = new Date(year, month, 0).toISOString().slice(0, 10);
  const { data, error } = await supabase
    .from("fee_periods")
    .insert({ school_id: schoolId, name, month, year, start_date: start, end_date: end })
    .select()
    .single();
  if (error) throw error;
  return data as FeePeriod;
}

// ---------------------------------------------------------------------
// FEE CHARGES ("fees" table)
// ---------------------------------------------------------------------
export async function listFees(): Promise<FeeRecord[]> {
  if (isDemoMode()) return demoStore.listFees();
  const supabase = await createClient();
  const { data, error } = await supabase.from("fees").select("*").order("due_date", { ascending: false });
  if (error) throw error;
  return data as FeeRecord[];
}

export async function getFee(id: string): Promise<FeeRecord | undefined> {
  if (isDemoMode()) return demoStore.getFee(id);
  const supabase = await createClient();
  const { data, error } = await supabase.from("fees").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return (data as FeeRecord) ?? undefined;
}

/** Generates fee charges for the given students, skipping any that already
 * exist (the unique partial indexes on `fees` make this race-safe even
 * under concurrent generation). Applies any matching active discounts and
 * approved scholarships at generation time, snapshotted into fee_discounts. */
export async function generateFeeCharges(params: {
  schoolId: string;
  studentIds: string[];
  feeStructureId: string;
  feePeriodId: string | null;
  dueDate: string;
  createdBy?: string;
}): Promise<{ created: number; skipped: number }> {
  if (isDemoMode()) {
    const result = demoStore.generateFeeCharges({
      studentIds: params.studentIds,
      feeStructureId: params.feeStructureId,
      feePeriodId: params.feePeriodId,
      dueDate: params.dueDate,
      createdBy: params.createdBy,
    });
    return { created: result.created.length, skipped: result.skipped };
  }

  const supabase = await createClient();
  const { data: structure, error: structErr } = await supabase.from("fee_structures").select("*").eq("id", params.feeStructureId).single();
  if (structErr) throw structErr;

  const { data: students } = await supabase.from("students").select("id, class_id, section_id").in("id", params.studentIds);
  const { data: discounts } = await supabase.from("discounts").select("*").eq("school_id", params.schoolId).eq("is_active", true);
  const { data: scholarships } = await supabase.from("scholarships").select("*").eq("school_id", params.schoolId).eq("status", "approved");

  let created = 0;
  let skipped = 0;

  for (const studentId of params.studentIds) {
    const student = students?.find((s) => s.id === studentId);
    const applicable = (discounts ?? []).filter(
      (d: Discount) =>
        d.scope === "school" ||
        (d.scope === "class" && d.class_id === student?.class_id) ||
        (d.scope === "section" && d.section_id === student?.section_id) ||
        (d.scope === "student" && d.student_id === studentId)
    );
    const approved = (scholarships ?? []).filter((s: Scholarship) => s.student_id === studentId);

    let discountTotal = 0;
    for (const d of applicable) discountTotal += d.kind === "percentage" ? Math.round((structure.amount * d.value) / 100) : d.value;
    for (const s of approved) discountTotal += s.kind === "percentage" ? Math.round((structure.amount * s.value) / 100) : s.value;
    discountTotal = Math.min(discountTotal, structure.amount);

    const { data: fee, error } = await supabase
      .from("fees")
      .insert({
        school_id: params.schoolId,
        student_id: studentId,
        fee_structure_id: structure.id,
        fee_period_id: params.feePeriodId,
        title: structure.name,
        amount: structure.amount,
        discount: discountTotal,
        due_date: params.dueDate,
        created_by: params.createdBy,
      })
      .select()
      .single();

    if (error) {
      if (error.code === "23505") {
        skipped++;
        continue;
      }
      throw error;
    }

    for (const d of applicable) {
      const amount = d.kind === "percentage" ? Math.round((structure.amount * d.value) / 100) : d.value;
      await supabase.from("fee_discounts").insert({ school_id: params.schoolId, fee_id: fee.id, discount_id: d.id, applied_amount: amount });
    }
    for (const s of approved) {
      const amount = s.kind === "percentage" ? Math.round((structure.amount * s.value) / 100) : s.value;
      await supabase.from("fee_discounts").insert({ school_id: params.schoolId, fee_id: fee.id, scholarship_id: s.id, applied_amount: amount });
    }
    created++;
  }

  return { created, skipped };
}

export async function listFeeDiscounts(feeId?: string): Promise<FeeDiscount[]> {
  if (isDemoMode()) return demoStore.listFeeDiscounts(feeId);
  const supabase = await createClient();
  let query = supabase.from("fee_discounts").select("*");
  if (feeId) query = query.eq("fee_id", feeId);
  const { data, error } = await query;
  if (error) throw error;
  return data as FeeDiscount[];
}

// ---------------------------------------------------------------------
// DISCOUNTS / SCHOLARSHIPS
// ---------------------------------------------------------------------
export async function listDiscounts(): Promise<Discount[]> {
  if (isDemoMode()) return demoStore.listDiscounts();
  const supabase = await createClient();
  const { data, error } = await supabase.from("discounts").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return data as Discount[];
}

export async function createDiscount(input: Omit<Discount, "id" | "is_active">): Promise<Discount> {
  if (isDemoMode()) return demoStore.createDiscount(input);
  const supabase = await createClient();
  const { data, error } = await supabase.from("discounts").insert(input).select().single();
  if (error) throw error;
  return data as Discount;
}

export async function toggleDiscount(id: string, isActive: boolean): Promise<Discount | undefined> {
  if (isDemoMode()) return demoStore.toggleDiscount(id, isActive);
  const supabase = await createClient();
  const { data, error } = await supabase.from("discounts").update({ is_active: isActive }).eq("id", id).select().single();
  if (error) throw error;
  return data as Discount;
}

export async function listScholarships(): Promise<Scholarship[]> {
  if (isDemoMode()) return demoStore.listScholarships();
  const supabase = await createClient();
  const { data, error } = await supabase.from("scholarships").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return data as Scholarship[];
}

export async function createScholarship(input: Omit<Scholarship, "id" | "status" | "approved_by" | "approved_at">): Promise<Scholarship> {
  if (isDemoMode()) return demoStore.createScholarship(input);
  const supabase = await createClient();
  const { data, error } = await supabase.from("scholarships").insert(input).select().single();
  if (error) throw error;
  return data as Scholarship;
}

export async function decideScholarship(id: string, status: "approved" | "rejected", approvedBy: string): Promise<Scholarship | undefined> {
  if (isDemoMode()) return demoStore.decideScholarship(id, status, approvedBy);
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("scholarships")
    .update({ status, approved_by: approvedBy, approved_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as Scholarship;
}

// ---------------------------------------------------------------------
// PAYMENTS / ALLOCATIONS / REFUNDS
// ---------------------------------------------------------------------
export async function listPayments(): Promise<Payment[]> {
  if (isDemoMode()) return demoStore.listPayments();
  const supabase = await createClient();
  const { data, error } = await supabase.from("payments").select("*").order("payment_date", { ascending: false });
  if (error) throw error;
  return data as Payment[];
}

export async function listPaymentAllocations(paymentId?: string): Promise<PaymentAllocation[]> {
  if (isDemoMode()) return demoStore.listPaymentAllocations(paymentId);
  const supabase = await createClient();
  let query = supabase.from("payment_allocations").select("*");
  if (paymentId) query = query.eq("payment_id", paymentId);
  const { data, error } = await query;
  if (error) throw error;
  return data as PaymentAllocation[];
}

/** The only sanctioned way to record a payment — invokes the `record_payment`
 * DB function (or its demo-store equivalent) so amount/receipt/allocations
 * are always created together, atomically, with a real sequential receipt
 * number. Never insert into `payments` directly. */
export async function recordPayment(params: {
  schoolId: string;
  studentId: string;
  method: string;
  allocations: { feeId: string; amount: number }[];
  notes?: string;
  receivedBy?: string;
}): Promise<Payment> {
  if (isDemoMode()) {
    return demoStore.recordPayment({
      studentId: params.studentId,
      method: params.method,
      allocations: params.allocations,
      notes: params.notes,
      receivedBy: params.receivedBy,
    });
  }
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("record_payment", {
    p_school_id: params.schoolId,
    p_student_id: params.studentId,
    p_method: params.method,
    p_allocations: params.allocations.map((a) => ({ fee_id: a.feeId, amount: a.amount })),
    p_notes: params.notes ?? null,
  });
  if (error) throw new Error(error.message);
  return data as Payment;
}

export async function listRefunds(): Promise<Refund[]> {
  if (isDemoMode()) return demoStore.listRefunds();
  const supabase = await createClient();
  const { data, error } = await supabase.from("refunds").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return data as Refund[];
}

/** The only sanctioned way to reverse money — capped at the eligible paid
 * amount and always logged with a reason (see `record_refund` / the
 * `guard_refund_cap` trigger). Never insert into `refunds` directly. */
export async function recordRefund(params: {
  schoolId: string;
  paymentId: string;
  feeId: string;
  studentId: string;
  amount: number;
  reason: string;
  refundedBy?: string;
}): Promise<Refund> {
  if (isDemoMode()) {
    return demoStore.recordRefund({
      paymentId: params.paymentId,
      feeId: params.feeId,
      studentId: params.studentId,
      amount: params.amount,
      reason: params.reason,
      refundedBy: params.refundedBy,
    });
  }
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("record_refund", {
    p_school_id: params.schoolId,
    p_payment_id: params.paymentId,
    p_fee_id: params.feeId,
    p_student_id: params.studentId,
    p_amount: params.amount,
    p_reason: params.reason,
  });
  if (error) throw new Error(error.message);
  return data as Refund;
}

export async function getFinancialSettings(): Promise<FinancialSettings | undefined> {
  if (isDemoMode()) return demoStore.getFinancialSettings();
  const supabase = await createClient();
  const { data, error } = await supabase.from("financial_settings").select("*").maybeSingle();
  if (error) throw error;
  return (data as FinancialSettings) ?? undefined;
}
