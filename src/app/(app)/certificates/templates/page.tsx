import { redirect } from "next/navigation";
import { getSession, isSchoolAdmin } from "@/lib/auth/session";
import { listCertificateTemplates } from "@/lib/data/certificates";
import { CERTIFICATE_TYPE_LABELS } from "@/lib/certificates/default-templates";
import { Card, CardHeader, EmptyState } from "@/components/ui/card";
import { TemplateForm } from "@/components/certificates/template-form";
import { createCertificateTemplateAction } from "../actions";

export default async function CertificateTemplatesPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!isSchoolAdmin(session.profile.role)) redirect("/certificates");

  const templates = await listCertificateTemplates();

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div>
        <h1 className="text-xl font-semibold">Certificate Templates</h1>
        <p className="text-sm text-muted">Standard wording is already built in for every certificate type — create a custom template to override it, or for a fully custom certificate.</p>
      </div>

      <Card className="p-5 sm:p-6">
        <TemplateForm action={createCertificateTemplateAction} />
      </Card>

      <Card>
        <CardHeader title="Saved Templates" />
        {templates.length === 0 ? (
          <EmptyState label="No custom templates yet — the built-in standard wording is used." />
        ) : (
          <ul className="divide-y divide-border">
            {templates.map((t) => (
              <li key={t.id} className="px-5 py-3 text-sm">
                <p className="font-medium">{t.name} <span className="text-xs font-normal text-muted">({CERTIFICATE_TYPE_LABELS[t.certificate_type]})</span></p>
                <p className="mt-1 line-clamp-2 text-xs text-muted">{t.body_template}</p>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
