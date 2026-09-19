"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSession, isSchoolAdmin } from "@/lib/auth/session";
import { createNotice, acknowledgeNotice } from "@/lib/data/notices";
import { noticeRecipientProfileIds } from "@/lib/notices/audience";
import { createNotificationForUser } from "@/lib/notifications/create";
import type { NoticeRecord } from "@/types/database";

export async function createNoticeAction(formData: FormData): Promise<{ error?: string } | void> {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!isSchoolAdmin(session.profile.role)) return { error: "Only administrators can publish notices." };

  const title = String(formData.get("title") ?? "").trim();
  if (!title) return { error: "Title is required." };

  const audience = String(formData.get("audience") ?? "all") as NoticeRecord["audience"];
  const classId = String(formData.get("class_id") ?? "") || null;

  let notice;
  try {
    notice = await createNotice({
      schoolId: session.school.id,
      title,
      description: String(formData.get("description") ?? "").trim() || null,
      attachment_url: String(formData.get("attachment_url") ?? "").trim() || null,
      audience,
      class_id: audience === "class" ? classId : null,
      priority: String(formData.get("priority") ?? "normal"),
      requires_acknowledgement: formData.get("requires_acknowledgement") === "on",
      publish_date: new Date().toISOString().slice(0, 10),
      expiry_date: String(formData.get("expiry_date") ?? "") || null,
      created_by: session.profile.id,
    });
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Could not publish notice." };
  }

  await notifyNoticePublished(notice, session.school.id);

  revalidatePath("/notices");
  redirect("/notices");
}

export async function acknowledgeNoticeAction(noticeId: string): Promise<void> {
  const session = await getSession();
  if (!session) redirect("/login");
  await acknowledgeNotice(noticeId, session.profile.id, session.school.id);
  revalidatePath("/notices");
}

async function notifyNoticePublished(notice: NoticeRecord, schoolId: string): Promise<void> {
  const recipients = await noticeRecipientProfileIds(notice);

  for (const profileId of recipients) {
    await createNotificationForUser(profileId, schoolId, {
      title: "New Notice",
      message: notice.title,
      link: "/notices",
      category: "notices",
    });
  }
}
