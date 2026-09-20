import type { SchoolClass, Section, Subject, SubjectAssignment, Teacher } from "@/types/database";

export interface TeacherReportDataset {
  teachers: Teacher[];
  assignments: SubjectAssignment[];
  classes: SchoolClass[];
  sections: Section[];
  subjects: Subject[];
}

export function buildTeacherDirectory(data: TeacherReportDataset) {
  return data.teachers.map((t) => ({
    employeeId: t.employee_id,
    name: t.full_name,
    designation: t.designation ?? "—",
    qualification: t.qualification ?? "—",
    mobile: t.mobile ?? "—",
    status: t.status,
  }));
}

export function buildTeacherWorkloadReport(data: TeacherReportDataset) {
  return data.teachers.map((t) => {
    const own = data.assignments.filter((a) => a.teacher_id === t.id);
    const classSections = new Set(own.map((a) => `${a.class_id}|${a.section_id}`));
    const subjectIds = new Set(own.map((a) => a.subject_id));
    return {
      name: t.full_name,
      classesAssigned: classSections.size,
      subjectsAssigned: subjectIds.size,
      subjects: Array.from(subjectIds).map((id) => data.subjects.find((s) => s.id === id)?.name).filter(Boolean).join(", ") || "—",
    };
  });
}
