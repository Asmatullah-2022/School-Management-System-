import { getSession, isSchoolAdmin } from "@/lib/auth/session";
import { Card, CardHeader } from "@/components/ui/card";
import { GradingForm } from "@/components/settings/grading-form";
import { DocumentSettingsForm } from "@/components/settings/document-settings-form";
import { updateGradingSystemAction, updateSchoolSettingsAction } from "./actions";

export default async function SettingsPage() {
  const session = await getSession();
  const school = session?.school;
  const canManage = !!session && isSchoolAdmin(session.profile.role);

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div>
        <h1 className="text-xl font-semibold">School Settings</h1>
        <p className="text-sm text-muted">Core school profile used across reports, receipts, and certificates.</p>
      </div>

      <Card>
        <CardHeader title="School Profile & Document Settings" />
        <div className="p-5">
          {canManage && school ? (
            <DocumentSettingsForm school={school} action={updateSchoolSettingsAction} />
          ) : (
            <dl className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
              {(
                [
                  ["School Name", school?.name],
                  ["School Code", school?.school_code],
                  ["Address", school?.address],
                  ["District", school?.district],
                  ["Province", school?.province],
                  ["Phone", school?.phone],
                  ["Email", school?.email],
                  ["Website", school?.website],
                  ["Principal / Headteacher", school?.principal_name],
                  ["Currency", school?.currency],
                ] as [string, string | null | undefined][]
              ).map(([label, value]) => (
                <div key={label}>
                  <dt className="text-xs font-medium uppercase tracking-wide text-muted">{label}</dt>
                  <dd className="mt-0.5 text-sm">{value || "—"}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      </Card>

      {canManage && (
        <Card>
          <CardHeader title="Grading System" />
          <div className="p-5">
            <p className="mb-4 text-xs text-muted">
              Percentage ranges used to grade exam results. Bands must not overlap.
            </p>
            <GradingForm initialBands={school?.grading_system ?? []} action={updateGradingSystemAction} />
          </div>
        </Card>
      )}
    </div>
  );
}
