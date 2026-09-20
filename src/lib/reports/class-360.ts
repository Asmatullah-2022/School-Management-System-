// Class 360 — a class/section-level rollup built the same way as
// Student 360: by aggregating over already-stored per-record data
// (attendance rows, Result rows, fee charges) rather than recomputing
// grading, attendance percentage, or fee balances a second time.
import type {
  AttendanceRecord,
  BookIssue,
  Exam,
  FeeRecord,
  HomeworkAssignment,
  HomeworkRecord,
  Result,
  SchoolClass,
  Section,
  Student,
  StudentTransportAssignment,
} from "@/types/database";

export interface Class360Context {
  classes: SchoolClass[];
  sections: Section[];
  students: Student[];
  attendance: AttendanceRecord[];
  exams: Exam[];
  results: Result[];
  homework: HomeworkRecord[];
  homeworkAssignments: HomeworkAssignment[];
  fees: FeeRecord[];
  bookIssues: BookIssue[];
  transportAssignments: StudentTransportAssignment[];
}

export function buildClass360(classId: string, sectionId: string | null, ctx: Class360Context) {
  const klass = ctx.classes.find((c) => c.id === classId);
  const section = sectionId ? ctx.sections.find((s) => s.id === sectionId) : undefined;
  const students = ctx.students.filter((s) => s.class_id === classId && (!sectionId || s.section_id === sectionId) && s.status !== "archived");
  const studentIds = new Set(students.map((s) => s.id));

  const classAttendance = ctx.attendance.filter((a) => studentIds.has(a.student_id));
  const attendance = {
    present: classAttendance.filter((a) => a.status === "present").length,
    absent: classAttendance.filter((a) => a.status === "absent").length,
    late: classAttendance.filter((a) => a.status === "late").length,
    leave: classAttendance.filter((a) => a.status === "leave").length,
    total: classAttendance.length,
    percentage: classAttendance.length
      ? Math.round((classAttendance.filter((a) => a.status === "present" || a.status === "late").length / classAttendance.length) * 100)
      : 0,
  };

  const publishedExams = ctx.exams.filter((e) => e.status === "published");
  const classResults = ctx.results.filter((r) => studentIds.has(r.student_id) && publishedExams.some((e) => e.id === r.exam_id));
  const academic = {
    resultsRecorded: classResults.length,
    averagePercentage: classResults.length ? Math.round(classResults.reduce((s, r) => s + r.percentage, 0) / classResults.length) : 0,
    passCount: classResults.filter((r) => r.is_pass).length,
    failCount: classResults.filter((r) => !r.is_pass).length,
    passRate: classResults.length ? Math.round((classResults.filter((r) => r.is_pass).length / classResults.length) * 100) : 0,
  };

  const classHomework = ctx.homework.filter((h) => h.class_id === classId && (!h.section_id || h.section_id === sectionId));
  const expectedSubmissions = classHomework.length * students.length;
  const actualSubmissions = ctx.homeworkAssignments.filter(
    (a) => studentIds.has(a.student_id) && classHomework.some((h) => h.id === a.homework_id) && a.status !== "pending"
  ).length;
  const homework = {
    assignedCount: classHomework.length,
    completionRate: expectedSubmissions ? Math.round((actualSubmissions / expectedSubmissions) * 100) : 0,
  };

  const classFees = ctx.fees.filter((f) => studentIds.has(f.student_id));
  const fees = {
    expected: classFees.reduce((s, f) => s + (f.amount - f.discount), 0),
    collected: classFees.reduce((s, f) => s + f.paid_amount, 0),
    outstanding: classFees.reduce((s, f) => s + f.balance, 0),
  };

  const classIssues = ctx.bookIssues.filter((i) => studentIds.has(i.student_id ?? ""));
  const library = {
    currentlyIssued: classIssues.filter((i) => i.status === "issued").length,
    overdue: classIssues.filter((i) => i.status === "issued" && i.due_date < new Date().toISOString().slice(0, 10)).length,
  };

  const transport = {
    assignedCount: ctx.transportAssignments.filter((a) => studentIds.has(a.student_id) && a.status === "active").length,
  };

  return {
    className: klass?.name ?? "—",
    sectionName: section?.name ?? null,
    studentCount: students.length,
    students,
    attendance,
    academic,
    homework,
    fees,
    library,
    transport,
  };
}
