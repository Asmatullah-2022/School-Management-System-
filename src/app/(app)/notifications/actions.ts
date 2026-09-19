"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { markNotificationRead } from "@/lib/data/notifications";

export async function markNotificationReadAction(id: string) {
  const session = await getSession();
  if (!session) redirect("/login");
  await markNotificationRead(id, session.profile.id);
  revalidatePath("/notifications");
}
