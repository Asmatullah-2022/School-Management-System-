"use server";

import { revalidatePath } from "next/cache";
import { getSession, isSchoolAdmin } from "@/lib/auth/session";
import { updateGradingSystem } from "@/lib/data/grading";
import { updateSchoolSettings } from "@/lib/data/school-settings";
import { recordAuditLog } from "@/lib/audit/log";
import type { GradeBand } from "@/types/database";

export async function updateSchoolSettingsAction(formData: FormData): Promise<{ error?: string } | void> {
  const session = await getSession();
  if (!session) return { error: "Your session has expired. Please sign in again." };
  if (!isSchoolAdmin(session.profile.role)) return { error: "Only administrators can change document settings." };

  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { error: "School name is required." };

  try {
    await updateSchoolSettings(session.school.id, {
      name,
      logo_url: String(formData.get("logo_url") ?? "").trim() || null,
      address: String(formData.get("address") ?? "").trim() || null,
      district: String(formData.get("district") ?? "").trim() || null,
      province: String(formData.get("province") ?? "").trim() || null,
      phone: String(formData.get("phone") ?? "").trim() || null,
      email: String(formData.get("email") ?? "").trim() || null,
      website: String(formData.get("website") ?? "").trim() || null,
      principal_name: String(formData.get("principal_name") ?? "").trim() || null,
      headteacher_name: String(formData.get("headteacher_name") ?? "").trim() || null,
      principal_signature_url: String(formData.get("principal_signature_url") ?? "").trim() || null,
      school_stamp_url: String(formData.get("school_stamp_url") ?? "").trim() || null,
      document_footer: String(formData.get("document_footer") ?? "").trim() || null,
      certificate_prefix: String(formData.get("certificate_prefix") ?? "CERT").trim() || "CERT",
    });
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Could not save document settings." };
  }

  await recordAuditLog({ schoolId: session.school.id, profileId: session.profile.id, action: "settings.document_settings_updated" });
  revalidatePath("/settings");
}

export async function updateGradingSystemAction(bands: GradeBand[]) {
  const session = await getSession();
  if (!session) return { error: "Your session has expired. Please sign in again." };
  if (!isSchoolAdmin(session.profile.role)) return { error: "Only administrators can change the grading system." };

  const sorted = [...bands].sort((a, b) => b.min - a.min);
  for (const band of sorted) {
    if (!band.grade.trim()) return { error: "Every grade band needs a grade label." };
    if (band.min > band.max) return { error: `"${band.grade}" has a minimum higher than its maximum.` };
  }
  for (let i = 0; i < sorted.length - 1; i++) {
    if (sorted[i].min <= sorted[i + 1].max) {
      return { error: `Grade bands "${sorted[i].grade}" and "${sorted[i + 1].grade}" overlap.` };
    }
  }

  try {
    await updateGradingSystem(bands, session.school.id);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Could not save the grading system." };
  }
  revalidatePath("/settings");
  return { success: true as const };
}
