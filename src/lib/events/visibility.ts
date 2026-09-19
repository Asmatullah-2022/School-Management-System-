import type { EventRecord, UserRole } from "@/types/database";

/** Which events a given viewer may see: staff (incl. teachers) see
 * everything; a parent/student only sees events addressed to "all", to
 * their own role-category, or to their (child's) specific class — mirrors
 * the `events_select` RLS policy (0007) so demo mode and real Supabase
 * agree. */
export function visibleEvents(events: EventRecord[], role: UserRole, classIds: string[]): EventRecord[] {
  const isStaff = role === "super_admin" || role === "school_admin" || role === "accountant" || role === "teacher";

  return events.filter((e) => {
    if (isStaff) return true;
    if (!e.audience || e.audience === "all") return true;
    if (e.audience === "students") return role === "student";
    if (e.audience === "parents") return role === "parent";
    if (e.audience === "class") return !!e.class_id && classIds.includes(e.class_id);
    return false;
  });
}
