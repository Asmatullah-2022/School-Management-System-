import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { getNotificationPreferences } from "@/lib/data/notification-preferences";
import { Card } from "@/components/ui/card";
import { PreferencesForm } from "@/components/notifications/preferences-form";
import { updateNotificationPreferencesAction } from "./actions";

export default async function NotificationPreferencesPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const preferences = await getNotificationPreferences(session.profile.id);

  return (
    <div className="mx-auto max-w-xl space-y-4">
      <Link href="/notifications" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-primary">
        <ArrowLeft size={15} /> Back to Notifications
      </Link>
      <div>
        <h1 className="text-xl font-semibold">Notification Preferences</h1>
        <p className="text-sm text-muted">Choose which non-critical notifications you want to receive.</p>
      </div>
      <Card className="p-5">
        <PreferencesForm preferences={preferences} action={updateNotificationPreferencesAction} />
      </Card>
    </div>
  );
}
