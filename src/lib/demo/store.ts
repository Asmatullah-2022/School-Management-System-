import "server-only";
import { randomUUID } from "crypto";
import {
  demoAssignments,
  demoAttendance,
  demoClasses,
  demoEvents,
  demoExams,
  demoExamSubjects,
  demoFees,
  demoHomework,
  demoMarkRevisions,
  demoMarks,
  demoNotices,
  demoPeriods,
  demoResults,
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
  Exam,
  ExamSubject,
  EventRecord,
  FeeRecord,
  GradeBand,
  HomeworkRecord,
  Mark,
  MarkRevision,
  NoticeRecord,
  Period,
  Result,
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
    homework: HomeworkRecord[];
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
    homework: [...demoHomework],
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
  listFees: () => store.fees,
  listHomework: () => store.homework,
  listNotices: () => store.notices,
  listEvents: () => store.events,
};
