import "server-only";
import { listStudents } from "@/lib/data/students";
import { listTeachers } from "@/lib/data/teachers";
import { getGuardianProfileIdsForStudent } from "@/lib/data/people";
import type { NoticeRecord } from "@/types/database";

/** Every profile a notice's audience actually reaches — used both to fan
 * out the "new notice" notification and to compute the admin's
 * acknowledged/not-acknowledged counts, so the two can never disagree. */
export async function noticeRecipientProfileIds(notice: Pick<NoticeRecord, "audience" | "class_id">): Promise<Set<string>> {
  const recipients = new Set<string>();

  if (notice.audience === "class" && notice.class_id) {
    const students = (await listStudents()).filter((s) => s.class_id === notice.class_id);
    for (const student of students) {
      if (student.profile_id) recipients.add(student.profile_id);
      for (const profileId of await getGuardianProfileIdsForStudent(student.id)) recipients.add(profileId);
    }
  } else if (notice.audience === "students" || notice.audience === "all") {
    for (const student of await listStudents()) {
      if (student.profile_id) recipients.add(student.profile_id);
    }
  }
  if (notice.audience === "teachers" || notice.audience === "all") {
    for (const teacher of await listTeachers()) {
      if (teacher.profile_id) recipients.add(teacher.profile_id);
    }
  }
  if (notice.audience === "parents" || notice.audience === "all") {
    for (const student of await listStudents()) {
      for (const profileId of await getGuardianProfileIdsForStudent(student.id)) recipients.add(profileId);
    }
  }

  return recipients;
}
