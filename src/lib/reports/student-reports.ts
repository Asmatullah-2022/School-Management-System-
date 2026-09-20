import type { AcademicSession, SchoolClass, Section, Student } from "@/types/database";

export interface StudentReportDataset {
  students: Student[];
  classes: SchoolClass[];
  sections: Section[];
  sessions: AcademicSession[];
}

const className = (id: string | null | undefined, classes: SchoolClass[]) => classes.find((c) => c.id === id)?.name ?? "—";
const sectionName = (id: string | null | undefined, sections: Section[]) => sections.find((s) => s.id === id)?.name ?? "—";

export function buildStudentDirectory(data: StudentReportDataset) {
  return data.students.map((s) => ({
    admissionNumber: s.admission_number,
    name: s.full_name,
    fatherName: s.father_name ?? "—",
    class: className(s.class_id, data.classes),
    section: sectionName(s.section_id, data.sections),
    rollNumber: s.roll_number ?? "—",
    contact: s.contact_number ?? "—",
    status: s.status,
  }));
}

export function buildEnrollmentReport(data: StudentReportDataset) {
  const byMonth = new Map<string, number>();
  for (const s of data.students) {
    const month = s.admission_date.slice(0, 7);
    byMonth.set(month, (byMonth.get(month) ?? 0) + 1);
  }
  return Array.from(byMonth.entries())
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .map(([month, count]) => ({ month, newAdmissions: count }));
}

export function buildClassWiseStudentReport(data: StudentReportDataset) {
  return data.classes.map((c) => ({
    class: c.name,
    studentCount: data.students.filter((s) => s.class_id === c.id && s.status === "active").length,
  }));
}

export function buildSectionWiseStudentReport(data: StudentReportDataset) {
  return data.sections.map((sec) => ({
    class: className(sec.class_id, data.classes),
    section: sec.name,
    studentCount: data.students.filter((s) => s.section_id === sec.id && s.status === "active").length,
    capacity: sec.capacity ?? "—",
  }));
}

export function buildAdmissionReport(data: StudentReportDataset) {
  return [...data.students]
    .sort((a, b) => (a.admission_date < b.admission_date ? 1 : -1))
    .map((s) => ({
      admissionNumber: s.admission_number,
      name: s.full_name,
      admissionDate: s.admission_date,
      class: className(s.class_id, data.classes),
      section: sectionName(s.section_id, data.sections),
    }));
}

export function buildWithdrawalReport(data: StudentReportDataset) {
  return data.students
    .filter((s) => s.status === "inactive" || s.status === "archived")
    .map((s) => ({
      admissionNumber: s.admission_number,
      name: s.full_name,
      class: className(s.class_id, data.classes),
      section: sectionName(s.section_id, data.sections),
      status: s.status,
    }));
}

/** There is no separate class-promotion history table in this system yet
 * (a student's class/section is simply updated in place at promotion
 * time) — so rather than fabricate promotion records, this groups
 * currently-enrolled students by their real `academic_session_id` and
 * current class, which is genuine stored data and the closest honest
 * proxy for "which students were promoted into this session/class." */
export function buildPromotionReport(data: StudentReportDataset) {
  return data.sessions.map((session) => ({
    session: session.name,
    studentCount: data.students.filter((s) => s.academic_session_id === session.id && s.status === "active").length,
  }));
}

export function buildDemographicReport(data: StudentReportDataset) {
  const byGender = new Map<string, number>();
  const byDistrict = new Map<string, number>();
  for (const s of data.students) {
    const gender = s.gender ?? "unspecified";
    byGender.set(gender, (byGender.get(gender) ?? 0) + 1);
    const district = s.district ?? "unspecified";
    byDistrict.set(district, (byDistrict.get(district) ?? 0) + 1);
  }
  return {
    byGender: Array.from(byGender.entries()).map(([gender, count]) => ({ gender, count })),
    byDistrict: Array.from(byDistrict.entries()).map(([district, count]) => ({ district, count })),
  };
}
