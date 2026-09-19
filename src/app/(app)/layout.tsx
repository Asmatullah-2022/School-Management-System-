import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { listNotificationsFor } from "@/lib/data/notifications";
import { AppShell } from "@/components/app-shell";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/login");

  const notifications = await listNotificationsFor(session.profile.id);
  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <AppShell profile={session.profile} school={session.school} unreadCount={unreadCount}>
      {children}
    </AppShell>
  );
}
