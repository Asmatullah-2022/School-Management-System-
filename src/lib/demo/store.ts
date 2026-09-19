import "server-only";
import { randomUUID } from "crypto";
import {
  demoAssignments,
  demoAttendance,
  demoClasses,
  demoDiscounts,
  demoEvents,
  demoExams,
  demoExamSubjects,
  demoFeeDiscounts,
  demoFinancialSettings,
  demoFeePeriods,
  demoFees,
  demoFeeStructures,
  demoEventAttendance,
  demoEventResponses,
  demoHomework,
  demoHomeworkAssignments,
  demoLeaveRequests,
  demoMarkRevisions,
  demoNoticeAcknowledgements,
  demoNotificationPreferences,
  demoMarks,
  demoNotices,
  demoPaymentAllocations,
  demoPayments,
  demoPeriods,
  demoRefunds,
  demoResults,
  demoScholarships,
  demoSchool,
  demoSections,
  demoStudents,
  demoSubjects,
  demoTeachers,
  demoTimetableEntries,
} from "./data";
import { findTimetableConflict, type TimetableCandidate } from "@/lib/timetable/conflicts";
import { findExamScheduleConflict, type ExamScheduleCandidate } from "@/lib/exams/conflicts";
import { computeStudentResult, rankByPercentage } from "@/lib/results/calculate";
import type {
  AttendanceRecord,
  Discount,
  Exam,
  ExamSubject,
  EventRecord,
  FeeDiscount,
  FeePeriod,
  FeeRecord,
  FeeStructure,
  FinancialSettings,
  EventAttendanceRecord,
  EventResponse,
  GradeBand,
  HomeworkAssignment,
  HomeworkRecord,
  LeaveRequest,
  Mark,
  MarkRevision,
  NoticeAcknowledgement,
  NoticeRecord,
  Notification,
  NotificationPreferences,
  Payment,
  PaymentAllocation,
  Period,
  Refund,
  Result,
  Scholarship,
  School,
  SchoolClass,
  Section,
  Student,
  Subject,
  SubjectAssignment,
  Teacher,
  TimetableEntry,
} from "@/types/database";

/**
 * In-memory data store used by DEMO MODE only. It lives for the lifetime of
 * the Node process (i.e. the whole dev/preview session) so CRUD screens are
 * fully interactive without a database, but it resets on server restart and
 * is NOT shared across serverless instances. Swap NEXT_PUBLIC_DEMO_MODE off
 * and configure Supabase env vars for real persistence.
 */
const globalForDemo = globalThis as unknown as {
  __smsDemoStore?: {
    students: Student[];
    teachers: Teacher[];
    classes: SchoolClass[];
    sections: Section[];
    subjects: Subject[];
    attendance: AttendanceRecord[];
    fees: FeeRecord[];
    feeStructures: FeeStructure[];
    feePeriods: FeePeriod[];
    discounts: Discount[];
    scholarships: Scholarship[];
    feeDiscounts: FeeDiscount[];
    payments: Payment[];
    paymentAllocations: PaymentAllocation[];
    refunds: Refund[];
    financialSettings: FinancialSettings;
    notifications: Notification[];
    homework: HomeworkRecord[];
    homeworkAssignments: HomeworkAssignment[];
    leaveRequests: LeaveRequest[];
    eventResponses: EventResponse[];
    eventAttendance: EventAttendanceRecord[];
    noticeAcknowledgements: NoticeAcknowledgement[];
    notificationPreferences: NotificationPreferences[];
    notices: NoticeRecord[];
    events: EventRecord[];
    periods: Period[];
    assignments: SubjectAssignment[];
    timetable: TimetableEntry[];
    school: School;
    exams: Exam[];
    examSubjects: ExamSubject[];
    marks: Mark[];
    results: Result[];
    markRevisions: MarkRevision[];
  };
};

function initStore() {
  return {
    students: [...demoStudents],
    teachers: [...demoTeachers],
    classes: [...demoClasses],
    sections: [...demoSections],
    subjects: [...demoSubjects],
    attendance: [...demoAttendance],
    fees: [...demoFees],
    feeStructures: [...demoFeeStructures],
    feePeriods: [...demoFeePeriods],
    discounts: [...demoDiscounts],
    scholarships: [...demoScholarships],
    feeDiscounts: [...demoFeeDiscounts],
    payments: [...demoPayments],
    paymentAllocations: [...demoPaymentAllocations],
    refunds: [...demoRefunds],
    financialSettings: { ...demoFinancialSettings },
    notifications: [],
    homework: [...demoHomework],
    homeworkAssignments: [...demoHomeworkAssignments],
    leaveRequests: [...demoLeaveRequests],
    eventResponses: [...demoEventResponses],
    eventAttendance: [...demoEventAttendance],
    noticeAcknowledgements: [...demoNoticeAcknowledgements],
    notificationPreferences: [...demoNotificationPreferences],
    notices: [...demoNotices],
    events: [...demoEvents],
    periods: [...demoPeriods],
    assignments: [...demoAssignments],
    timetable: [...demoTimetableEntries],
    school: { ...demoSchool },
    exams: [...demoExams],
    examSubjects: [...demoExamSubjects],
    marks: [...demoMarks],
    results: [...demoResults],
    markRevisions: [...demoMarkRevisions],
  };
}

const store = globalForDemo.__smsDemoStore ?? (globalForDemo.__smsDemoStore = initStore());

export const demoStore = {
  listStudents: () => store.students.filter((s) => s.status !== "archived"),
  getStudent: (id: string) => store.students.find((s) => s.id === id),
  createStudent: (data: Omit<Student, "id" | "school_id" | "status">) => {
    const student: Student = {
      ...data,
      id: randomUUID(),
      school_id: store.students[0]?.school_id ?? "demo",
      status: "active",
    };
    store.students.unshift(student);
    return student;
  },
  updateStudent: (id: string, data: Partial<Student>) => {
    const idx = store.students.findIndex((s) => s.id === id);
    if (idx === -1) return undefined;
    store.students[idx] = { ...store.students[idx], ...data };
    return store.students[idx];
  },
  deleteStudent: (id: string) => {
    const idx = store.students.findIndex((s) => s.id === id);
    if (idx === -1) return false;
    store.students[idx].status = "archived";
    return true;
  },

  listTeachers: () => store.teachers.filter((t) => t.status !== "archived"),
  getTeacher: (id: string) => store.teachers.find((t) => t.id === id),
  createTeacher: (data: Omit<Teacher, "id" | "school_id" | "status">) => {
    const teacher: Teacher = {
      ...data,
      id: randomUUID(),
      school_id: store.teachers[0]?.school_id ?? "demo",
      status: "active",
    };
    store.teachers.unshift(teacher);
    return teacher;
  },
  updateTeacher: (id: string, data: Partial<Teacher>) => {
    const idx = store.teachers.findIndex((t) => t.id === id);
    if (idx === -1) return undefined;
    store.teachers[idx] = { ...store.teachers[idx], ...data };
    return store.teachers[idx];
  },
  deleteTeacher: (id: string) => {
    const idx = store.teachers.findIndex((t) => t.id === id);
    if (idx === -1) return false;
    store.teachers[idx].status = "archived";
    return true;
  },

  listClasses: () => store.classes,
  listSections: () => store.sections,

  listSubjects: () => store.subjects.filter((s) => s.status !== "archived"),
  getSubject: (id: string) => store.subjects.find((s) => s.id === id),
  createSubject: (data: Omit<Subject, "id" | "school_id" | "status">) => {
    const duplicate = store.subjects.find(
      (s) => s.status === "active" && s.name.trim().toLowerCase() === data.name.trim().toLowerCase()
    );
    if (duplicate) throw new Error(`A subject named "${data.name}" already exists.`);
    const subject: Subject = {
      ...data,
      id: randomUUID(),
      school_id: store.subjects[0]?.school_id ?? "demo",
      status: "active",
    };
    store.subjects.unshift(subject);
    return subject;
  },
  updateSubject: (id: string, data: Partial<Subject>) => {
    const idx = store.subjects.findIndex((s) => s.id === id);
    if (idx === -1) return undefined;
    if (data.name) {
      const duplicate = store.subjects.find(
        (s) => s.id !== id && s.status === "active" && s.name.trim().toLowerCase() === data.name!.trim().toLowerCase()
      );
      if (duplicate) throw new Error(`A subject named "${data.name}" already exists.`);
    }
    store.subjects[idx] = { ...store.subjects[idx], ...data };
    return store.subjects[idx];
  },
  archiveSubject: (id: string) => {
    const idx = store.subjects.findIndex((s) => s.id === id);
    if (idx === -1) return false;
    store.subjects[idx].status = "archived";
    return true;
  },

  listPeriods: () => store.periods.filter((p) => p.status !== "archived").sort((a, b) => a.sort_order - b.sort_order),
  getPeriod: (id: string) => store.periods.find((p) => p.id === id),
  createPeriod: (data: Omit<Period, "id" | "school_id" | "status">) => {
    const duplicate = store.periods.find((p) => p.status === "active" && p.period_number === data.period_number);
    if (duplicate) throw new Error(`Period number ${data.period_number} already exists.`);
    const period: Period = {
      ...data,
      id: randomUUID(),
      school_id: store.periods[0]?.school_id ?? "demo",
      status: "active",
    };
    store.periods.push(period);
    return period;
  },
  updatePeriod: (id: string, data: Partial<Period>) => {
    const idx = store.periods.findIndex((p) => p.id === id);
    if (idx === -1) return undefined;
    store.periods[idx] = { ...store.periods[idx], ...data };
    return store.periods[idx];
  },
  archivePeriod: (id: string) => {
    const idx = store.periods.findIndex((p) => p.id === id);
    if (idx === -1) return false;
    store.periods[idx].status = "archived";
    return true;
  },

  listAssignments: () => store.assignments.filter((a) => a.status !== "inactive"),
  getAssignment: (id: string) => store.assignments.find((a) => a.id === id),
  createAssignment: (data: Omit<SubjectAssignment, "id" | "school_id" | "status">) => {
    const duplicate = store.assignments.find(
      (a) =>
        a.status === "active" &&
        a.class_id === data.class_id &&
        a.section_id === data.section_id &&
        a.subject_id === data.subject_id
    );
    if (duplicate) {
      throw new Error(
        "This subject is already assigned to this class/section. Remove the existing assignment first."
      );
    }
    const assignment: SubjectAssignment = {
      ...data,
      id: randomUUID(),
      school_id: store.assignments[0]?.school_id ?? "demo",
      status: "active",
    };
    store.assignments.push(assignment);
    return assignment;
  },
  updateAssignment: (id: string, data: Partial<SubjectAssignment>) => {
    const idx = store.assignments.findIndex((a) => a.id === id);
    if (idx === -1) return undefined;
    const next = { ...store.assignments[idx], ...data };
    const duplicate = store.assignments.find(
      (a) =>
        a.id !== id &&
        a.status === "active" &&
        a.class_id === next.class_id &&
        a.section_id === next.section_id &&
        a.subject_id === next.subject_id
    );
    if (duplicate) {
      throw new Error(
        "This subject is already assigned to this class/section. Remove the existing assignment first."
      );
    }
    store.assignments[idx] = next;
    return store.assignments[idx];
  },
  deleteAssignment: (id: string) => {
    const idx = store.assignments.findIndex((a) => a.id === id);
    if (idx === -1) return false;
    store.assignments.splice(idx, 1);
    return true;
  },

  listTimetableEntries: () => store.timetable,
  getTimetableEntry: (id: string) => store.timetable.find((t) => t.id === id),
  saveTimetableEntry: (candidate: TimetableCandidate) => {
    const conflict = findTimetableConflict(store.timetable, candidate, {
      teachers: store.teachers,
      sections: store.sections,
      classes: store.classes,
      periods: store.periods,
    });
    if (conflict) throw new Error(conflict);

    if (candidate.id) {
      const idx = store.timetable.findIndex((t) => t.id === candidate.id);
      if (idx === -1) throw new Error("Timetable entry not found.");
      store.timetable[idx] = { ...store.timetable[idx], ...candidate, id: candidate.id };
      return store.timetable[idx];
    }
    const entry: TimetableEntry = {
      ...candidate,
      id: randomUUID(),
      school_id: store.timetable[0]?.school_id ?? "demo",
    };
    store.timetable.push(entry);
    return entry;
  },
  deleteTimetableEntry: (id: string) => {
    const idx = store.timetable.findIndex((t) => t.id === id);
    if (idx === -1) return false;
    store.timetable.splice(idx, 1);
    return true;
  },

  getSchool: () => store.school,
  updateGradingSystem: (bands: GradeBand[]) => {
    store.school.grading_system = bands;
    return store.school;
  },

  listExams: () => store.exams.filter((e) => e.status !== "archived"),
  getExam: (id: string) => store.exams.find((e) => e.id === id),
  createExam: (data: Omit<Exam, "id" | "school_id" | "status">, createdBy: string) => {
    const exam: Exam = {
      ...data,
      id: randomUUID(),
      school_id: store.exams[0]?.school_id ?? store.school.id,
      status: "draft",
      created_by: createdBy,
    };
    store.exams.unshift(exam);
    return exam;
  },
  updateExam: (id: string, data: Partial<Exam>) => {
    const idx = store.exams.findIndex((e) => e.id === id);
    if (idx === -1) return undefined;
    if (store.exams[idx].status === "published" && data.status !== "archived") {
      throw new Error("This exam is already published and its schedule/details can no longer be edited.");
    }
    store.exams[idx] = { ...store.exams[idx], ...data };
    return store.exams[idx];
  },
  archiveExam: (id: string) => {
    const idx = store.exams.findIndex((e) => e.id === id);
    if (idx === -1) return false;
    store.exams[idx].status = "archived";
    return true;
  },
  publishExam: (id: string, publishedBy: string) => {
    const exam = store.exams.find((e) => e.id === id);
    if (!exam) throw new Error("Exam not found.");
    const examSubjectIds = new Set(store.examSubjects.filter((es) => es.exam_id === id).map((es) => es.id));
    const examMarks = store.marks.filter((m) => examSubjectIds.has(m.exam_subject_id));
    const notVerified = examMarks.filter((m) => m.status !== "verified" && m.status !== "published");
    if (notVerified.length > 0) {
      throw new Error("All marks must be verified before this exam can be published.");
    }
    const now = new Date().toISOString();
    for (const m of examMarks) {
      if (m.status !== "published") {
        m.status = "published";
        m.published_at = now;
      }
    }
    exam.status = "published";
    exam.published_at = now;
    exam.published_by = publishedBy;
    demoStore.computeResultsForExam(id);
    return exam;
  },

  listExamSubjects: () => store.examSubjects,
  getExamSubject: (id: string) => store.examSubjects.find((es) => es.id === id),
  saveExamSchedule: (candidate: ExamScheduleCandidate & { total_marks: number; passing_marks: number; start_time?: string | null; end_time?: string | null }) => {
    const exam = store.exams.find((e) => e.id === candidate.exam_id);
    if (exam?.status === "published") {
      throw new Error("This exam is already published; its schedule can no longer be changed.");
    }
    const conflict = findExamScheduleConflict(store.examSubjects, candidate, {
      classes: store.classes,
      sections: store.sections,
      teachers: store.teachers,
    });
    if (conflict) throw new Error(conflict);

    if (candidate.id) {
      const idx = store.examSubjects.findIndex((es) => es.id === candidate.id);
      if (idx === -1) throw new Error("Exam schedule entry not found.");
      store.examSubjects[idx] = { ...store.examSubjects[idx], ...candidate, id: candidate.id };
      return store.examSubjects[idx];
    }
    const row: ExamSubject = { ...candidate, id: randomUUID(), school_id: store.school.id };
    store.examSubjects.push(row);
    return row;
  },
  deleteExamSchedule: (id: string) => {
    const idx = store.examSubjects.findIndex((es) => es.id === id);
    if (idx === -1) return false;
    const hasMarks = store.marks.some((m) => m.exam_subject_id === id);
    if (hasMarks) throw new Error("Cannot remove a scheduled paper that already has marks entered.");
    store.examSubjects.splice(idx, 1);
    return true;
  },

  listMarks: () => store.marks,
  getMark: (id: string) => store.marks.find((m) => m.id === id),
  saveMarksBatch: (
    examSubjectId: string,
    rows: { student_id: string; obtained_marks: number }[],
    status: "draft" | "submitted",
    actorProfileId: string
  ) => {
    const examSubject = store.examSubjects.find((es) => es.id === examSubjectId);
    if (!examSubject) throw new Error("Exam schedule entry not found.");
    for (const row of rows) {
      if (row.obtained_marks < 0 || row.obtained_marks > examSubject.total_marks) {
        throw new Error(`Obtained marks must be between 0 and ${examSubject.total_marks}.`);
      }
    }
    const now = new Date().toISOString();
    const saved: Mark[] = [];
    for (const row of rows) {
      const idx = store.marks.findIndex((m) => m.exam_subject_id === examSubjectId && m.student_id === row.student_id);
      if (idx === -1) {
        const mark: Mark = {
          id: randomUUID(),
          school_id: store.school.id,
          exam_subject_id: examSubjectId,
          student_id: row.student_id,
          obtained_marks: row.obtained_marks,
          status,
          entered_by: actorProfileId,
          submitted_at: status === "submitted" ? now : null,
          submitted_by: status === "submitted" ? actorProfileId : null,
        };
        store.marks.push(mark);
        saved.push(mark);
      } else {
        const existing = store.marks[idx];
        if (existing.status === "published") {
          throw new Error("These marks are already published and cannot be edited here.");
        }
        if (existing.status === "verified") {
          throw new Error("These marks have already been verified. Ask an administrator to reopen them first.");
        }
        existing.obtained_marks = row.obtained_marks;
        existing.status = status;
        if (status === "submitted") {
          existing.submitted_at = now;
          existing.submitted_by = actorProfileId;
        }
        saved.push(existing);
      }
    }
    return saved;
  },
  verifyMarksForExamSubject: (examSubjectId: string, verifiedBy: string) => {
    const now = new Date().toISOString();
    const rows = store.marks.filter((m) => m.exam_subject_id === examSubjectId);
    const unsubmitted = rows.filter((m) => m.status === "draft");
    if (unsubmitted.length > 0) {
      throw new Error("All students must have submitted marks before this paper can be verified.");
    }
    for (const m of rows) {
      if (m.status === "submitted") {
        m.status = "verified";
        m.verified_at = now;
        m.verified_by = verifiedBy;
      }
    }
    return rows;
  },
  reopenMarksForExamSubject: (examSubjectId: string) => {
    const rows = store.marks.filter((m) => m.exam_subject_id === examSubjectId && m.status !== "published");
    for (const m of rows) {
      m.status = "draft";
      m.verified_at = null;
      m.verified_by = null;
    }
    return rows;
  },
  revisePublishedMark: (markId: string, newMarks: number, reason: string, actorProfileId: string) => {
    const mark = store.marks.find((m) => m.id === markId);
    if (!mark) throw new Error("Mark not found.");
    if (mark.status !== "published") throw new Error("Only a published mark requires a recorded revision.");
    if (!reason.trim()) throw new Error("A reason is required to change a published mark.");
    const examSubject = store.examSubjects.find((es) => es.id === mark.exam_subject_id);
    if (examSubject && (newMarks < 0 || newMarks > examSubject.total_marks)) {
      throw new Error(`Obtained marks must be between 0 and ${examSubject.total_marks}.`);
    }
    store.markRevisions.push({
      id: randomUUID(),
      school_id: store.school.id,
      mark_id: mark.id,
      old_obtained_marks: mark.obtained_marks,
      new_obtained_marks: newMarks,
      reason: reason.trim(),
      changed_by: actorProfileId,
      created_at: new Date().toISOString(),
    });
    mark.obtained_marks = newMarks;
    demoStore.computeResultsForExam(
      store.examSubjects.find((es) => es.id === mark.exam_subject_id)?.exam_id ?? ""
    );
    return mark;
  },
  listMarkRevisions: (markId?: string) => (markId ? store.markRevisions.filter((r) => r.mark_id === markId) : store.markRevisions),

  listResults: () => store.results,
  computeResultsForExam: (examId: string) => {
    const examSubjects = store.examSubjects.filter((es) => es.exam_id === examId);
    const examSubjectIds = new Set(examSubjects.map((es) => es.id));
    const relevantMarks = store.marks.filter((m) => examSubjectIds.has(m.exam_subject_id));
    const studentIds = Array.from(new Set(relevantMarks.map((m) => m.student_id)));
    const bands = store.school.grading_system ?? [];

    const computed = studentIds.map((studentId) => {
      const subjectMarks = relevantMarks
        .filter((m) => m.student_id === studentId)
        .map((m) => {
          const es = examSubjects.find((e) => e.id === m.exam_subject_id)!;
          return { obtained: m.obtained_marks, total: es.total_marks, passing: es.passing_marks };
        });
      const result = computeStudentResult(subjectMarks, bands);
      return { student_id: studentId, ...result };
    });

    const ranks = rankByPercentage(computed);

    for (const c of computed) {
      const idx = store.results.findIndex((r) => r.exam_id === examId && r.student_id === c.student_id);
      const row: Result = {
        id: idx === -1 ? randomUUID() : store.results[idx].id,
        school_id: store.school.id,
        exam_id: examId,
        student_id: c.student_id,
        total_obtained: c.total_obtained,
        total_marks: c.total_marks,
        percentage: c.percentage,
        grade: c.grade,
        is_pass: c.is_pass,
        passed_subjects: c.passed_subjects,
        failed_subjects: c.failed_subjects,
        class_rank: ranks.get(c.student_id) ?? null,
      };
      if (idx === -1) store.results.push(row);
      else store.results[idx] = row;
    }
    return store.results.filter((r) => r.exam_id === examId);
  },

  listAttendance: () => store.attendance,
  markAttendance: (records: AttendanceRecord[]) => {
    for (const rec of records) {
      const idx = store.attendance.findIndex(
        (a) => a.student_id === rec.student_id && a.date === rec.date
      );
      if (idx === -1) store.attendance.push(rec);
      else store.attendance[idx] = rec;
    }
  },
  // -------------------------------------------------------------------
  // PHASE 5 — FEES / FINANCE
  // -------------------------------------------------------------------
  listFees: () => store.fees,
  getFee: (id: string) => store.fees.find((f) => f.id === id),

  recomputeFeeStatus(fee: FeeRecord): FeeRecord {
    fee.balance = fee.amount - fee.discount - fee.paid_amount;
    if (fee.balance <= 0) fee.status = "paid";
    else if (fee.paid_amount > 0) fee.status = "partial";
    else if (new Date(fee.due_date) < new Date()) fee.status = "overdue";
    else fee.status = "unpaid";
    return fee;
  },

  listFeeStructures: () => store.feeStructures,
  getFeeStructure: (id: string) => store.feeStructures.find((f) => f.id === id),
  createFeeStructure: (data: Omit<FeeStructure, "id" | "school_id" | "is_active">) => {
    const structure: FeeStructure = { ...data, id: randomUUID(), school_id: store.school.id, is_active: true };
    store.feeStructures.unshift(structure);
    return structure;
  },
  updateFeeStructure: (id: string, data: Partial<FeeStructure>) => {
    const idx = store.feeStructures.findIndex((f) => f.id === id);
    if (idx === -1) return undefined;
    store.feeStructures[idx] = { ...store.feeStructures[idx], ...data };
    return store.feeStructures[idx];
  },
  duplicateFeeStructure: (id: string) => {
    const source = store.feeStructures.find((f) => f.id === id);
    if (!source) return undefined;
    const copy: FeeStructure = { ...source, id: randomUUID(), name: `${source.name} (Copy)` };
    store.feeStructures.unshift(copy);
    return copy;
  },

  listFeePeriods: () => store.feePeriods,
  ensureFeePeriod: (month: number, year: number, name: string): FeePeriod => {
    let period = store.feePeriods.find((p) => p.month === month && p.year === year);
    if (!period) {
      period = {
        id: randomUUID(),
        school_id: store.school.id,
        academic_session_id: null,
        name,
        month,
        year,
        start_date: `${year}-${String(month).padStart(2, "0")}-01`,
        end_date: new Date(year, month, 0).toISOString().slice(0, 10),
      };
      store.feePeriods.push(period);
    }
    return period;
  },

  /** Generates fee charges for a set of students, skipping any that already exist (duplicate-proof). */
  generateFeeCharges: (params: {
    studentIds: string[];
    feeStructureId: string;
    feePeriodId: string | null;
    dueDate: string;
    createdBy?: string;
  }): { created: FeeRecord[]; skipped: number } => {
    const structure = store.feeStructures.find((f) => f.id === params.feeStructureId);
    if (!structure) throw new Error("Fee structure not found.");
    const created: FeeRecord[] = [];
    let skipped = 0;

    for (const studentId of params.studentIds) {
      const exists = store.fees.some(
        (f) =>
          f.student_id === studentId &&
          f.fee_structure_id === params.feeStructureId &&
          (params.feePeriodId ? f.fee_period_id === params.feePeriodId : f.fee_period_id == null)
      );
      if (exists) {
        skipped++;
        continue;
      }
      const student = store.students.find((s) => s.id === studentId);
      const applicableDiscounts = store.discounts.filter(
        (d) =>
          d.is_active &&
          (d.scope === "school" ||
            (d.scope === "class" && d.class_id === student?.class_id) ||
            (d.scope === "section" && d.section_id === student?.section_id) ||
            (d.scope === "student" && d.student_id === studentId))
      );
      const approvedScholarships = store.scholarships.filter((s) => s.student_id === studentId && s.status === "approved");

      let discount = 0;
      const fee: FeeRecord = {
        id: randomUUID(),
        school_id: store.school.id,
        student_id: studentId,
        fee_structure_id: structure.id,
        fee_period_id: params.feePeriodId,
        title: params.feePeriodId
          ? `${structure.name} - ${store.feePeriods.find((p) => p.id === params.feePeriodId)?.name ?? ""}`
          : structure.name,
        amount: structure.amount,
        discount: 0,
        paid_amount: 0,
        balance: structure.amount,
        due_date: params.dueDate,
        status: "unpaid",
        created_by: params.createdBy,
      };

      for (const d of applicableDiscounts) {
        const amount = d.kind === "percentage" ? Math.round((structure.amount * d.value) / 100) : d.value;
        discount += amount;
        store.feeDiscounts.push({ id: randomUUID(), school_id: store.school.id, fee_id: fee.id, discount_id: d.id, scholarship_id: null, applied_amount: amount });
      }
      for (const s of approvedScholarships) {
        const amount = s.kind === "percentage" ? Math.round((structure.amount * s.value) / 100) : s.value;
        discount += amount;
        store.feeDiscounts.push({ id: randomUUID(), school_id: store.school.id, fee_id: fee.id, discount_id: null, scholarship_id: s.id, applied_amount: amount });
      }

      fee.discount = Math.min(discount, structure.amount);
      demoStore.recomputeFeeStatus(fee);
      store.fees.unshift(fee);
      created.push(fee);
    }

    return { created, skipped };
  },

  listDiscounts: () => store.discounts,
  createDiscount: (data: Omit<Discount, "id" | "school_id" | "is_active">) => {
    const discount: Discount = { ...data, id: randomUUID(), school_id: store.school.id, is_active: true };
    store.discounts.unshift(discount);
    return discount;
  },
  toggleDiscount: (id: string, isActive: boolean) => {
    const idx = store.discounts.findIndex((d) => d.id === id);
    if (idx === -1) return undefined;
    store.discounts[idx].is_active = isActive;
    return store.discounts[idx];
  },

  listScholarships: () => store.scholarships,
  createScholarship: (data: Omit<Scholarship, "id" | "school_id" | "status">) => {
    const scholarship: Scholarship = { ...data, id: randomUUID(), school_id: store.school.id, status: "pending" };
    store.scholarships.unshift(scholarship);
    return scholarship;
  },
  decideScholarship: (id: string, status: "approved" | "rejected", approvedBy: string) => {
    const idx = store.scholarships.findIndex((s) => s.id === id);
    if (idx === -1) return undefined;
    store.scholarships[idx] = {
      ...store.scholarships[idx],
      status,
      approved_by: approvedBy,
      approved_at: new Date().toISOString(),
    };
    return store.scholarships[idx];
  },

  listFeeDiscounts: (feeId?: string) => (feeId ? store.feeDiscounts.filter((fd) => fd.fee_id === feeId) : store.feeDiscounts),

  listPayments: () => store.payments,
  listPaymentAllocations: (paymentId?: string) =>
    paymentId ? store.paymentAllocations.filter((a) => a.payment_id === paymentId) : store.paymentAllocations,

  getFinancialSettings: () => store.financialSettings,

  nextReceiptNumber: () => {
    store.financialSettings.last_receipt_number += 1;
    const year = new Date().getFullYear();
    return `${store.financialSettings.receipt_prefix}-${year}-${String(store.financialSettings.last_receipt_number).padStart(6, "0")}`;
  },

  /** The only way to record a payment — mirrors the `record_payment` DB RPC. */
  recordPayment: (params: {
    studentId: string;
    method: string;
    allocations: { feeId: string; amount: number }[];
    notes?: string;
    receivedBy?: string;
  }): Payment => {
    const total = params.allocations.reduce((s, a) => s + a.amount, 0);
    if (total <= 0) throw new Error("Payment must allocate a positive amount to at least one fee.");
    for (const a of params.allocations) {
      const fee = store.fees.find((f) => f.id === a.feeId);
      if (!fee) throw new Error("Fee charge not found.");
      if (a.amount > fee.balance + 0.01) {
        throw new Error(`Payment of ${a.amount} exceeds the outstanding balance (${fee.balance}) on "${fee.title}".`);
      }
    }

    const payment: Payment = {
      id: randomUUID(),
      school_id: store.school.id,
      fee_id: params.allocations[0].feeId,
      student_id: params.studentId,
      amount_paid: total,
      payment_date: new Date().toISOString().slice(0, 10),
      payment_method: params.method,
      receipt_number: demoStore.nextReceiptNumber(),
      received_by: params.receivedBy,
      status: "completed",
      notes: params.notes,
    };
    store.payments.unshift(payment);

    for (const a of params.allocations) {
      store.paymentAllocations.push({ id: randomUUID(), school_id: store.school.id, payment_id: payment.id, fee_id: a.feeId, amount: a.amount });
      const fee = store.fees.find((f) => f.id === a.feeId)!;
      fee.paid_amount += a.amount;
      demoStore.recomputeFeeStatus(fee);
    }

    return payment;
  },

  listRefunds: () => store.refunds,

  /** The only way to reverse money — capped at the eligible paid amount, mirrors `record_refund`. */
  recordRefund: (params: { paymentId: string; feeId: string; studentId: string; amount: number; reason: string; refundedBy?: string }): Refund => {
    if (!params.reason.trim()) throw new Error("A reason is required to issue a refund.");
    const allocated = store.paymentAllocations
      .filter((a) => a.payment_id === params.paymentId && a.fee_id === params.feeId)
      .reduce((s, a) => s + a.amount, 0);
    if (allocated === 0) throw new Error("This payment has no allocation against the selected fee.");
    const alreadyRefunded = store.refunds
      .filter((r) => r.payment_id === params.paymentId && r.fee_id === params.feeId)
      .reduce((s, r) => s + r.amount, 0);
    const eligible = allocated - alreadyRefunded;
    if (params.amount > eligible) {
      throw new Error(`Refund amount (${params.amount}) exceeds the eligible paid amount (${eligible}) for this charge.`);
    }

    const refund: Refund = {
      id: randomUUID(),
      school_id: store.school.id,
      payment_id: params.paymentId,
      fee_id: params.feeId,
      student_id: params.studentId,
      amount: params.amount,
      reason: params.reason,
      status: "completed",
      refunded_by: params.refundedBy,
    };
    store.refunds.unshift(refund);

    const fee = store.fees.find((f) => f.id === params.feeId);
    if (fee) {
      fee.paid_amount = Math.max(0, fee.paid_amount - params.amount);
      demoStore.recomputeFeeStatus(fee);
    }

    return refund;
  },

  listNotificationsFor: (profileId: string) => store.notifications.filter((n) => n.profile_id === profileId).sort((a, b) => (a.created_at! < b.created_at! ? 1 : -1)),
  markNotificationRead: (id: string, profileId: string, isRead = true) => {
    const n = store.notifications.find((x) => x.id === id && x.profile_id === profileId);
    if (n) n.is_read = isRead;
    return n;
  },
  markAllNotificationsRead: (profileId: string) => {
    for (const n of store.notifications) if (n.profile_id === profileId) n.is_read = true;
  },
  createNotification: (data: Omit<Notification, "id" | "school_id" | "is_read" | "created_at">) => {
    const notification: Notification = {
      ...data,
      id: randomUUID(),
      school_id: store.school.id,
      is_read: false,
      created_at: new Date().toISOString(),
    };
    store.notifications.unshift(notification);
    return notification;
  },

  listHomework: () => store.homework,
  getHomework: (id: string) => store.homework.find((h) => h.id === id),

  // -------------------------------------------------------------------
  // PHASE 7 — homework authoring (teacher-scoped in the app layer; the
  // real "assigned to this class/subject" gate lives in Supabase RLS —
  // demo mode has no such enforcement engine, so callers must pass an
  // already-authorized teacherId/classId/subjectId combination).
  // -------------------------------------------------------------------
  createHomework: (data: Omit<HomeworkRecord, "id" | "school_id" | "created_at" | "updated_at">) => {
    const homework: HomeworkRecord = {
      ...data,
      id: randomUUID(),
      school_id: store.school.id,
      updated_at: new Date().toISOString(),
    };
    store.homework.unshift(homework);
    return homework;
  },
  updateHomework: (id: string, data: Partial<HomeworkRecord>) => {
    const idx = store.homework.findIndex((h) => h.id === id);
    if (idx === -1) return undefined;
    store.homework[idx] = { ...store.homework[idx], ...data, updated_at: new Date().toISOString() };
    return store.homework[idx];
  },

  // -------------------------------------------------------------------
  // PHASE 6/7 — homework submissions ("assignments" table)
  // -------------------------------------------------------------------
  listHomeworkAssignments: () => store.homeworkAssignments,
  getHomeworkAssignment: (homeworkId: string, studentId: string) =>
    store.homeworkAssignments.find((a) => a.homework_id === homeworkId && a.student_id === studentId),
  submitHomework: (homeworkId: string, studentId: string, submissionUrl: string | null, comment: string | null, isLate: boolean) => {
    const existing = store.homeworkAssignments.find((a) => a.homework_id === homeworkId && a.student_id === studentId);
    if (existing) {
      if (existing.status === "checked") throw new Error("This homework has already been checked and can no longer be resubmitted.");
      existing.status = isLate ? "late" : "submitted";
      existing.submitted_at = new Date().toISOString();
      existing.submission_url = submissionUrl;
      existing.comment = comment;
      return existing;
    }
    const created: HomeworkAssignment = {
      id: randomUUID(),
      school_id: store.school.id,
      homework_id: homeworkId,
      student_id: studentId,
      status: isLate ? "late" : "submitted",
      submitted_at: new Date().toISOString(),
      submission_url: submissionUrl,
      comment,
    };
    store.homeworkAssignments.push(created);
    return created;
  },
  reviewHomeworkSubmission: (id: string, data: { marks?: number | null; remarks?: string | null; checkedBy: string }) => {
    const idx = store.homeworkAssignments.findIndex((a) => a.id === id);
    if (idx === -1) return undefined;
    store.homeworkAssignments[idx] = {
      ...store.homeworkAssignments[idx],
      marks: data.marks ?? store.homeworkAssignments[idx].marks,
      remarks: data.remarks ?? store.homeworkAssignments[idx].remarks,
      status: "checked",
      checked_by: data.checkedBy,
    };
    return store.homeworkAssignments[idx];
  },

  // -------------------------------------------------------------------
  // PHASE 6 — leave requests
  // -------------------------------------------------------------------
  listLeaveRequests: () => store.leaveRequests,
  listLeaveRequestsFor: (profileId: string) => store.leaveRequests.filter((l) => l.requester_profile_id === profileId),
  createLeaveRequest: (data: Omit<LeaveRequest, "id" | "school_id" | "status" | "reviewed_by" | "review_remarks">) => {
    const request: LeaveRequest = { ...data, id: randomUUID(), school_id: store.school.id, status: "pending" };
    store.leaveRequests.unshift(request);
    return request;
  },
  reviewLeaveRequest: (id: string, status: "approved" | "rejected", reviewedBy: string, remarks?: string) => {
    const idx = store.leaveRequests.findIndex((l) => l.id === id);
    if (idx === -1) return undefined;
    store.leaveRequests[idx] = { ...store.leaveRequests[idx], status, reviewed_by: reviewedBy, review_remarks: remarks ?? null };
    return store.leaveRequests[idx];
  },
  // -------------------------------------------------------------------
  // PHASE 7 — notices (create + acknowledgements)
  // -------------------------------------------------------------------
  listNotices: () => store.notices,
  createNotice: (data: Omit<NoticeRecord, "id" | "school_id">) => {
    const notice: NoticeRecord = { ...data, id: randomUUID(), school_id: store.school.id };
    store.notices.unshift(notice);
    return notice;
  },
  listNoticeAcknowledgements: (noticeId?: string) =>
    noticeId ? store.noticeAcknowledgements.filter((a) => a.notice_id === noticeId) : store.noticeAcknowledgements,
  acknowledgeNotice: (noticeId: string, profileId: string) => {
    const existing = store.noticeAcknowledgements.find((a) => a.notice_id === noticeId && a.profile_id === profileId);
    if (existing) return existing;
    const ack: NoticeAcknowledgement = { id: randomUUID(), school_id: store.school.id, notice_id: noticeId, profile_id: profileId, acknowledged_at: new Date().toISOString() };
    store.noticeAcknowledgements.push(ack);
    return ack;
  },

  // -------------------------------------------------------------------
  // PHASE 7 — events (create/update + RSVP/acknowledgement + attendance)
  // -------------------------------------------------------------------
  listEvents: () => store.events,
  getEvent: (id: string) => store.events.find((e) => e.id === id),
  createEvent: (data: Omit<EventRecord, "id" | "school_id">) => {
    const event: EventRecord = { ...data, id: randomUUID(), school_id: store.school.id };
    store.events.unshift(event);
    return event;
  },
  updateEvent: (id: string, data: Partial<EventRecord>) => {
    const idx = store.events.findIndex((e) => e.id === id);
    if (idx === -1) return undefined;
    store.events[idx] = { ...store.events[idx], ...data };
    return store.events[idx];
  },
  listEventResponses: (eventId?: string) => (eventId ? store.eventResponses.filter((r) => r.event_id === eventId) : store.eventResponses),
  respondToEvent: (eventId: string, profileId: string, response: EventResponse["response"]) => {
    const idx = store.eventResponses.findIndex((r) => r.event_id === eventId && r.profile_id === profileId);
    if (idx !== -1) {
      store.eventResponses[idx] = { ...store.eventResponses[idx], response, responded_at: new Date().toISOString() };
      return store.eventResponses[idx];
    }
    const created: EventResponse = { id: randomUUID(), school_id: store.school.id, event_id: eventId, profile_id: profileId, response, responded_at: new Date().toISOString() };
    store.eventResponses.push(created);
    return created;
  },
  listEventAttendance: (eventId?: string) => (eventId ? store.eventAttendance.filter((a) => a.event_id === eventId) : store.eventAttendance),
  recordEventAttendance: (eventId: string, profileId: string, status: EventAttendanceRecord["status"], recordedBy: string) => {
    const idx = store.eventAttendance.findIndex((a) => a.event_id === eventId && a.profile_id === profileId);
    if (idx !== -1) {
      store.eventAttendance[idx] = { ...store.eventAttendance[idx], status, recorded_by: recordedBy, recorded_at: new Date().toISOString() };
      return store.eventAttendance[idx];
    }
    const created: EventAttendanceRecord = { id: randomUUID(), school_id: store.school.id, event_id: eventId, profile_id: profileId, status, recorded_by: recordedBy, recorded_at: new Date().toISOString() };
    store.eventAttendance.push(created);
    return created;
  },

  // -------------------------------------------------------------------
  // PHASE 7 — notification preferences
  // -------------------------------------------------------------------
  getNotificationPreferences: (profileId: string): NotificationPreferences => {
    const existing = store.notificationPreferences.find((p) => p.profile_id === profileId);
    if (existing) return existing;
    return {
      id: `default-${profileId}`,
      school_id: store.school.id,
      profile_id: profileId,
      homework: true,
      events: true,
      notices: true,
      fee_reminders: true,
      exam_notifications: true,
      result_notifications: true,
    };
  },
  updateNotificationPreferences: (profileId: string, data: Partial<Omit<NotificationPreferences, "id" | "school_id" | "profile_id">>) => {
    const idx = store.notificationPreferences.findIndex((p) => p.profile_id === profileId);
    if (idx !== -1) {
      store.notificationPreferences[idx] = { ...store.notificationPreferences[idx], ...data };
      return store.notificationPreferences[idx];
    }
    const created: NotificationPreferences = { ...demoStore.getNotificationPreferences(profileId), ...data, id: randomUUID() };
    store.notificationPreferences.push(created);
    return created;
  },
};
