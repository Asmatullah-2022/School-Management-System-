import { redirect } from "next/navigation";
import { getSession, isSchoolAdmin } from "@/lib/auth/session";
import { listStudents } from "@/lib/data/students";
import { listCertificateTemplates } from "@/lib/data/certificates";
import { Card } from "@/components/ui/card";
import { CertificateForm } from "@/components/certificates/certificate-form";
import { createCertificateAction } from "../actions";

export default async function NewCertificatePage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!isSchoolAdmin(session.profile.role)) redirect("/certificates");

  const [students, templates] = await Promise.all([listStudents(), listCertificateTemplates()]);

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div>
        <h1 className="text-xl font-semibold">Issue Certificate</h1>
        <p className="text-sm text-muted">Student details are pulled automatically — nothing needs to be retyped.</p>
      </div>
      <Card className="p-5 sm:p-6">
        <CertificateForm students={students} templates={templates} action={createCertificateAction} />
      </Card>
    </div>
  );
}
