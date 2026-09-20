import { notFound, redirect } from "next/navigation";
import { getSession, isSchoolStaff } from "@/lib/auth/session";
import { getCertificate } from "@/lib/data/certificates";
import { getStudent } from "@/lib/data/students";
import { getStudentIdForProfile, getChildStudentIdsForProfile } from "@/lib/data/people";
import { CERTIFICATE_TYPE_LABELS } from "@/lib/certificates/default-templates";
import { recordAuditLog } from "@/lib/audit/log";
import { PrintButton } from "@/components/timetable/print-button";

export default async function PrintCertificatePage({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
  const session = await getSession();
  if (!session) redirect("/login");

  const { id } = await searchParams;
  if (!id) notFound();

  const certificate = await getCertificate(id);
  if (!certificate) notFound();

  if (!isSchoolStaff(session.profile.role)) {
    const authorizedIds =
      session.profile.role === "student"
        ? [await getStudentIdForProfile(session.profile.id)].filter((sid): sid is string => !!sid)
        : await getChildStudentIdsForProfile(session.profile.id);
    if (!authorizedIds.includes(certificate.student_id)) notFound();
  }

  const student = await getStudent(certificate.student_id);
  const { school } = session;

  await recordAuditLog({ schoolId: school.id, profileId: session.profile.id, action: "certificate.downloaded", targetTable: "certificates", targetId: certificate.id });

  return (
    <div className="mx-auto max-w-3xl p-10 print:p-6">
      <div className="mb-6 flex items-center justify-between print:hidden">
        <p className="text-sm text-muted">Print preview</p>
        <PrintButton />
      </div>

      <div className="rounded-lg border-4 border-double border-border p-10">
        <header className="mb-8 flex items-center gap-4 border-b-2 border-border pb-6">
          {school.logo_url && <img src={school.logo_url} alt="" className="h-16 w-16 object-contain" />}
          <div className="text-center flex-1">
            <h1 className="text-xl font-bold uppercase tracking-wide">{school.name}</h1>
            {school.address && <p className="text-sm text-muted">{school.address}{school.district ? `, ${school.district}` : ""}</p>}
            <p className="text-xs text-muted">
              {[school.phone, school.email, school.website].filter(Boolean).join(" · ")}
            </p>
          </div>
        </header>

        <p className="mb-6 text-center text-lg font-semibold uppercase tracking-widest">{CERTIFICATE_TYPE_LABELS[certificate.certificate_type]}</p>

        <p className="min-h-[8rem] text-justify text-base leading-relaxed">{certificate.body_text}</p>

        <div className="mt-16 flex items-end justify-between text-sm">
          <div>
            <p>Date: {new Date(certificate.issue_date).toLocaleDateString()}</p>
            <p>Certificate No: {certificate.certificate_number}</p>
          </div>
          <div className="text-center">
            {school.principal_signature_url && <img src={school.principal_signature_url} alt="" className="mx-auto mb-1 h-10" />}
            <p className="border-t border-foreground pt-1">{school.headteacher_name ?? school.principal_name ?? "Headteacher"}</p>
            <p className="text-xs text-muted">Headteacher / Principal</p>
          </div>
        </div>

        {school.school_stamp_url && (
          <div className="mt-4 flex justify-end">
            <img src={school.school_stamp_url} alt="" className="h-20 w-20 object-contain opacity-80" />
          </div>
        )}

        {school.document_footer && <p className="mt-10 text-center text-xs text-muted">{school.document_footer}</p>}
      </div>

      {student && <p className="mt-4 text-center text-xs text-muted print:hidden">For: {student.full_name} ({student.admission_number})</p>}
    </div>
  );
}
