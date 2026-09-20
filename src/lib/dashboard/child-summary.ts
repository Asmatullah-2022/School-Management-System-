// Pure composition of a single student's portal dashboard summary, shared
// by the Parent dashboard (one call per child), the Student dashboard (one
// call for the signed-in student), and the My Children page — so every
// place that shows "your child at a glance" agrees with the others.
import type {
  AttendanceRecord,
  Exam,
  ExamSubject,
  FeeRecord,
  HomeworkAssignment,
  HomeworkRecord,
  Period,
  Result,
  SchoolClass,
  Section,
  Student,
  Subject,
  TeacherDirectoryEntry,
  TimetableEntry,
} from "@/types/database";

export interface ChildSummaryContext {
  classes: SchoolClass[];
  sections: Section[];
  subjects: Subject[];
  teachers: TeacherDirectoryEntry[];
  periods: Period[];
  timetableEntries: TimetableEntry[];
  attendance: AttendanceRecord[];
  homework: HomeworkRecord[];
  homeworkAssignments: HomeworkAssignment[];
  exams: Exam[];
  examSubjects: ExamSubject[];
  results: Result[];
  fees: FeeRecord[];
}

export interface ChildSummary {
  student: Student;
  className: string;
  sectionName: string;
  todayAttendanceStatus: string | null;
  attendancePercentage: number;
  todayEntries: TimetableEntry[];
  todaySchedule: { entry: TimetableEntry; period: Period | undefined; subjectName: string; teacherName: string }[];
  nextClass: { entry: TimetableEntry; period: Period } | null;
  pendingHomeworkCount: number;
  pendingHomework: { homework: HomeworkRecord; submission: HomeworkAssignment | undefined }[];
  latestResult: { exam: Exam; result: Result } | null;
  upcomingExams: { exam: Exam; examSubject: ExamSubject; subjectName: string }[];
  outstandingBalance: number;
}

export function buildChildSummary(student: Student, ctx: ChildSummaryContext): ChildSummary {
  const today = new Date();
  const todayISO = today.toISOString().slice(0, 10);
  const todayDow = today.getDay();
  const nowMinutes = today.getHours() * 60 + today.getMinutes();

  const className = ctx.classes.find((c) => c.id === student.class_id)?.name ?? "—";
  const sectionName = ctx.sections.find((s) => s.id === student.section_id)?.name ?? "—";

  const studentAttendance = ctx.attendance.filter((a) => a.student_id === student.id);
  const todayAttendanceStatus = studentAttendance.find((a) => a.date === todayISO)?.status ?? null;
  const attendancePercentage = studentAttendance.length
    ? Math.round((studentAttendance.filter((a) => a.status === "present" || a.status === "late").length / studentAttendance.length) * 100)
    : 0;

  const todayEntries = student.section_id
    ? ctx.timetableEntries.filter((e) => e.section_id === student.section_id && e.day_of_week === todayDow)
    : [];
  const todaySchedule = todayEntries
    .map((entry) => ({
      entry,
      period: ctx.periods.find((p) => p.id === entry.period_id),
      subjectName: ctx.subjects.find((s) => s.id === entry.subject_id)?.name ?? "—",
      teacherName: ctx.teachers.find((t) => t.id === entry.teacher_id)?.full_name ?? "—",
    }))
    .sort((a, b) => (a.period?.sort_order ?? 0) - (b.period?.sort_order ?? 0));

  const toMinutes = (t?: string | null) => {
    if (!t) return null;
    const [h, m] = t.split(":").map(Number);
    return h * 60 + m;
  };
  const nextClass = todayEntries
    .map((entry) => ({ entry, period: ctx.periods.find((p) => p.id === entry.period_id) }))
    .filter((x): x is { entry: TimetableEntry; period: Period } => !!x.period && toMinutes(x.period.start_time) !== null)
    .filter((x) => toMinutes(x.period.start_time)! > nowMinutes)
    .sort((a, b) => toMinutes(a.period.start_time)! - toMinutes(b.period.start_time)!)[0] ?? null;

  const classHomework = student.class_id
    ? ctx.homework.filter((h) => h.class_id === student.class_id && (!h.section_id || h.section_id === student.section_id))
    : [];
  const pendingHomework = classHomework
    .map((homework) => ({ homework, submission: ctx.homeworkAssignments.find((a) => a.homework_id === homework.id && a.student_id === student.id) }))
    .filter((x) => !x.submission || x.submission.status === "pending" || x.submission.status === "late")
    .sort((a, b) => (a.homework.due_date < b.homework.due_date ? -1 : 1));

  const publishedExams = ctx.exams.filter((e) => e.status === "published");
  const myResults = ctx.results
    .filter((r) => r.student_id === student.id && publishedExams.some((e) => e.id === r.exam_id))
    .map((result) => ({ result, exam: publishedExams.find((e) => e.id === result.exam_id)! }))
    .sort((a, b) => (a.exam.end_date < b.exam.end_date ? 1 : -1));
  const latestResult = myResults[0] ? { exam: myResults[0].exam, result: myResults[0].result } : null;

  const upcomingExams = ctx.examSubjects
    .filter(
      (es) =>
        es.class_id === student.class_id &&
        (!es.section_id || es.section_id === student.section_id) &&
        es.exam_date &&
        es.exam_date >= todayISO
    )
    .map((examSubject) => ({
      examSubject,
      exam: ctx.exams.find((e) => e.id === examSubject.exam_id)!,
      subjectName: ctx.subjects.find((s) => s.id === examSubject.subject_id)?.name ?? "—",
    }))
    .filter((x) => x.exam && x.exam.status !== "draft" && x.exam.status !== "archived")
    .sort((a, b) => (a.examSubject.exam_date! < b.examSubject.exam_date! ? -1 : 1))
    .slice(0, 5);

  const outstandingBalance = ctx.fees.filter((f) => f.student_id === student.id).reduce((s, f) => s + f.balance, 0);

  return {
    student,
    className,
    sectionName,
    todayAttendanceStatus,
    attendancePercentage,
    todayEntries,
    todaySchedule,
    nextClass,
    pendingHomeworkCount: pendingHomework.length,
    pendingHomework: pendingHomework.slice(0, 5),
    latestResult,
    upcomingExams,
    outstandingBalance,
  };
}
