import type { School, Student } from "@/types/database";

/** Every certificate variable available to a template, resolved once from
 * real, already-stored data — an admin never retypes a student's name,
 * father's name, admission number, etc. */
export function buildCertificateVariables(
  student: Student,
  school: School,
  extra: { className: string; sectionName: string; academicSession: string; certificateNumber: string; extraLine?: string }
): Record<string, string> {
  return {
    student_name: student.full_name,
    father_name: student.father_name ?? "—",
    admission_number: student.admission_number,
    class: extra.className,
    section: extra.sectionName,
    academic_session: extra.academicSession,
    admission_date: student.admission_date ? new Date(student.admission_date).toLocaleDateString() : "—",
    date: new Date().toLocaleDateString(),
    certificate_number: extra.certificateNumber,
    school_name: school.name,
    extra_line: extra.extraLine ?? "",
  };
}

/** Renders a template by simple, non-executable {{variable}} substitution
 * — never eval()'d or run through a scripting/template-logic engine, so
 * a custom template can never contain executable code. Any unknown
 * placeholder is left as-is rather than throwing, so a template authored
 * before a new variable existed still renders. */
export function renderCertificateTemplate(template: string, variables: Record<string, string>): string {
  return template.replace(/\{\{\s*([a-z_]+)\s*\}\}/gi, (match, key: string) => {
    const value = variables[key.toLowerCase()];
    return value !== undefined ? value : match;
  });
}
