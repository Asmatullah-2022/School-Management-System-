import "server-only";
import { randomUUID } from "crypto";
import {
  demoAttendance,
  demoClasses,
  demoEvents,
  demoFees,
  demoHomework,
  demoNotices,
  demoSections,
  demoStudents,
  demoSubjects,
  demoTeachers,
} from "./data";
import type {
  AttendanceRecord,
  EventRecord,
  FeeRecord,
  HomeworkRecord,
  NoticeRecord,
  SchoolClass,
  Section,
  Student,
  Subject,
  Teacher,
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
  listSubjects: () => store.subjects,
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
