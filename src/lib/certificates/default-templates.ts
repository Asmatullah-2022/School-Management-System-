import type { CertificateType } from "@/types/database";

/** Professional default wording for the fixed certificate types, used
 * whenever a school hasn't authored its own custom template for that
 * type yet — so every type works out of the box without per-school
 * setup, while a school can still override any of them via Certificate
 * Templates. */
export const DEFAULT_CERTIFICATE_TEMPLATES: Record<Exclude<CertificateType, "custom">, string> = {
  bonafide:
    "This is to certify that {{student_name}}, son/daughter of {{father_name}}, bearing Admission Number {{admission_number}}, is a bonafide student of {{school_name}}, currently studying in {{class}} - {{section}} during the academic session {{academic_session}}.",
  character:
    "This is to certify that {{student_name}}, son/daughter of {{father_name}}, Admission Number {{admission_number}}, studied in {{class}} - {{section}} at {{school_name}} during the academic session {{academic_session}}. His/her conduct and character during this period have been found to be satisfactory.",
  leaving:
    "This is to certify that {{student_name}}, son/daughter of {{father_name}}, Admission Number {{admission_number}}, was a student of {{school_name}} in {{class}} - {{section}} and is leaving the school as of {{date}}. {{extra_line}}",
  transfer:
    "This is to certify that {{student_name}}, son/daughter of {{father_name}}, Admission Number {{admission_number}}, was enrolled at {{school_name}} in {{class}} - {{section}} during the academic session {{academic_session}}, and is being issued this Transfer Certificate on {{date}}.",
  result:
    "This is to certify that {{student_name}}, son/daughter of {{father_name}}, Admission Number {{admission_number}}, a student of {{class}} - {{section}} at {{school_name}}, achieved the following result: {{extra_line}}",
  attendance:
    "This is to certify that {{student_name}}, son/daughter of {{father_name}}, Admission Number {{admission_number}}, a student of {{class}} - {{section}} at {{school_name}}, has the following attendance record for the academic session {{academic_session}}: {{extra_line}}",
  enrollment:
    "This is to certify that {{student_name}}, son/daughter of {{father_name}}, Admission Number {{admission_number}}, is currently enrolled at {{school_name}} in {{class}} - {{section}} for the academic session {{academic_session}}.",
};

export const CERTIFICATE_TYPE_LABELS: Record<CertificateType, string> = {
  bonafide: "Bonafide Certificate",
  character: "Character Certificate",
  leaving: "School Leaving Certificate",
  transfer: "Transfer Certificate",
  result: "Result Certificate",
  attendance: "Attendance Certificate",
  enrollment: "Enrollment Certificate",
  custom: "Custom Certificate",
};
