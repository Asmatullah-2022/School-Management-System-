import type { NoticeRecord, Student, UserRole } from "@/types/database";

/** Which notices a given viewer may see: staff see everything; a
 * parent/student only sees notices addressed to "all", to their own
 * role-category, or to their (child's) specific class — and never an
 * already-expired notice. Mirrors the audience the notice was published
 * with (`notices.audience` / `notices.class_id`). */
export function visibleNotices(notices: NoticeRecord[], role: UserRole, classIds: string[]): NoticeRecord[] {
  const todayISO = new Date().toISOString().slice(0, 10);
  const isStaff = role === "super_admin" || role === "school_admin" || role === "teacher" || role === "accountant";

  return notices
    .filter((n) => !n.expiry_date || n.expiry_date >= todayISO)
    .filter((n) => {
      if (isStaff) return true;
      if (n.audience === "all") return true;
      if (n.audience === "students" && role === "student") return true;
      if (n.audience === "parents" && role === "parent") return true;
      if (n.audience === "class") return !!n.class_id && classIds.includes(n.class_id);
      return false;
    })
    .sort((a, b) => (a.publish_date < b.publish_date ? 1 : -1));
}

export function classIdsForStudents(students: Student[]): string[] {
  return Array.from(new Set(students.map((s) => s.class_id).filter((id): id is string => !!id)));
}
