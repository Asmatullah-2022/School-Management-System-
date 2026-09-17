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
  | "mid_term"
  | "first_semester"
  | "second_semester"
  | "annual";

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

export interface Subject {
  id: string;
  school_id: string;
  name: string;
  code?: string | null;
}

export interface Teacher {
  id: string;
  school_id: string;
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

export interface ExamRecord {
  id: string;
  school_id: string;
  name: string;
  exam_type: ExamType;
  start_date: string;
  end_date: string;
}

export interface MarkRecord {
  id: string;
  school_id: string;
  exam_subject_id: string;
  student_id: string;
  obtained_marks: number;
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
