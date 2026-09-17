import { getSession } from "@/lib/auth/session";
import { Card, CardHeader } from "@/components/ui/card";

export default async function SettingsPage() {
  const session = await getSession();
  const school = session?.school;

  const fields: [string, string | null | undefined][] = [
    ["School Name", school?.name],
    ["School Code", school?.school_code],
    ["Address", school?.address],
    ["District", school?.district],
    ["Province", school?.province],
    ["Phone", school?.phone],
    ["Email", school?.email],
    ["Principal / Headteacher", school?.principal_name],
    ["Currency", school?.currency],
  ];

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div>
        <h1 className="text-xl font-semibold">School Settings</h1>
        <p className="text-sm text-muted">Core school profile used across reports, receipts, and certificates.</p>
      </div>

      <Card>
        <CardHeader title="School Profile" />
        <dl className="grid grid-cols-1 gap-x-6 gap-y-4 p-5 sm:grid-cols-2">
          {fields.map(([label, value]) => (
            <div key={label}>
              <dt className="text-xs font-medium uppercase tracking-wide text-muted">{label}</dt>
              <dd className="mt-0.5 text-sm">{value || "—"}</dd>
            </div>
          ))}
        </dl>
      </Card>

      <p className="text-xs text-muted">
        Editable settings (logo, theme, grading system, session management) are planned for Phase 9.
      </p>
    </div>
  );
}
