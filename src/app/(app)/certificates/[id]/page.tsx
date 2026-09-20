import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, Printer } from "lucide-react";
import { getSession, isSchoolAdmin, isSchoolStaff } from "@/lib/auth/session";
import { getCertificate } from "@/lib/data/certificates";
import { getStudent } from "@/lib/data/students";
import { getStudentIdForProfile, getChildStudentIdsForProfile } from "@/lib/data/people";
import { CERTIFICATE_TYPE_LABELS } from "@/lib/certificates/default-templates";
import { Card, CardHeader } from "@/components/ui/card";
import { CancelCertificateForm } from "@/components/certificates/cancel-certificate-form";
import { cancelCertificateAction } from "../actions";

export default async function CertificateDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) redirect("/login");

  const { id } = await params;
  const certificate = await getCertificate(id);
  if (!certificate) notFound();

  // Security: a parent/student may only ever view their own/child's
  // certificate — never another student's by editing the id in the URL.
  if (!isSchoolStaff(session.profile.role)) {
    const authorizedIds =
      session.profile.role === "student"
        ? [await getStudentIdForProfile(session.profile.id)].filter((sid): sid is string => !!sid)
        : await getChildStudentIdsForProfile(session.profile.id);
    if (!authorizedIds.includes(certificate.student_id)) notFound();
  }

  const student = await getStudent(certificate.student_id);
  const isAdmin = isSchoolAdmin(session.profile.role);

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <Link href="/certificates" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-primary">
        <ArrowLeft size={15} /> Back to Certificates
      </Link>

      <Card>
        <CardHeader
          title={CERTIFICATE_TYPE_LABELS[certificate.certificate_type]}
          action={
            <Link href={`/print/certificate?id=${certificate.id}`} target="_blank" className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:bg-background">
              <Printer size={13} /> View / Print
            </Link>
          }
        />
        <div className="space-y-3 p-5 text-sm">
          <p><strong>Student:</strong> {student?.full_name ?? "Unknown"}</p>
          <p><strong>Certificate Number:</strong> {certificate.certificate_number}</p>
          <p><strong>Issue Date:</strong> {new Date(certificate.issue_date).toLocaleDateString()}</p>
          <p><strong>Status:</strong> <span className="capitalize">{certificate.status}</span></p>
          {certificate.status === "cancelled" && (
            <p className="text-danger"><strong>Cancellation Reason:</strong> {certificate.cancellation_reason}</p>
          )}
          <div className="rounded-lg border border-border bg-background p-4 text-sm leading-relaxed">{certificate.body_text}</div>
        </div>

        {isAdmin && certificate.status === "issued" && (
          <div className="border-t border-border p-5">
            <CancelCertificateForm action={cancelCertificateAction.bind(null, certificate.id)} />
          </div>
        )}
      </Card>
    </div>
  );
}
