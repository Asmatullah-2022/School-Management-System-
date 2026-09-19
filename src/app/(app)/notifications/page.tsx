import Link from "next/link";
import { redirect } from "next/navigation";
import { Settings2 } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { listNotificationsFor } from "@/lib/data/notifications";
import { Card } from "@/components/ui/card";
import { NotificationList } from "@/components/notifications/notification-list";
import { MarkAllReadButton } from "@/components/notifications/mark-all-read-button";
import { markNotificationReadAction, markNotificationUnreadAction, markAllNotificationsReadAction } from "./actions";

export default async function NotificationsPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const notifications = await listNotificationsFor(session.profile.id);
  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold">Notifications</h1>
          <p className="text-sm text-muted">
            {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount === 1 ? "" : "s"}` : "You're all caught up."}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && <MarkAllReadButton action={markAllNotificationsReadAction} />}
          <Link href="/notifications/preferences" className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm font-medium hover:bg-background">
            <Settings2 size={15} /> Preferences
          </Link>
        </div>
      </div>
      <Card>
        <NotificationList notifications={notifications} markReadAction={markNotificationReadAction} markUnreadAction={markNotificationUnreadAction} />
      </Card>
    </div>
  );
}
