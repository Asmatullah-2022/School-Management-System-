// Core domain types mirroring supabase/migrations/0001_schema.sql.
// Kept minimal to what Phase 1/2 modules actually use; extend as later
// phases (exams, fees, library, transport, ...) get UI built for them.

export type UserRole =
  | "super_admin"
  | "school_admin"
  | "teacher"
  | "accountant"
  | "parent"
  | "student";

export type Gender = "male" | "female" | "other";
export type PersonStatus = "active" | "inactive" | "archived";
export type AttendanceStatus = "present" | "absent" | "late" | "leave";
export type FeeStatus = "paid" | "partial" | "unpaid" | "overdue";
export type ExamType =
  | "monthly_test"
  | "unit_test"
  | "mid_term"
  | "first_semester"
  | "second_semester"
  | "annual"
  | "custom";
export type ExamStatus = "draft" | "scheduled" | "ongoing" | "completed" | "published" | "archived";
export type MarksStatus = "draft" | "submitted" | "verified" | "published";

/** One band of the school's configurable grading scale (schools.grading_system). */
export interface GradeBand {
  min: number;
  max: number;
  grade: string;
}

export interface School {
  id: string;
  name: string;
  school_code: string;
  logo_url?: string | null;
  address?: string | null;
  district?: string | null;
  province?: string | null;
  phone?: string | null;
  email?: string | null;
  principal_name?: string | null;
  currency: string;
  is_demo: boolean;
  working_days: number[]; // 0=Sunday .. 6=Saturday
  grading_system?: GradeBand[] | null;
}

export interface Profile {
  id: string;
  school_id: string;
  role: UserRole;
  full_name: string;
  phone?: string | null;
  avatar_url?: string | null;
  is_active: boolean;
}

export interface AcademicSession {
  id: string;
  school_id: string;
  name: string;
  start_date: string;
  end_date: string;
  is_current: boolean;
}

export interface SchoolClass {
  id: string;
  school_id: string;
  name: string;
  sort_order: number;
}

export interface Section {
  id: string;
  school_id: string;
  class_id: string;
  name: string;
  class_teacher_id?: string | null;
  room?: string | null;
  capacity?: number | null;
}

export type SubjectType = "core" | "elective" | "optional";
export type ActiveStatus = "active" | "archived";

export interface Subject {
  id: string;
  school_id: string;
  name: string;
  name_urdu?: string | null;
  code?: string | null;
  description?: string | null;
  subject_type: SubjectType;
  total_marks: number;
  passing_marks: number;
  status: ActiveStatus;
}

export interface Period {
  id: string;
  school_id: string;
  period_number: number;
  name: string;
  start_time: string;
  end_time: string;
  is_break: boolean;
  sort_order: number;
  status: ActiveStatus;
}

/** teacher_subjects row — subject assigned to a class/section with a teacher. */
export interface SubjectAssignment {
  id: string;
  school_id: string;
  teacher_id: string;
  subject_id: string;
  class_id: string;
  section_id: string | null;
  academic_session_id?: string | null;
  weekly_periods: number;
  status: "active" | "inactive";
}

/** timetables row — one class/section's subject+teacher for a specific day+period. */
export interface TimetableEntry {
  id: string;
  school_id: string;
  class_id: string;
  section_id: string;
  subject_id: string;
  teacher_id: string | null;
  period_id: string;
  academic_session_id?: string | null;
  day_of_week: number; // 0=Sunday .. 6=Saturday (JS Date.getDay())
  room?: string | null;
}

export interface Teacher {
  id: string;
  school_id: string;
  profile_id?: string | null;
  employee_id: string;
  full_name: string;
  father_name?: string | null;
  cnic?: string | null;
  gender?: Gender | null;
  mobile?: string | null;
  email?: string | null;
  address?: string | null;
  designation?: string | null;
  qualification?: string | null;
  joining_date?: string | null;
  photo_url?: string | null;
  status: PersonStatus;
}

export interface Student {
  id: string;
  school_id: string;
  profile_id?: string | null;
  admission_number: string;
  full_name: string;
  father_name?: string | null;
  mother_name?: string | null;
  gender?: Gender | null;
  date_of_birth?: string | null;
  b_form_number?: string | null;
  contact_number?: string | null;
  address?: string | null;
  district?: string | null;
  province?: string | null;
  class_id?: string | null;
  section_id?: string | null;
  roll_number?: string | null;
  admission_date: string;
  previous_school?: string | null;
  blood_group?: string | null;
  emergency_contact?: string | null;
  photo_url?: string | null;
  medical_info?: string | null;
  status: PersonStatus;
  academic_session_id?: string | null;
}

export interface AttendanceRecord {
  id: string;
  school_id: string;
  student_id: string;
  class_id?: string | null;
  section_id?: string | null;
  date: string;
  status: AttendanceStatus;
  remarks?: string | null;
}

export interface Exam {
  id: string;
  school_id: string;
  academic_session_id?: string | null;
  name: string;
  exam_type: ExamType;
  start_date: string;
  end_date: string;
  status: ExamStatus;
  created_by?: string | null;
  published_at?: string | null;
  published_by?: string | null;
}

/** exam_subjects row — doubles as the "Exam Schedule" entity (subject/class/section/date/time/room/invigilator). */
export interface ExamSubject {
  id: string;
  school_id: string;
  exam_id: string;
  class_id: string;
  section_id?: string | null;
  subject_id: string;
  exam_date?: string | null;
  exam_room?: string | null;
  invigilator_id?: string | null;
  start_time?: string | null;
  end_time?: string | null;
  total_marks: number;
  passing_marks: number;
}

export interface Mark {
  id: string;
  school_id: string;
  exam_subject_id: string;
  student_id: string;
  obtained_marks: number;
  status: MarksStatus;
  entered_by?: string | null;
  submitted_at?: string | null;
  submitted_by?: string | null;
  verified_at?: string | null;
  verified_by?: string | null;
  published_at?: string | null;
}

export interface Result {
  id: string;
  school_id: string;
  exam_id: string;
  student_id: string;
  total_obtained: number;
  total_marks: number;
  percentage: number;
  grade?: string | null;
  gpa?: number | null;
  class_rank?: number | null;
  is_pass: boolean;
  passed_subjects: number;
  failed_subjects: number;
  remarks?: string | null;
}

export interface MarkRevision {
  id: string;
  school_id: string;
  mark_id: string;
  old_obtained_marks: number;
  new_obtained_marks: number;
  reason: string;
  changed_by?: string | null;
  created_at: string;
}

export interface FeeRecord {
  id: string;
  school_id: string;
  student_id: string;
  title: string;
  amount: number;
  discount: number;
  due_date: string;
  status: FeeStatus;
}

export interface HomeworkRecord {
  id: string;
  school_id: string;
  class_id: string;
  section_id?: string | null;
  subject_id: string;
  teacher_id?: string | null;
  title: string;
  description?: string | null;
  due_date: string;
}

export interface NoticeRecord {
  id: string;
  school_id: string;
  title: string;
  description?: string | null;
  audience: "all" | "teachers" | "students" | "parents" | "class";
  priority: string;
  publish_date: string;
  expiry_date?: string | null;
}

export interface EventRecord {
  id: string;
  school_id: string;
  title: string;
  description?: string | null;
  start_date: string;
  end_date?: string | null;
  location?: string | null;
}
