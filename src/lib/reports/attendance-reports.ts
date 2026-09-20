import type { AttendanceRecord, SchoolClass, Section, Student } from "@/types/database";

export interface AttendanceReportDataset {
  attendance: AttendanceRecord[];
  students: Student[];
  classes: SchoolClass[];
  sections: Section[];
}

const studentName = (id: string, students: Student[]) => students.find((s) => s.id === id)?.full_name ?? "Unknown student";
const classNameOf = (id: string | null | undefined, classes: SchoolClass[]) => classes.find((c) => c.id === id)?.name ?? "—";

export function buildDailyAttendanceReport(data: AttendanceReportDataset, date: string) {
  return data.attendance
    .filter((a) => a.date === date)
    .map((a) => {
      const student = data.students.find((s) => s.id === a.student_id);
      return {
        student: studentName(a.student_id, data.students),
        class: classNameOf(student?.class_id, data.classes),
        section: data.sections.find((s) => s.id === student?.section_id)?.name ?? "—",
        status: a.status,
      };
    });
}

export function buildMonthlyAttendanceReport(data: AttendanceReportDataset, month: number, year: number) {
  const prefix = `${year}-${String(month).padStart(2, "0")}`;
  const inMonth = data.attendance.filter((a) => a.date.startsWith(prefix));
  const byStudent = new Map<string, { present: number; absent: number; late: number; leave: number }>();
  for (const a of inMonth) {
    const entry = byStudent.get(a.student_id) ?? { present: 0, absent: 0, late: 0, leave: 0 };
    entry[a.status as "present" | "absent" | "late" | "leave"] = (entry[a.status as "present" | "absent" | "late" | "leave"] ?? 0) + 1;
    byStudent.set(a.student_id, entry);
  }
  return Array.from(byStudent.entries()).map(([studentId, counts]) => {
    const total = counts.present + counts.absent + counts.late + counts.leave;
    return {
      student: studentName(studentId, data.students),
      present: counts.present,
      absent: counts.absent,
      late: counts.late,
      leave: counts.leave,
      percentage: total ? Math.round(((counts.present + counts.late) / total) * 100) : 0,
    };
  });
}

export function buildStudentAttendanceHistory(data: AttendanceReportDataset, studentId: string) {
  return data.attendance
    .filter((a) => a.student_id === studentId)
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .map((a) => ({ date: a.date, status: a.status, remarks: a.remarks ?? "—" }));
}

export function buildClassAttendanceReport(data: AttendanceReportDataset, date: string) {
  return data.classes.map((c) => {
    const classStudentIds = new Set(data.students.filter((s) => s.class_id === c.id).map((s) => s.id));
    const dayRecords = data.attendance.filter((a) => a.date === date && classStudentIds.has(a.student_id));
    return {
      class: c.name,
      present: dayRecords.filter((a) => a.status === "present").length,
      absent: dayRecords.filter((a) => a.status === "absent").length,
      late: dayRecords.filter((a) => a.status === "late").length,
      leave: dayRecords.filter((a) => a.status === "leave").length,
      total: classStudentIds.size,
    };
  });
}

export function buildLowAttendanceReport(data: AttendanceReportDataset, threshold: number) {
  const byStudent = new Map<string, AttendanceRecord[]>();
  for (const a of data.attendance) {
    if (!byStudent.has(a.student_id)) byStudent.set(a.student_id, []);
    byStudent.get(a.student_id)!.push(a);
  }
  return Array.from(byStudent.entries())
    .map(([studentId, records]) => {
      const percentage = records.length ? Math.round((records.filter((r) => r.status === "present" || r.status === "late").length / records.length) * 100) : 0;
      const student = data.students.find((s) => s.id === studentId);
      return {
        student: studentName(studentId, data.students),
        class: classNameOf(student?.class_id, data.classes),
        totalDays: records.length,
        percentage,
      };
    })
    .filter((r) => r.percentage < threshold)
    .sort((a, b) => a.percentage - b.percentage);
}

export function buildAbsenteeReport(data: AttendanceReportDataset, date: string) {
  return data.attendance
    .filter((a) => a.date === date && a.status === "absent")
    .map((a) => {
      const student = data.students.find((s) => s.id === a.student_id);
      return {
        student: studentName(a.student_id, data.students),
        class: classNameOf(student?.class_id, data.classes),
        contact: student?.contact_number ?? "—",
      };
    });
}
