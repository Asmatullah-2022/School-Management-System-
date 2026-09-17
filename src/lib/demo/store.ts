import "server-only";
import { randomUUID } from "crypto";
import {
  demoAssignments,
  demoAttendance,
  demoClasses,
  demoEvents,
  demoFees,
  demoHomework,
  demoNotices,
  demoPeriods,
  demoSections,
  demoStudents,
  demoSubjects,
  demoTeachers,
  demoTimetableEntries,
} from "./data";
import { findTimetableConflict, type TimetableCandidate } from "@/lib/timetable/conflicts";
import type {
  AttendanceRecord,
  EventRecord,
  FeeRecord,
  HomeworkRecord,
  NoticeRecord,
  Period,
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
