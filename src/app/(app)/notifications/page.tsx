import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { listNotificationsFor } from "@/lib/data/notifications";
import { Card } from "@/components/ui/card";
import { NotificationList } from "@/components/notifications/notification-list";
import { markNotificationReadAction } from "./actions";

export default async function NotificationsPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const notifications = await listNotificationsFor(session.profile.id);
  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div>
        <h1 className="text-xl font-semibold">Notifications</h1>
        <p className="text-sm text-muted">
          {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount === 1 ? "" : "s"}` : "You're all caught up."}
        </p>
      </div>
      <Card>
        <NotificationList notifications={notifications} markReadAction={markNotificationReadAction} />
      </Card>
    </div>
  );
}
