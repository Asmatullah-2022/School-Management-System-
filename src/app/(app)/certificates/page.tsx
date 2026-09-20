import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus, Settings2 } from "lucide-react";
import { getSession, isSchoolAdmin, isSchoolStaff } from "@/lib/auth/session";
import { listCertificates } from "@/lib/data/certificates";
import { listStudents } from "@/lib/data/students";
import { getStudentIdForProfile, getChildStudentIdsForProfile } from "@/lib/data/people";
import { CERTIFICATE_TYPE_LABELS } from "@/lib/certificates/default-templates";
import { Card, EmptyState } from "@/components/ui/card";

const statusStyles: Record<string, string> = { issued: "bg-success/10 text-success", cancelled: "bg-danger/10 text-danger" };

export default async function CertificatesPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const isAdmin = isSchoolAdmin(session.profile.role);
  const isStaff = isSchoolStaff(session.profile.role);

  const [allCertificates, students] = await Promise.all([listCertificates(), listStudents()]);

  let certificates = allCertificates;
  if (!isStaff) {
    const authorizedIds =
      session.profile.role === "student"
        ? [await getStudentIdForProfile(session.profile.id)].filter((id): id is string => !!id)
        : await getChildStudentIdsForProfile(session.profile.id);
    certificates = allCertificates.filter((c) => authorizedIds.includes(c.student_id));
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold">{isStaff ? "Certificate Management" : "My Certificates"}</h1>
          <p className="text-sm text-muted">{certificates.length} certificate{certificates.length === 1 ? "" : "s"}</p>
        </div>
        {isAdmin && (
          <div className="flex gap-2">
            <Link href="/certificates/templates" className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm font-medium hover:bg-background">
              <Settings2 size={15} /> Templates
            </Link>
            <Link href="/certificates/new" className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90">
              <Plus size={16} /> Issue Certificate
            </Link>
          </div>
        )}
      </div>

      <Card>
        {certificates.length === 0 ? (
          <EmptyState label="No certificates issued yet." />
        ) : (
          <ul className="divide-y divide-border">
            {certificates.map((c) => {
              const student = students.find((s) => s.id === c.student_id);
              return (
                <li key={c.id}>
                  <Link href={`/certificates/${c.id}`} className="flex items-center justify-between px-5 py-3 text-sm hover:bg-background">
                    <div>
                      <p className="font-medium">{CERTIFICATE_TYPE_LABELS[c.certificate_type]} {isStaff && `— ${student?.full_name ?? "Unknown student"}`}</p>
                      <p className="text-xs text-muted">{c.certificate_number} · Issued {new Date(c.issue_date).toLocaleDateString()}</p>
                    </div>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${statusStyles[c.status]}`}>{c.status}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </div>
  );
}
