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
  website?: string | null;
  principal_name?: string | null;
  principal_signature_url?: string | null;
  school_stamp_url?: string | null;
  headteacher_name?: string | null;
  document_footer?: string | null;
  certificate_prefix?: string;
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
  fee_structure_id?: string | null;
  fee_period_id?: string | null;
  title: string;
  amount: number;
  discount: number;
  paid_amount: number;
  balance: number;
  due_date: string;
  status: FeeStatus;
  notes?: string | null;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
}

export type FeeFrequency = "monthly" | "one_time" | "quarterly" | "annual";

export interface FeeStructure {
  id: string;
  school_id: string;
  class_id?: string | null;
  academic_session_id?: string | null;
  name: string;
  amount: number;
  frequency: FeeFrequency;
  fee_type: string;
  is_active: boolean;
  created_at?: string;
}

export interface FeePeriod {
  id: string;
  school_id: string;
  academic_session_id?: string | null;
  name: string;
  month: number;
  year: number;
  start_date: string;
  end_date: string;
}

export type DiscountKind = "fixed" | "percentage";
export type DiscountScope = "school" | "class" | "section" | "student";

export interface Discount {
  id: string;
  school_id: string;
  name: string;
  kind: DiscountKind;
  value: number;
  scope: DiscountScope;
  class_id?: string | null;
  section_id?: string | null;
  student_id?: string | null;
  academic_session_id?: string | null;
  is_active: boolean;
  created_by?: string;
  created_at?: string;
}

export type ScholarshipStatus = "pending" | "approved" | "rejected";

export interface Scholarship {
  id: string;
  school_id: string;
  student_id: string;
  name: string;
  kind: DiscountKind;
  value: number;
  status: ScholarshipStatus;
  academic_session_id?: string | null;
  notes?: string | null;
  approved_by?: string | null;
  approved_at?: string | null;
  created_by?: string;
  created_at?: string;
}

export interface FeeDiscount {
  id: string;
  school_id: string;
  fee_id: string;
  discount_id?: string | null;
  scholarship_id?: string | null;
  applied_amount: number;
  created_at?: string;
}

export interface Payment {
  id: string;
  school_id: string;
  fee_id: string;
  student_id: string;
  amount_paid: number;
  payment_date: string;
  payment_method: string;
  receipt_number: string;
  received_by?: string | null;
  status: "completed";
  notes?: string | null;
  created_at?: string;
}

export interface PaymentAllocation {
  id: string;
  school_id: string;
  payment_id: string;
  fee_id: string;
  amount: number;
  created_at?: string;
}

export interface Refund {
  id: string;
  school_id: string;
  payment_id: string;
  fee_id: string;
  student_id: string;
  amount: number;
  reason: string;
  status: "completed";
  refunded_by?: string | null;
  created_at?: string;
}

export interface Notification {
  id: string;
  school_id: string;
  profile_id: string;
  title: string;
  message?: string | null;
  type: string;
  is_read: boolean;
  link?: string | null;
  created_at?: string;
}

export interface FinancialSettings {
  id: string;
  school_id: string;
  receipt_prefix: string;
  last_receipt_number: number;
  currency: string;
  late_fee_percentage: number;
}

export type HomeworkStage = "draft" | "published" | "closed";

export interface HomeworkRecord {
  id: string;
  school_id: string;
  class_id: string;
  section_id?: string | null;
  subject_id: string;
  teacher_id?: string | null;
  title: string;
  description?: string | null;
  instructions?: string | null;
  attachment_url?: string | null;
  due_date: string;
  assigned_date?: string;
  max_marks?: number | null;
  allow_late?: boolean;
  stage?: HomeworkStage;
  created_by?: string | null;
  updated_at?: string;
}

export type NoticePriority = "normal" | "important" | "urgent";

export interface NoticeRecord {
  id: string;
  school_id: string;
  title: string;
  description?: string | null;
  attachment_url?: string | null;
  audience: "all" | "teachers" | "students" | "parents" | "class";
  class_id?: string | null;
  priority: string;
  requires_acknowledgement?: boolean;
  publish_date: string;
  expiry_date?: string | null;
  created_by?: string | null;
}

export interface NoticeAcknowledgement {
  id: string;
  school_id: string;
  notice_id: string;
  profile_id: string;
  acknowledged_at?: string;
}

export type LeaveStatus = "pending" | "approved" | "rejected";

export interface LeaveRequest {
  id: string;
  school_id: string;
  requester_profile_id: string;
  requester_role: UserRole;
  student_id?: string | null;
  teacher_id?: string | null;
  start_date: string;
  end_date: string;
  reason: string;
  status: LeaveStatus;
  reviewed_by?: string | null;
  review_remarks?: string | null;
  created_at?: string;
}

export type HomeworkStatus = "pending" | "submitted" | "late" | "checked";

/** A single student's submission record for one homework item (the
 * `assignments` table — unrelated to Phase 3's SubjectAssignment). */
export interface HomeworkAssignment {
  id: string;
  school_id: string;
  homework_id: string;
  student_id: string;
  status: HomeworkStatus;
  submitted_at?: string | null;
  submission_url?: string | null;
  comment?: string | null;
  remarks?: string | null;
  marks?: number | null;
  checked_by?: string | null;
  updated_at?: string;
}

export type EventType = "academic" | "sports" | "parent_meeting" | "holiday" | "training" | "competition" | "school_function" | "meeting" | "other";
export type EventStatus = "scheduled" | "cancelled" | "completed";
export type EventResponseMode = "none" | "rsvp" | "acknowledge";
export type EventResponseKind = "going" | "not_going" | "maybe" | "acknowledged";
export type AttendanceMark = "expected" | "present" | "absent";

export interface EventRecord {
  id: string;
  school_id: string;
  title: string;
  description?: string | null;
  event_type?: EventType;
  start_date: string;
  end_date?: string | null;
  start_time?: string | null;
  end_time?: string | null;
  location?: string | null;
  organizer?: string | null;
  attachment_url?: string | null;
  audience?: "all" | "teachers" | "students" | "parents" | "class";
  class_id?: string | null;
  section_id?: string | null;
  status?: EventStatus;
  response_mode?: EventResponseMode;
  track_attendance?: boolean;
  created_by?: string | null;
}

export interface EventResponse {
  id: string;
  school_id: string;
  event_id: string;
  profile_id: string;
  response: EventResponseKind;
  responded_at?: string;
}

export interface EventAttendanceRecord {
  id: string;
  school_id: string;
  event_id: string;
  profile_id: string;
  status: AttendanceMark;
  recorded_by?: string | null;
  recorded_at?: string;
}

export interface NotificationPreferences {
  id: string;
  school_id: string;
  profile_id: string;
  homework: boolean;
  events: boolean;
  notices: boolean;
  fee_reminders: boolean;
  exam_notifications: boolean;
  result_notifications: boolean;
}

// =====================================================================
// PHASE 8 — Library, Transport, Inventory
// =====================================================================

export type BookCondition = "new" | "good" | "fair" | "damaged";
export type BookStatus = "active" | "archived";
export type BookIssueStatus = "issued" | "returned";

export interface LibraryCategory {
  id: string;
  school_id: string;
  name: string;
  created_at?: string;
}

export interface LibrarySettings {
  id: string;
  school_id: string;
  fine_per_day: number;
  grace_period_days: number;
  max_fine?: number | null;
  default_loan_days: number;
  updated_at?: string;
}

export interface Book {
  id: string;
  school_id: string;
  title: string;
  title_urdu?: string | null;
  author?: string | null;
  isbn?: string | null;
  accession_number?: string | null;
  publisher?: string | null;
  edition?: string | null;
  category?: string | null;
  category_id?: string | null;
  language: string;
  publication_year?: number | null;
  total_copies: number;
  available_copies: number;
  shelf_location?: string | null;
  price?: number | null;
  condition: BookCondition;
  description?: string | null;
  cover_image_url?: string | null;
  status: BookStatus;
  created_by?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface BookIssue {
  id: string;
  school_id: string;
  book_id: string;
  student_id?: string | null;
  teacher_id?: string | null;
  issue_date: string;
  due_date: string;
  return_date?: string | null;
  fine_amount: number;
  issued_by?: string | null;
  returned_by?: string | null;
  condition_at_return?: string | null;
  remarks?: string | null;
  status: BookIssueStatus;
  created_at?: string;
  updated_at?: string;
}

export type VehicleStatus = "active" | "inactive" | "maintenance";
export type DriverStatus = "active" | "inactive";
export type RouteStatus = "active" | "inactive";
export type TransportAssignmentStatus = "active" | "ended";

export interface Driver {
  id: string;
  school_id: string;
  staff_id?: string | null;
  full_name: string;
  employee_id?: string | null;
  cnic?: string | null;
  mobile?: string | null;
  license_number?: string | null;
  license_expiry?: string | null;
  status: DriverStatus;
  created_by?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface Vehicle {
  id: string;
  school_id: string;
  vehicle_number: string;
  vehicle_type?: string | null;
  make_model?: string | null;
  capacity?: number | null;
  driver_id?: string | null;
  status: VehicleStatus;
  start_date?: string | null;
  insurance_expiry?: string | null;
  fitness_expiry?: string | null;
  notes?: string | null;
  created_by?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface Route {
  id: string;
  school_id: string;
  vehicle_id?: string | null;
  name: string;
  route_code?: string | null;
  starting_point?: string | null;
  destination?: string | null;
  distance_km?: number | null;
  estimated_minutes?: number | null;
  driver_id?: string | null;
  fare: number;
  fee_structure_id?: string | null;
  status: RouteStatus;
  created_by?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface RouteStop {
  id: string;
  school_id: string;
  route_id: string;
  stop_name: string;
  stop_order: number;
  pickup_time?: string | null;
  dropoff_time?: string | null;
  location_description?: string | null;
  created_at?: string;
}

export interface StudentTransportAssignment {
  id: string;
  school_id: string;
  route_id: string;
  student_id: string;
  stop_id?: string | null;
  stop_name?: string | null;
  start_date: string;
  end_date?: string | null;
  status: TransportAssignmentStatus;
  created_by?: string | null;
  updated_at?: string;
}

export type InventoryCondition = "new" | "good" | "fair" | "damaged" | "under_repair" | "disposed";
export type InventoryStatus = "active" | "disposed";
export type InventoryTransactionType = "stock_in" | "stock_out" | "assignment" | "return" | "transfer" | "adjustment" | "repair" | "dispose";
export type InventoryAssignedToType = "teacher" | "staff" | "department" | "room";

export interface InventoryCategory {
  id: string;
  school_id: string;
  name: string;
  created_at?: string;
}

export interface InventoryLocation {
  id: string;
  school_id: string;
  name: string;
  created_at?: string;
}

export interface InventoryItem {
  id: string;
  school_id: string;
  asset_id: string;
  name: string;
  category?: string | null;
  category_id?: string | null;
  description?: string | null;
  quantity: number;
  available_quantity: number;
  purchase_date?: string | null;
  cost?: number | null;
  supplier?: string | null;
  condition: InventoryCondition;
  location?: string | null;
  location_id?: string | null;
  responsible_person?: string | null;
  status: InventoryStatus;
  warranty_expiry?: string | null;
  minimum_stock?: number | null;
  notes?: string | null;
  created_by?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface InventoryTransaction {
  id: string;
  school_id: string;
  item_id: string;
  transaction_type: InventoryTransactionType;
  quantity: number;
  from_location?: string | null;
  to_location?: string | null;
  assigned_to_type?: InventoryAssignedToType | null;
  assigned_to_id?: string | null;
  assigned_to_label?: string | null;
  reason?: string | null;
  performed_by?: string | null;
  created_at?: string;
}

// =====================================================================
// PHASE 9 — Certificates, templates, cross-module reports
// =====================================================================

export type CertificateType = "bonafide" | "character" | "leaving" | "transfer" | "result" | "attendance" | "enrollment" | "custom";
export type CertificateStatus = "issued" | "cancelled";

export interface CertificateTemplate {
  id: string;
  school_id: string;
  name: string;
  certificate_type: CertificateType;
  body_template: string;
  is_custom: boolean;
  created_by?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface Certificate {
  id: string;
  school_id: string;
  student_id: string;
  certificate_type: CertificateType;
  certificate_number?: string | null;
  template_id?: string | null;
  body_text?: string | null;
  issue_date: string;
  status: CertificateStatus;
  issued_by?: string | null;
  created_by?: string | null;
  cancelled_by?: string | null;
  cancelled_at?: string | null;
  cancellation_reason?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface AuditLogEntry {
  id: string;
  school_id: string;
  profile_id?: string | null;
  action: string;
  target_table?: string | null;
  target_id?: string | null;
  metadata?: Record<string, unknown>;
  created_at?: string;
}
