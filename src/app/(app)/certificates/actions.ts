"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSession, isSchoolAdmin } from "@/lib/auth/session";
import { getStudent } from "@/lib/data/students";
import { listClasses, listSections } from "@/lib/data/academics";
import { getCurrentAcademicSession } from "@/lib/data/sessions";
import { createCertificate, cancelCertificate, createCertificateTemplate, listCertificateTemplates, reserveCertificateNumber } from "@/lib/data/certificates";
import { buildCertificateVariables, renderCertificateTemplate } from "@/lib/certificates/variables";
import { DEFAULT_CERTIFICATE_TEMPLATES } from "@/lib/certificates/default-templates";
import { recordAuditLog } from "@/lib/audit/log";
import type { CertificateType } from "@/types/database";

export async function createCertificateAction(formData: FormData): Promise<{ error?: string } | void> {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!isSchoolAdmin(session.profile.role)) return { error: "Only administrators can issue certificates." };

  const studentId = String(formData.get("student_id") ?? "");
  const certificateType = String(formData.get("certificate_type") ?? "") as CertificateType;
  const templateId = String(formData.get("template_id") ?? "") || null;
  const extraLine = String(formData.get("extra_line") ?? "").trim();
  if (!studentId || !certificateType) return { error: "Student and certificate type are required." };

  const student = await getStudent(studentId);
  if (!student) return { error: "Student not found." };

  const [classes, sections, currentSession, templates] = await Promise.all([
    listClasses(), listSections(), getCurrentAcademicSession(), listCertificateTemplates(),
  ]);

  const template = templateId ? templates.find((t) => t.id === templateId) : undefined;
  const bodyTemplate = template?.body_template ?? (certificateType !== "custom" ? DEFAULT_CERTIFICATE_TEMPLATES[certificateType] : "");
  if (!bodyTemplate) return { error: "A custom certificate requires selecting a template." };

  let certificate;
  try {
    const certificateNumber = await reserveCertificateNumber(session.school.id);
    const variables = buildCertificateVariables(student, session.school, {
      className: classes.find((c) => c.id === student.class_id)?.name ?? "—",
      sectionName: sections.find((s) => s.id === student.section_id)?.name ?? "—",
      academicSession: currentSession?.name ?? "—",
      certificateNumber,
      extraLine,
    });
    const bodyText = renderCertificateTemplate(bodyTemplate, variables);

    certificate = await createCertificate({
      schoolId: session.school.id,
      studentId,
      certificateType,
      certificateNumber,
      templateId,
      bodyText,
      createdBy: session.profile.id,
    });
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Could not issue this certificate." };
  }

  await recordAuditLog({
    schoolId: session.school.id,
    profileId: session.profile.id,
    action: "certificate.issued",
    targetTable: "certificates",
    targetId: certificate.id,
    metadata: { studentId, certificateType, certificateNumber: certificate.certificate_number },
  });

  revalidatePath("/certificates");
  redirect(`/certificates/${certificate.id}`);
}

export async function cancelCertificateAction(id: string, formData: FormData): Promise<{ error?: string } | void> {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!isSchoolAdmin(session.profile.role)) return { error: "Only administrators can cancel certificates." };

  const reason = String(formData.get("reason") ?? "").trim();
  if (!reason) return { error: "A cancellation reason is required." };

  await cancelCertificate(id, session.profile.id, reason);
  await recordAuditLog({ schoolId: session.school.id, profileId: session.profile.id, action: "certificate.cancelled", targetTable: "certificates", targetId: id, metadata: { reason } });

  revalidatePath("/certificates");
  revalidatePath(`/certificates/${id}`);
}

export async function createCertificateTemplateAction(formData: FormData): Promise<{ error?: string } | void> {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!isSchoolAdmin(session.profile.role)) return { error: "Only administrators can create certificate templates." };

  const name = String(formData.get("name") ?? "").trim();
  const certificateType = String(formData.get("certificate_type") ?? "custom") as CertificateType;
  const bodyTemplate = String(formData.get("body_template") ?? "").trim();
  if (!name || !bodyTemplate) return { error: "Template name and body are required." };

  await createCertificateTemplate({
    schoolId: session.school.id,
    name,
    certificate_type: certificateType,
    body_template: bodyTemplate,
    is_custom: true,
    created_by: session.profile.id,
  });

  revalidatePath("/certificates/templates");
}
