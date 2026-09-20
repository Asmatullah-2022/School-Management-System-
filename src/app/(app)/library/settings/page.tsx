import { redirect } from "next/navigation";
import { getSession, isSchoolAdmin } from "@/lib/auth/session";
import { getLibrarySettings } from "@/lib/data/library";
import { Card } from "@/components/ui/card";
import { LibrarySettingsForm } from "@/components/library/library-settings-form";
import { updateLibrarySettingsAction } from "../actions";

export default async function LibrarySettingsPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!isSchoolAdmin(session.profile.role)) redirect("/library");

  const settings = await getLibrarySettings(session.school.id);

  return (
    <div className="mx-auto max-w-xl space-y-4">
      <div>
        <h1 className="text-xl font-semibold">Library Settings</h1>
        <p className="text-sm text-muted">Fine calculation and loan period configuration.</p>
      </div>
      <Card className="p-5 sm:p-6">
        <LibrarySettingsForm settings={settings} action={updateLibrarySettingsAction} />
      </Card>
    </div>
  );
}
