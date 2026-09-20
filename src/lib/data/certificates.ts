import "server-only";
import { isDemoMode } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import { demoStore } from "@/lib/demo/store";
import type { Certificate, CertificateTemplate } from "@/types/database";

export async function listCertificateTemplates(): Promise<CertificateTemplate[]> {
  if (isDemoMode()) return demoStore.listCertificateTemplates();
  const supabase = await createClient();
  const { data, error } = await supabase.from("certificate_templates").select("*").order("name");
  if (error) throw error;
  return data as CertificateTemplate[];
}

export async function createCertificateTemplate(
  input: Omit<CertificateTemplate, "id" | "school_id"> & { schoolId: string }
): Promise<CertificateTemplate> {
  const { schoolId, ...rest } = input;
  if (isDemoMode()) return demoStore.createCertificateTemplate(rest);
  const supabase = await createClient();
  const { data, error } = await supabase.from("certificate_templates").insert({ school_id: schoolId, ...rest }).select().single();
  if (error) throw new Error(error.message);
  return data as CertificateTemplate;
}

export async function listCertificates(): Promise<Certificate[]> {
  if (isDemoMode()) return demoStore.listCertificates();
  const supabase = await createClient();
  const { data, error } = await supabase.from("certificates").select("*").order("issue_date", { ascending: false });
  if (error) throw error;
  return data as Certificate[];
}

export async function getCertificate(id: string): Promise<Certificate | undefined> {
  if (isDemoMode()) return demoStore.getCertificate(id);
  const supabase = await createClient();
  const { data, error } = await supabase.from("certificates").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return (data as Certificate) ?? undefined;
}

/** Reserves the next sequential certificate number for this school (e.g.
 * CERT-2026-000001) using the same row-locking function as receipts in
 * Phase 5 (`next_certificate_number`). Called before rendering the body
 * text so a template referencing {{certificate_number}} gets the real
 * value, not a placeholder. */
export async function reserveCertificateNumber(schoolId: string): Promise<string> {
  if (isDemoMode()) return demoStore.nextCertificateNumber();
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("next_certificate_number", { p_school_id: schoolId });
  if (error) throw new Error(error.message);
  return data as string;
}

/** Issues a certificate with an already-reserved certificate number,
 * snapshotting the rendered body text so the document a student later
 * downloads never silently changes if the template is edited afterwards. */
export async function createCertificate(input: {
  schoolId: string;
  studentId: string;
  certificateType: Certificate["certificate_type"];
  certificateNumber: string;
  templateId?: string | null;
  bodyText: string;
  createdBy: string;
}): Promise<Certificate> {
  if (isDemoMode()) {
    return demoStore.createCertificate({
      student_id: input.studentId,
      certificate_type: input.certificateType,
      certificate_number: input.certificateNumber,
      template_id: input.templateId ?? null,
      body_text: input.bodyText,
      issue_date: new Date().toISOString().slice(0, 10),
      issued_by: input.createdBy,
      created_by: input.createdBy,
    });
  }
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("certificates")
    .insert({
      school_id: input.schoolId,
      student_id: input.studentId,
      certificate_type: input.certificateType,
      certificate_number: input.certificateNumber,
      template_id: input.templateId ?? null,
      body_text: input.bodyText,
      issued_by: input.createdBy,
      created_by: input.createdBy,
    })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as Certificate;
}

export async function cancelCertificate(id: string, cancelledBy: string, reason: string): Promise<Certificate | undefined> {
  if (isDemoMode()) return demoStore.cancelCertificate(id, cancelledBy, reason);
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("certificates")
    .update({ status: "cancelled", cancelled_by: cancelledBy, cancelled_at: new Date().toISOString(), cancellation_reason: reason })
    .eq("id", id)
    .select()
    .maybeSingle();
  if (error) throw new Error(error.message);
  return (data as Certificate) ?? undefined;
}
