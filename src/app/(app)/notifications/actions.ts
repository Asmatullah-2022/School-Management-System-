"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { markNotificationRead, markAllNotificationsRead } from "@/lib/data/notifications";

export async function markNotificationReadAction(id: string) {
  const session = await getSession();
  if (!session) redirect("/login");
  await markNotificationRead(id, session.profile.id, true);
  revalidatePath("/notifications");
}

export async function markNotificationUnreadAction(id: string) {
  const session = await getSession();
  if (!session) redirect("/login");
  await markNotificationRead(id, session.profile.id, false);
  revalidatePath("/notifications");
}

export async function markAllNotificationsReadAction() {
  const session = await getSession();
  if (!session) redirect("/login");
  await markAllNotificationsRead(session.profile.id);
  revalidatePath("/notifications");
}
