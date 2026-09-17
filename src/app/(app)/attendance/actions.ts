"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth/session";
import { markAttendance } from "@/lib/data/records";
import type { AttendanceRecord, AttendanceStatus } from "@/types/database";

export async function saveAttendanceAction(
  date: string,
  entries: { studentId: string; classId: string; sectionId: string; status: AttendanceStatus }[]
) {
  const session = await getSession();
  if (!session) throw new Error("Not authenticated");

  const records: AttendanceRecord[] = entries.map((e) => ({
    id: `att-${e.studentId}-${date}`,
    school_id: session.school.id,
    student_id: e.studentId,
    class_id: e.classId,
    section_id: e.sectionId,
    date,
    status: e.status,
  }));

  await markAttendance(records);
  revalidatePath("/attendance");
  revalidatePath("/dashboard");
  return { success: true };
}
