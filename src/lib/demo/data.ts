import type {
  AttendanceRecord,
  Discount,
  Exam,
  ExamSubject,
  EventAttendanceRecord,
  EventRecord,
  EventResponse,
  FeeDiscount,
  FeePeriod,
  FeeRecord,
  FeeStructure,
  FinancialSettings,
  GradeBand,
  HomeworkAssignment,
  HomeworkRecord,
  LeaveRequest,
  Mark,
  MarkRevision,
  NoticeAcknowledgement,
  NoticeRecord,
  NotificationPreferences,
  Payment,
  PaymentAllocation,
  Period,
  Profile,
  Refund,
  Result,
  Scholarship,
  School,
  SchoolClass,
  Section,
  Student,
  Subject,
  SubjectAssignment,
  Teacher,
  TimetableEntry,
  UserRole,
  Book,
  BookIssue,
  LibraryCategory,
  LibrarySettings,
  Driver,
  Vehicle,
  Route,
  RouteStop,
  StudentTransportAssignment,
  InventoryCategory,
  InventoryLocation,
  InventoryItem,
  InventoryTransaction,
  AuditLogEntry,
} from "@/types/database";

export const DEFAULT_GRADING_SYSTEM: GradeBand[] = [
  { min: 90, max: 100, grade: "A+" },
  { min: 80, max: 89, grade: "A" },
  { min: 70, max: 79, grade: "B+" },
  { min: 60, max: 69, grade: "B" },
  { min: 50, max: 59, grade: "C+" },
  { min: 40, max: 49, grade: "C" },
  { min: 0, max: 39, grade: "F" },
];

// Mirrors supabase/seed.sql — same IDs, same "Government Model Primary
// School" demo school — so switching from demo mode to a real Supabase
// project (seeded with that file) is a drop-in swap.

export const DEMO_SCHOOL_ID = "00000000-0000-0000-0000-000000000001";

export const demoSchool: School = {
  id: DEMO_SCHOOL_ID,
  name: "Government Model Primary School",
  school_code: "GMPS-001",
  address: "Main Bazaar Road",
  district: "Lahore",
  province: "Punjab",
  phone: "042-1234567",
  email: "info@gmps.edu.pk",
  principal_name: "Mr. Muhammad Aslam",
  currency: "PKR",
  is_demo: true,
  working_days: [1, 2, 3, 4, 5, 6], // Monday–Saturday
  grading_system: DEFAULT_GRADING_SYSTEM,
};

export const demoClasses: SchoolClass[] = [
  { id: "c-nursery", school_id: DEMO_SCHOOL_ID, name: "Nursery", sort_order: 1 },
  { id: "c-kg", school_id: DEMO_SCHOOL_ID, name: "KG", sort_order: 2 },
  { id: "c-1", school_id: DEMO_SCHOOL_ID, name: "Grade 1", sort_order: 3 },
  { id: "c-2", school_id: DEMO_SCHOOL_ID, name: "Grade 2", sort_order: 4 },
  { id: "c-3", school_id: DEMO_SCHOOL_ID, name: "Grade 3", sort_order: 5 },
  { id: "c-4", school_id: DEMO_SCHOOL_ID, name: "Grade 4", sort_order: 6 },
  { id: "c-5", school_id: DEMO_SCHOOL_ID, name: "Grade 5", sort_order: 7 },
];

export const demoSections: Section[] = [
  { id: "s-1a", school_id: DEMO_SCHOOL_ID, class_id: "c-1", name: "A", class_teacher_id: "t-1", room: "Room 1", capacity: 35 },
  { id: "s-2a", school_id: DEMO_SCHOOL_ID, class_id: "c-2", name: "A", class_teacher_id: "t-2", room: "Room 2", capacity: 35 },
  { id: "s-3a", school_id: DEMO_SCHOOL_ID, class_id: "c-3", name: "A", class_teacher_id: "t-3", room: "Room 3", capacity: 35 },
  { id: "s-4a", school_id: DEMO_SCHOOL_ID, class_id: "c-4", name: "A", class_teacher_id: null, room: "Room 4", capacity: 35 },
  { id: "s-5a", school_id: DEMO_SCHOOL_ID, class_id: "c-5", name: "A", class_teacher_id: null, room: "Room 5", capacity: 35 },
];

export const demoSubjects: Subject[] = [
  { id: "sub-eng", school_id: DEMO_SCHOOL_ID, name: "English", name_urdu: "انگریزی", code: "ENG", subject_type: "core", total_marks: 100, passing_marks: 33, status: "active" },
  { id: "sub-urd", school_id: DEMO_SCHOOL_ID, name: "Urdu", name_urdu: "اردو", code: "URD", subject_type: "core", total_marks: 100, passing_marks: 33, status: "active" },
  { id: "sub-math", school_id: DEMO_SCHOOL_ID, name: "Mathematics", name_urdu: "ریاضی", code: "MATH", subject_type: "core", total_marks: 100, passing_marks: 33, status: "active" },
  { id: "sub-sci", school_id: DEMO_SCHOOL_ID, name: "General Science", name_urdu: "عمومی سائنس", code: "SCI", subject_type: "core", total_marks: 100, passing_marks: 33, status: "active" },
  { id: "sub-isl", school_id: DEMO_SCHOOL_ID, name: "Islamiat", name_urdu: "اسلامیات", code: "ISL", subject_type: "core", total_marks: 100, passing_marks: 33, status: "active" },
  { id: "sub-cs", school_id: DEMO_SCHOOL_ID, name: "Computer Science", name_urdu: "کمپیوٹر سائنس", code: "CS", subject_type: "elective", total_marks: 100, passing_marks: 33, status: "active" },
  { id: "sub-sst", school_id: DEMO_SCHOOL_ID, name: "Social Studies", name_urdu: "معاشرتی علوم", code: "SST", subject_type: "core", total_marks: 100, passing_marks: 33, status: "active" },
  { id: "sub-gk", school_id: DEMO_SCHOOL_ID, name: "General Knowledge", name_urdu: "عمومی معلومات", code: "GK", subject_type: "elective", total_marks: 50, passing_marks: 17, status: "active" },
  { id: "sub-art", school_id: DEMO_SCHOOL_ID, name: "Art", name_urdu: "مصوری", code: "ART", subject_type: "optional", total_marks: 50, passing_marks: 17, status: "active" },
  { id: "sub-pe", school_id: DEMO_SCHOOL_ID, name: "Physical Education", name_urdu: "جسمانی تعلیم", code: "PE", subject_type: "optional", total_marks: 50, passing_marks: 17, status: "active" },
];

export const demoTeachers: Teacher[] = [
  { id: "t-1", school_id: DEMO_SCHOOL_ID, profile_id: "u-teacher", employee_id: "EMP-001", full_name: "Ayesha Siddiqui", father_name: "Muhammad Siddiqui", gender: "female", mobile: "0300-1111111", email: "ayesha@gmps.edu.pk", designation: "Senior Teacher", qualification: "M.Ed", joining_date: "2019-06-01", status: "active" },
  { id: "t-2", school_id: DEMO_SCHOOL_ID, employee_id: "EMP-002", full_name: "Bilal Ahmed", father_name: "Rasheed Ahmed", gender: "male", mobile: "0300-2222222", email: "bilal@gmps.edu.pk", designation: "Teacher", qualification: "B.Ed", joining_date: "2021-08-15", status: "active" },
  { id: "t-3", school_id: DEMO_SCHOOL_ID, employee_id: "EMP-003", full_name: "Sana Malik", father_name: "Tariq Malik", gender: "female", mobile: "0300-3333333", email: "sana@gmps.edu.pk", designation: "Teacher", qualification: "B.A, B.Ed", joining_date: "2020-03-10", status: "active" },
  { id: "t-4", school_id: DEMO_SCHOOL_ID, employee_id: "EMP-004", full_name: "Kamran Iqbal", father_name: "Iqbal Hussain", gender: "male", mobile: "0300-4444444", email: "kamran@gmps.edu.pk", designation: "Computer Teacher", qualification: "BSCS", joining_date: "2022-01-05", status: "active" },
];

export const demoStudents: Student[] = [
  { id: "st-1", school_id: DEMO_SCHOOL_ID, profile_id: "u-student", admission_number: "GMPS-2025-001", full_name: "Ali Hassan", father_name: "Imran Hassan", mother_name: "Sadia Imran", gender: "male", date_of_birth: "2018-05-12", contact_number: "0301-1111111", address: "Street 5, Model Town", district: "Lahore", province: "Punjab", class_id: "c-1", section_id: "s-1a", roll_number: "1", admission_date: "2024-04-01", blood_group: "O+", status: "active" },
  { id: "st-2", school_id: DEMO_SCHOOL_ID, admission_number: "GMPS-2025-002", full_name: "Fatima Noor", father_name: "Shahid Noor", mother_name: "Rubina Shahid", gender: "female", date_of_birth: "2018-07-20", contact_number: "0301-2222222", address: "Street 8, Model Town", district: "Lahore", province: "Punjab", class_id: "c-1", section_id: "s-1a", roll_number: "2", admission_date: "2024-04-01", blood_group: "B+", status: "active" },
  { id: "st-3", school_id: DEMO_SCHOOL_ID, admission_number: "GMPS-2025-003", full_name: "Hamza Khan", father_name: "Nasir Khan", mother_name: "Farah Nasir", gender: "male", date_of_birth: "2017-02-15", contact_number: "0301-3333333", address: "Street 2, Township", district: "Lahore", province: "Punjab", class_id: "c-2", section_id: "s-2a", roll_number: "1", admission_date: "2023-04-01", blood_group: "A+", status: "active" },
  { id: "st-4", school_id: DEMO_SCHOOL_ID, admission_number: "GMPS-2025-004", full_name: "Zainab Bibi", father_name: "Aslam Ali", mother_name: "Kausar Aslam", gender: "female", date_of_birth: "2017-09-09", contact_number: "0301-4444444", address: "Street 3, Township", district: "Lahore", province: "Punjab", class_id: "c-2", section_id: "s-2a", roll_number: "2", admission_date: "2023-04-01", blood_group: "AB+", status: "active" },
  { id: "st-5", school_id: DEMO_SCHOOL_ID, admission_number: "GMPS-2025-005", full_name: "Usman Hassan", father_name: "Imran Hassan", mother_name: "Sadia Imran", gender: "male", date_of_birth: "2016-11-01", contact_number: "0301-1111111", address: "Street 5, Model Town", district: "Lahore", province: "Punjab", class_id: "c-3", section_id: "s-3a", roll_number: "1", admission_date: "2022-04-01", blood_group: "O-", status: "active" },
  { id: "st-6", school_id: DEMO_SCHOOL_ID, admission_number: "GMPS-2025-006", full_name: "Ayesha Batool", father_name: "Farhan Sheikh", mother_name: "Nadia Farhan", gender: "female", date_of_birth: "2019-01-22", contact_number: "0301-6666666", address: "Street 4, Gulberg", district: "Lahore", province: "Punjab", class_id: "c-nursery", section_id: null, roll_number: "1", admission_date: "2025-04-01", blood_group: "B-", status: "active" },
  { id: "st-7", school_id: DEMO_SCHOOL_ID, admission_number: "GMPS-2025-007", full_name: "Bilal Saeed", father_name: "Saeed Ahmed", mother_name: "Shazia Saeed", gender: "male", date_of_birth: "2016-03-18", contact_number: "0301-7777777", address: "Street 9, Johar Town", district: "Lahore", province: "Punjab", class_id: "c-4", section_id: "s-4a", roll_number: "1", admission_date: "2022-04-01", blood_group: "A-", status: "active" },
  { id: "st-8", school_id: DEMO_SCHOOL_ID, admission_number: "GMPS-2025-008", full_name: "Mahnoor Fatima", father_name: "Waqas Ahmed", mother_name: "Sobia Waqas", gender: "female", date_of_birth: "2015-06-30", contact_number: "0301-8888888", address: "Street 6, Johar Town", district: "Lahore", province: "Punjab", class_id: "c-5", section_id: "s-5a", roll_number: "1", admission_date: "2021-04-01", blood_group: "O+", status: "active" },
];

export const demoPeriods: Period[] = [
  { id: "p-1", school_id: DEMO_SCHOOL_ID, period_number: 1, name: "Period 1", start_time: "08:00", end_time: "08:40", is_break: false, sort_order: 1, status: "active" },
  { id: "p-2", school_id: DEMO_SCHOOL_ID, period_number: 2, name: "Period 2", start_time: "08:40", end_time: "09:20", is_break: false, sort_order: 2, status: "active" },
  { id: "p-3", school_id: DEMO_SCHOOL_ID, period_number: 3, name: "Period 3", start_time: "09:20", end_time: "10:00", is_break: false, sort_order: 3, status: "active" },
  { id: "p-break", school_id: DEMO_SCHOOL_ID, period_number: 4, name: "Break", start_time: "10:00", end_time: "10:20", is_break: true, sort_order: 4, status: "active" },
  { id: "p-4", school_id: DEMO_SCHOOL_ID, period_number: 5, name: "Period 4", start_time: "10:20", end_time: "11:00", is_break: false, sort_order: 5, status: "active" },
  { id: "p-5", school_id: DEMO_SCHOOL_ID, period_number: 6, name: "Period 5", start_time: "11:00", end_time: "11:40", is_break: false, sort_order: 6, status: "active" },
  { id: "p-6", school_id: DEMO_SCHOOL_ID, period_number: 7, name: "Period 6", start_time: "11:40", end_time: "12:20", is_break: false, sort_order: 7, status: "active" },
];

export const demoAssignments: SubjectAssignment[] = [
  { id: "asg-1", school_id: DEMO_SCHOOL_ID, teacher_id: "t-1", subject_id: "sub-math", class_id: "c-1", section_id: "s-1a", weekly_periods: 6, status: "active" },
  { id: "asg-2", school_id: DEMO_SCHOOL_ID, teacher_id: "t-1", subject_id: "sub-eng", class_id: "c-1", section_id: "s-1a", weekly_periods: 5, status: "active" },
  { id: "asg-3", school_id: DEMO_SCHOOL_ID, teacher_id: "t-1", subject_id: "sub-isl", class_id: "c-1", section_id: "s-1a", weekly_periods: 3, status: "active" },
  { id: "asg-4", school_id: DEMO_SCHOOL_ID, teacher_id: "t-2", subject_id: "sub-urd", class_id: "c-1", section_id: "s-1a", weekly_periods: 5, status: "active" },
  { id: "asg-5", school_id: DEMO_SCHOOL_ID, teacher_id: "t-2", subject_id: "sub-math", class_id: "c-2", section_id: "s-2a", weekly_periods: 6, status: "active" },
  { id: "asg-6", school_id: DEMO_SCHOOL_ID, teacher_id: "t-2", subject_id: "sub-eng", class_id: "c-2", section_id: "s-2a", weekly_periods: 5, status: "active" },
  { id: "asg-7", school_id: DEMO_SCHOOL_ID, teacher_id: "t-3", subject_id: "sub-sci", class_id: "c-1", section_id: "s-1a", weekly_periods: 4, status: "active" },
  { id: "asg-8", school_id: DEMO_SCHOOL_ID, teacher_id: "t-3", subject_id: "sub-sst", class_id: "c-2", section_id: "s-2a", weekly_periods: 3, status: "active" },
  { id: "asg-9", school_id: DEMO_SCHOOL_ID, teacher_id: "t-4", subject_id: "sub-cs", class_id: "c-3", section_id: "s-3a", weekly_periods: 2, status: "active" },
];

export const demoTimetableEntries: TimetableEntry[] = [
  // Grade 1 - Section A (Monday=1 .. Saturday=6)
  { id: "tt-1", school_id: DEMO_SCHOOL_ID, class_id: "c-1", section_id: "s-1a", subject_id: "sub-math", teacher_id: "t-1", period_id: "p-1", day_of_week: 1, room: "Room 1" },
  { id: "tt-2", school_id: DEMO_SCHOOL_ID, class_id: "c-1", section_id: "s-1a", subject_id: "sub-eng", teacher_id: "t-1", period_id: "p-2", day_of_week: 1, room: "Room 1" },
  { id: "tt-3", school_id: DEMO_SCHOOL_ID, class_id: "c-1", section_id: "s-1a", subject_id: "sub-urd", teacher_id: "t-2", period_id: "p-3", day_of_week: 1, room: "Room 1" },
  { id: "tt-4", school_id: DEMO_SCHOOL_ID, class_id: "c-1", section_id: "s-1a", subject_id: "sub-sci", teacher_id: "t-3", period_id: "p-4", day_of_week: 1, room: "Room 1" },
  { id: "tt-5", school_id: DEMO_SCHOOL_ID, class_id: "c-1", section_id: "s-1a", subject_id: "sub-isl", teacher_id: "t-1", period_id: "p-5", day_of_week: 1, room: "Room 1" },
  { id: "tt-6", school_id: DEMO_SCHOOL_ID, class_id: "c-1", section_id: "s-1a", subject_id: "sub-math", teacher_id: "t-1", period_id: "p-1", day_of_week: 2, room: "Room 1" },
  { id: "tt-7", school_id: DEMO_SCHOOL_ID, class_id: "c-1", section_id: "s-1a", subject_id: "sub-eng", teacher_id: "t-1", period_id: "p-2", day_of_week: 2, room: "Room 1" },
  { id: "tt-8", school_id: DEMO_SCHOOL_ID, class_id: "c-1", section_id: "s-1a", subject_id: "sub-urd", teacher_id: "t-2", period_id: "p-3", day_of_week: 2, room: "Room 1" },
  { id: "tt-9", school_id: DEMO_SCHOOL_ID, class_id: "c-1", section_id: "s-1a", subject_id: "sub-isl", teacher_id: "t-1", period_id: "p-5", day_of_week: 2, room: "Room 1" },
  { id: "tt-10", school_id: DEMO_SCHOOL_ID, class_id: "c-1", section_id: "s-1a", subject_id: "sub-math", teacher_id: "t-1", period_id: "p-1", day_of_week: 3, room: "Room 1" },
  { id: "tt-11", school_id: DEMO_SCHOOL_ID, class_id: "c-1", section_id: "s-1a", subject_id: "sub-sci", teacher_id: "t-3", period_id: "p-4", day_of_week: 3, room: "Room 1" },
  // Grade 2 - Section A
  { id: "tt-20", school_id: DEMO_SCHOOL_ID, class_id: "c-2", section_id: "s-2a", subject_id: "sub-math", teacher_id: "t-2", period_id: "p-1", day_of_week: 1, room: "Room 2" },
  { id: "tt-21", school_id: DEMO_SCHOOL_ID, class_id: "c-2", section_id: "s-2a", subject_id: "sub-eng", teacher_id: "t-2", period_id: "p-2", day_of_week: 1, room: "Room 2" },
  { id: "tt-22", school_id: DEMO_SCHOOL_ID, class_id: "c-2", section_id: "s-2a", subject_id: "sub-sst", teacher_id: "t-3", period_id: "p-3", day_of_week: 1, room: "Room 2" },
];

/** Which student ids a parent profile can see (student_parents equivalent for demo mode). */
export const demoParentChildren: Record<string, string[]> = {
  "u-parent": ["st-1", "st-5"], // two children, different classes — exercises the child selector
  "u-parent2": ["st-3"], // single child — the common case
};

// ---------------------------------------------------------------------
// Examinations, schedule, marks, and results — Grade 1 / Section A.
//   - "exam-aug": a fully published Monthly Test so the student/parent
//     portal, result card, class results, and analytics have real data.
//   - "exam-mid": a scheduled Mid-Term with only two subjects scheduled
//     and no marks yet, to demo the schedule -> marks-entry workflow.
// ---------------------------------------------------------------------

export const demoExams: Exam[] = [
  { id: "exam-aug", school_id: DEMO_SCHOOL_ID, name: "Monthly Test - August", exam_type: "monthly_test", start_date: "2025-08-25", end_date: "2025-08-29", status: "published", published_at: "2025-09-02T10:00:00.000Z", published_by: "u-admin" },
  { id: "exam-mid", school_id: DEMO_SCHOOL_ID, name: "Mid-Term Examination", exam_type: "mid_term", start_date: "2025-10-13", end_date: "2025-10-17", status: "scheduled" },
];

export const demoExamSubjects: ExamSubject[] = [
  { id: "exsub-aug-math", school_id: DEMO_SCHOOL_ID, exam_id: "exam-aug", class_id: "c-1", section_id: "s-1a", subject_id: "sub-math", exam_date: "2025-08-25", exam_room: "Room 1", invigilator_id: "t-1", total_marks: 100, passing_marks: 33 },
  { id: "exsub-aug-eng", school_id: DEMO_SCHOOL_ID, exam_id: "exam-aug", class_id: "c-1", section_id: "s-1a", subject_id: "sub-eng", exam_date: "2025-08-26", exam_room: "Room 1", invigilator_id: "t-1", total_marks: 100, passing_marks: 33 },
  { id: "exsub-aug-urd", school_id: DEMO_SCHOOL_ID, exam_id: "exam-aug", class_id: "c-1", section_id: "s-1a", subject_id: "sub-urd", exam_date: "2025-08-27", exam_room: "Room 1", invigilator_id: "t-2", total_marks: 100, passing_marks: 33 },
  { id: "exsub-aug-isl", school_id: DEMO_SCHOOL_ID, exam_id: "exam-aug", class_id: "c-1", section_id: "s-1a", subject_id: "sub-isl", exam_date: "2025-08-28", exam_room: "Room 1", invigilator_id: "t-1", total_marks: 100, passing_marks: 33 },
  { id: "exsub-aug-sci", school_id: DEMO_SCHOOL_ID, exam_id: "exam-aug", class_id: "c-1", section_id: "s-1a", subject_id: "sub-sci", exam_date: "2025-08-29", exam_room: "Room 1", invigilator_id: "t-3", total_marks: 100, passing_marks: 33 },

  { id: "exsub-mid-math", school_id: DEMO_SCHOOL_ID, exam_id: "exam-mid", class_id: "c-1", section_id: "s-1a", subject_id: "sub-math", exam_date: "2025-10-13", exam_room: "Room 1", invigilator_id: "t-2", total_marks: 100, passing_marks: 33 },
  { id: "exsub-mid-eng", school_id: DEMO_SCHOOL_ID, exam_id: "exam-mid", class_id: "c-1", section_id: "s-1a", subject_id: "sub-eng", exam_date: "2025-10-15", exam_room: "Room 1", invigilator_id: "t-3", total_marks: 100, passing_marks: 33 },
];

// st-1 Ali Hassan: 78+65+70+60+55 = 328/500 = 65.6% -> B
// st-2 Fatima Noor: 88+92+85+90+80 = 435/500 = 87.0% -> A
export const demoMarks: Mark[] = [
  { id: "mk-aug-math-st1", school_id: DEMO_SCHOOL_ID, exam_subject_id: "exsub-aug-math", student_id: "st-1", obtained_marks: 78, status: "published", entered_by: "u-teacher" },
  { id: "mk-aug-eng-st1", school_id: DEMO_SCHOOL_ID, exam_subject_id: "exsub-aug-eng", student_id: "st-1", obtained_marks: 65, status: "published", entered_by: "u-teacher" },
  { id: "mk-aug-urd-st1", school_id: DEMO_SCHOOL_ID, exam_subject_id: "exsub-aug-urd", student_id: "st-1", obtained_marks: 70, status: "published", entered_by: "u-teacher" },
  { id: "mk-aug-isl-st1", school_id: DEMO_SCHOOL_ID, exam_subject_id: "exsub-aug-isl", student_id: "st-1", obtained_marks: 60, status: "published", entered_by: "u-teacher" },
  { id: "mk-aug-sci-st1", school_id: DEMO_SCHOOL_ID, exam_subject_id: "exsub-aug-sci", student_id: "st-1", obtained_marks: 55, status: "published", entered_by: "u-teacher" },

  { id: "mk-aug-math-st2", school_id: DEMO_SCHOOL_ID, exam_subject_id: "exsub-aug-math", student_id: "st-2", obtained_marks: 88, status: "published", entered_by: "u-teacher" },
  { id: "mk-aug-eng-st2", school_id: DEMO_SCHOOL_ID, exam_subject_id: "exsub-aug-eng", student_id: "st-2", obtained_marks: 92, status: "published", entered_by: "u-teacher" },
  { id: "mk-aug-urd-st2", school_id: DEMO_SCHOOL_ID, exam_subject_id: "exsub-aug-urd", student_id: "st-2", obtained_marks: 85, status: "published", entered_by: "u-teacher" },
  { id: "mk-aug-isl-st2", school_id: DEMO_SCHOOL_ID, exam_subject_id: "exsub-aug-isl", student_id: "st-2", obtained_marks: 90, status: "published", entered_by: "u-teacher" },
  { id: "mk-aug-sci-st2", school_id: DEMO_SCHOOL_ID, exam_subject_id: "exsub-aug-sci", student_id: "st-2", obtained_marks: 80, status: "published", entered_by: "u-teacher" },
];

export const demoResults: Result[] = [
  { id: "res-aug-st1", school_id: DEMO_SCHOOL_ID, exam_id: "exam-aug", student_id: "st-1", total_obtained: 328, total_marks: 500, percentage: 65.6, grade: "B", is_pass: true, passed_subjects: 5, failed_subjects: 0, class_rank: 2 },
  { id: "res-aug-st2", school_id: DEMO_SCHOOL_ID, exam_id: "exam-aug", student_id: "st-2", total_obtained: 435, total_marks: 500, percentage: 87, grade: "A", is_pass: true, passed_subjects: 5, failed_subjects: 0, class_rank: 1 },
];

export const demoMarkRevisions: MarkRevision[] = [];

function lastNDays(n: number): string[] {
  const days: string[] = [];
  const today = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    days.push(d.toISOString().slice(0, 10));
  }
  return days;
}

function futureDate(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

export const demoAttendance: AttendanceRecord[] = demoStudents.flatMap((s, idx) =>
  lastNDays(7).map((date, dayIdx) => ({
    id: `att-${s.id}-${date}`,
    school_id: DEMO_SCHOOL_ID,
    student_id: s.id,
    class_id: s.class_id,
    section_id: s.section_id,
    date,
    status: (idx + dayIdx) % 6 === 0 ? "absent" : (idx + dayIdx) % 9 === 0 ? "late" : "present",
  }))
);

// ---------------------------------------------------------------------
// PHASE 5 — FEES / FINANCE
// ---------------------------------------------------------------------
const TUITION_BY_CLASS: Record<string, number> = {
  "c-nursery": 1800,
  "c-kg": 2000,
  "c-1": 2200,
  "c-2": 2200,
  "c-3": 2500,
  "c-4": 2500,
  "c-5": 2800,
};

export const demoFeeStructures: FeeStructure[] = [
  ...Object.entries(TUITION_BY_CLASS).map(([classId, amount]) => ({
    id: `fs-tuition-${classId}`,
    school_id: DEMO_SCHOOL_ID,
    class_id: classId,
    academic_session_id: null,
    name: "Monthly Tuition Fee",
    amount,
    frequency: "monthly" as const,
    fee_type: "tuition",
    is_active: true,
  })),
  { id: "fs-admission", school_id: DEMO_SCHOOL_ID, class_id: null, academic_session_id: null, name: "Admission Fee", amount: 5000, frequency: "one_time", fee_type: "admission", is_active: true },
  { id: "fs-exam", school_id: DEMO_SCHOOL_ID, class_id: null, academic_session_id: null, name: "Term Exam Fee", amount: 800, frequency: "quarterly", fee_type: "exam", is_active: true },
  { id: "fs-transport", school_id: DEMO_SCHOOL_ID, class_id: null, academic_session_id: null, name: "Transport Fee", amount: 1200, frequency: "monthly", fee_type: "transport", is_active: true },
];

export const demoFeePeriods: FeePeriod[] = [
  { id: "fp-2025-08", school_id: DEMO_SCHOOL_ID, academic_session_id: null, name: "August 2025", month: 8, year: 2025, start_date: "2025-08-01", end_date: "2025-08-31" },
  { id: "fp-2025-09", school_id: DEMO_SCHOOL_ID, academic_session_id: null, name: "September 2025", month: 9, year: 2025, start_date: "2025-09-01", end_date: "2025-09-30" },
];

export const demoDiscounts: Discount[] = [
  { id: "disc-sibling", school_id: DEMO_SCHOOL_ID, name: "Sibling Discount", kind: "percentage", value: 10, scope: "school", class_id: null, section_id: null, student_id: null, academic_session_id: null, is_active: true },
];

export const demoScholarships: Scholarship[] = [
  { id: "sch-1", school_id: DEMO_SCHOOL_ID, student_id: "st-5", name: "Merit Scholarship", kind: "percentage", value: 50, status: "approved", academic_session_id: null, notes: "Top position in Grade 3 annual exam.", approved_by: "u-admin", approved_at: "2025-08-05T09:00:00Z" },
  { id: "sch-2", school_id: DEMO_SCHOOL_ID, student_id: "st-7", name: "Needy Student Concession", kind: "fixed", value: 500, status: "pending", academic_session_id: null, notes: "Requested by father, awaiting review." },
];

function feeAmountFor(studentId: string, classId: string): number {
  return TUITION_BY_CLASS[classId] ?? 2000;
}

function discountFor(studentId: string, amount: number): number {
  if (studentId === "st-5") return Math.round(amount * 0.5); // approved scholarship
  if (["st-1", "st-2"].includes(studentId)) return Math.round(amount * 0.1); // sibling discount
  return 0;
}

// Two months of tuition charges generated for every active student.
export const demoFees: FeeRecord[] = demoStudents.flatMap((s) => {
  if (!s.class_id) return [];
  const amount = feeAmountFor(s.id, s.class_id);
  return [
    { id: `fee-${s.id}-aug`, period: "fp-2025-08", label: "August 2025", due: "2025-08-10" },
    { id: `fee-${s.id}-sep`, period: "fp-2025-09", label: "September 2025", due: "2025-09-10" },
  ].map(({ id, period, label, due }) => {
    const discount = discountFor(s.id, amount);
    // demo payment behaviour: most Aug charges are settled; Sep is mixed
    const isAug = period === "fp-2025-08";
    let paid = 0;
    if (isAug) paid = amount - discount;
    else if (["st-1", "st-3", "st-5"].includes(s.id)) paid = amount - discount;
    else if (["st-2", "st-6"].includes(s.id)) paid = Math.round((amount - discount) / 2);

    const balance = amount - discount - paid;
    const status: FeeRecord["status"] = balance <= 0 ? "paid" : paid > 0 ? "partial" : new Date(due) < new Date("2025-09-18") ? "overdue" : "unpaid";

    return {
      id,
      school_id: DEMO_SCHOOL_ID,
      student_id: s.id,
      fee_structure_id: `fs-tuition-${s.class_id}`,
      fee_period_id: period,
      title: `Monthly Tuition Fee - ${label}`,
      amount,
      discount,
      paid_amount: paid,
      balance,
      due_date: due,
      status,
    };
  });
});

export const demoFeeDiscounts: FeeDiscount[] = [
  { id: "fd-1", school_id: DEMO_SCHOOL_ID, fee_id: "fee-st-5-aug", discount_id: null, scholarship_id: "sch-1", applied_amount: Math.round(TUITION_BY_CLASS["c-3"] * 0.5) },
  { id: "fd-2", school_id: DEMO_SCHOOL_ID, fee_id: "fee-st-5-sep", discount_id: null, scholarship_id: "sch-1", applied_amount: Math.round(TUITION_BY_CLASS["c-3"] * 0.5) },
  { id: "fd-3", school_id: DEMO_SCHOOL_ID, fee_id: "fee-st-1-aug", discount_id: "disc-sibling", scholarship_id: null, applied_amount: Math.round(TUITION_BY_CLASS["c-1"] * 0.1) },
  { id: "fd-4", school_id: DEMO_SCHOOL_ID, fee_id: "fee-st-1-sep", discount_id: "disc-sibling", scholarship_id: null, applied_amount: Math.round(TUITION_BY_CLASS["c-1"] * 0.1) },
  { id: "fd-5", school_id: DEMO_SCHOOL_ID, fee_id: "fee-st-2-aug", discount_id: "disc-sibling", scholarship_id: null, applied_amount: Math.round(TUITION_BY_CLASS["c-1"] * 0.1) },
  { id: "fd-6", school_id: DEMO_SCHOOL_ID, fee_id: "fee-st-2-sep", discount_id: "disc-sibling", scholarship_id: null, applied_amount: Math.round(TUITION_BY_CLASS["c-1"] * 0.1) },
];

export const demoPayments: Payment[] = demoFees
  .filter((f) => f.paid_amount > 0)
  .map((f, idx) => ({
    id: `pay-${f.id}`,
    school_id: DEMO_SCHOOL_ID,
    fee_id: f.id,
    student_id: f.student_id,
    amount_paid: f.paid_amount,
    payment_date: f.fee_period_id === "fp-2025-08" ? "2025-08-08" : "2025-09-09",
    payment_method: idx % 3 === 0 ? "cash" : idx % 3 === 1 ? "bank_transfer" : "easypaisa",
    receipt_number: `REC-2025-${String(idx + 1).padStart(6, "0")}`,
    received_by: "u-accountant",
    status: "completed",
  }));

export const demoPaymentAllocations: PaymentAllocation[] = demoPayments.map((p) => ({
  id: `alloc-${p.id}`,
  school_id: DEMO_SCHOOL_ID,
  payment_id: p.id,
  fee_id: p.fee_id,
  amount: p.amount_paid,
}));

export const demoRefunds: Refund[] = [
  {
    id: "ref-1",
    school_id: DEMO_SCHOOL_ID,
    payment_id: "pay-fee-st-3-aug",
    fee_id: "fee-st-3-aug",
    student_id: "st-3",
    amount: 200,
    reason: "Overpayment corrected at parent's request.",
    status: "completed",
    refunded_by: "u-accountant",
  },
];

export const demoFinancialSettings: FinancialSettings = {
  id: "fin-settings-1",
  school_id: DEMO_SCHOOL_ID,
  receipt_prefix: "REC",
  last_receipt_number: demoPayments.length,
  currency: "PKR",
  late_fee_percentage: 0,
};

export const demoHomework: HomeworkRecord[] = [
  {
    id: "hw-1", school_id: DEMO_SCHOOL_ID, class_id: "c-1", section_id: "s-1a", subject_id: "sub-math", teacher_id: "t-1",
    title: "Practice Sheet: Addition", description: "Complete exercise 3.1 to 3.3", instructions: "Show your working for each question. Use a pencil.",
    due_date: futureDate(2), assigned_date: lastNDays(1)[0], max_marks: 10, allow_late: true,
    stage: "published", created_by: "u-teacher",
  },
  {
    id: "hw-2", school_id: DEMO_SCHOOL_ID, class_id: "c-2", section_id: "s-2a", subject_id: "sub-eng", teacher_id: "t-2",
    title: "Story Writing", description: "Write a short story about your favourite animal", instructions: "At least 150 words, include a title.",
    due_date: lastNDays(1)[0], assigned_date: lastNDays(3)[0], max_marks: 20, allow_late: false,
    stage: "published", created_by: "u-teacher",
  },
  {
    id: "hw-3", school_id: DEMO_SCHOOL_ID, class_id: "c-1", section_id: "s-1a", subject_id: "sub-eng", teacher_id: "t-1",
    title: "Reading Comprehension (Draft)", description: "Read chapter 4 and answer the questions.", instructions: null,
    due_date: futureDate(7), assigned_date: new Date().toISOString().slice(0, 10), max_marks: 15, allow_late: false,
    stage: "draft", created_by: "u-teacher",
  },
];

export const demoHomeworkAssignments: HomeworkAssignment[] = [
  { id: "hwa-1", school_id: DEMO_SCHOOL_ID, homework_id: "hw-1", student_id: "st-1", status: "pending" },
  { id: "hwa-2", school_id: DEMO_SCHOOL_ID, homework_id: "hw-1", student_id: "st-2", status: "submitted", submitted_at: new Date().toISOString(), submission_url: null, comment: "Done, was a bit tricky in Q3." },
  { id: "hwa-3", school_id: DEMO_SCHOOL_ID, homework_id: "hw-2", student_id: "st-3", status: "checked", remarks: "Good work! Very creative story.", marks: 18, checked_by: "u-teacher" },
  { id: "hwa-4", school_id: DEMO_SCHOOL_ID, homework_id: "hw-2", student_id: "st-4", status: "late" },
];

export const demoLeaveRequests: LeaveRequest[] = [
  {
    id: "leave-1",
    school_id: DEMO_SCHOOL_ID,
    requester_profile_id: "u-parent",
    requester_role: "parent",
    student_id: "st-1",
    start_date: lastNDays(10)[0],
    end_date: lastNDays(9)[0],
    reason: "Family function out of town.",
    status: "approved",
    reviewed_by: "u-admin",
    review_remarks: "Approved.",
    created_at: new Date(Date.now() - 12 * 86400000).toISOString(),
  },
];

export const demoNotices: NoticeRecord[] = [
  { id: "not-1", school_id: DEMO_SCHOOL_ID, title: "Mid-Term Exams Schedule Announced", description: "Mid-term examinations will begin from 1st October. Please check the exam schedule.", audience: "all", priority: "urgent", requires_acknowledgement: true, publish_date: new Date().toISOString().slice(0, 10), created_by: "u-admin" },
  { id: "not-2", school_id: DEMO_SCHOOL_ID, title: "Parent-Teacher Meeting", description: "PTM will be held this Saturday at 10 AM in the main hall.", audience: "parents", priority: "important", requires_acknowledgement: true, publish_date: new Date().toISOString().slice(0, 10), created_by: "u-admin" },
  { id: "not-3", school_id: DEMO_SCHOOL_ID, title: "Grade 1-A: Science Fair Materials", description: "Grade 1-A students should bring their science fair materials by Friday.", audience: "class", class_id: "c-1", priority: "normal", publish_date: lastNDays(2)[0], created_by: "u-admin" },
];

export const demoNoticeAcknowledgements: NoticeAcknowledgement[] = [
  { id: "nack-1", school_id: DEMO_SCHOOL_ID, notice_id: "not-1", profile_id: "u-teacher", acknowledged_at: new Date().toISOString() },
];

export const demoEvents: EventRecord[] = [
  {
    id: "ev-1", school_id: DEMO_SCHOOL_ID, title: "Annual Sports Day", description: "Inter-house sports competition for all classes.",
    event_type: "sports", start_date: futureDate(10), start_time: "09:00", end_time: "14:00", location: "School Playground",
    organizer: "Muhammad Aslam", audience: "all", status: "scheduled", response_mode: "rsvp", track_attendance: false, created_by: "u-admin",
  },
  {
    id: "ev-2", school_id: DEMO_SCHOOL_ID, title: "Founders' Day Assembly", description: "A look back at the school's history, with performances from every class.",
    event_type: "school_function", start_date: "2025-06-15", start_time: "10:00", end_time: "12:00", location: "Main Hall",
    organizer: "Muhammad Aslam", audience: "all", status: "completed", response_mode: "none", track_attendance: false, created_by: "u-admin",
  },
  {
    id: "ev-3", school_id: DEMO_SCHOOL_ID, title: "Grade 1-A Parent-Teacher Meeting", description: "Discuss first-term progress with the class teacher.",
    event_type: "parent_meeting", start_date: futureDate(5), start_time: "15:00", end_time: "17:00", location: "Room 1",
    organizer: "Ayesha Siddiqui", audience: "class", class_id: "c-1", section_id: "s-1a", status: "scheduled", response_mode: "acknowledge", track_attendance: true, created_by: "u-admin",
  },
];

export const demoEventResponses: EventResponse[] = [
  { id: "eresp-1", school_id: DEMO_SCHOOL_ID, event_id: "ev-1", profile_id: "u-parent", response: "going" },
];

export const demoEventAttendance: EventAttendanceRecord[] = [];

export const demoNotificationPreferences: NotificationPreferences[] = [];

// =====================================================================
// PHASE 8 — Library, Transport, Inventory
// =====================================================================

export const demoLibraryCategories: LibraryCategory[] = [
  { id: "libcat-eng", school_id: DEMO_SCHOOL_ID, name: "English" },
  { id: "libcat-urd", school_id: DEMO_SCHOOL_ID, name: "Urdu" },
  { id: "libcat-math", school_id: DEMO_SCHOOL_ID, name: "Mathematics" },
  { id: "libcat-sci", school_id: DEMO_SCHOOL_ID, name: "Science" },
  { id: "libcat-isl", school_id: DEMO_SCHOOL_ID, name: "Islamiat" },
  { id: "libcat-story", school_id: DEMO_SCHOOL_ID, name: "Story Books" },
  { id: "libcat-ref", school_id: DEMO_SCHOOL_ID, name: "Reference" },
  { id: "libcat-gk", school_id: DEMO_SCHOOL_ID, name: "General Knowledge" },
];

export const demoLibrarySettings: LibrarySettings = {
  id: "libset-1",
  school_id: DEMO_SCHOOL_ID,
  fine_per_day: 10,
  grace_period_days: 1,
  max_fine: 500,
  default_loan_days: 14,
};

export const demoBooks: Book[] = [
  { id: "book-1", school_id: DEMO_SCHOOL_ID, title: "Aladdin and the Magic Lamp", title_urdu: "علاؤالدین اور جادوئی چراغ", author: "Anonymous", isbn: "978-0-000-00001", accession_number: "ACC-0001", publisher: "Ferozsons", edition: "1st", category: "Story Books", category_id: "libcat-story", language: "English", publication_year: 2018, total_copies: 4, available_copies: 3, shelf_location: "Rack A-1", price: 350, condition: "good", description: "A classic tale from the Arabian Nights.", status: "active" },
  { id: "book-2", school_id: DEMO_SCHOOL_ID, title: "Urdu Qaida", title_urdu: "اردو قاعدہ", author: "Dr. Waheed Qureshi", isbn: "978-0-000-00002", accession_number: "ACC-0002", publisher: "Punjab Textbook Board", edition: "3rd", category: "Urdu", category_id: "libcat-urd", language: "Urdu", publication_year: 2020, total_copies: 6, available_copies: 6, shelf_location: "Rack B-2", price: 150, condition: "new", status: "active" },
  { id: "book-3", school_id: DEMO_SCHOOL_ID, title: "Basic Mathematics for Grade 3", author: "S. Iqbal", isbn: "978-0-000-00003", accession_number: "ACC-0003", publisher: "Oxford University Press", edition: "2nd", category: "Mathematics", category_id: "libcat-math", language: "English", publication_year: 2019, total_copies: 5, available_copies: 5, shelf_location: "Rack C-1", price: 420, condition: "good", status: "active" },
  { id: "book-4", school_id: DEMO_SCHOOL_ID, title: "Wonders of Science", author: "Dr. Aslam Farrukh", isbn: "978-0-000-00004", accession_number: "ACC-0004", publisher: "Ilmi Kitab Khana", edition: "1st", category: "Science", category_id: "libcat-sci", language: "English", publication_year: 2021, total_copies: 3, available_copies: 3, shelf_location: "Rack D-1", price: 500, condition: "new", status: "active" },
  { id: "book-5", school_id: DEMO_SCHOOL_ID, title: "Seerat-un-Nabi for Children", title_urdu: "بچوں کے لیے سیرت النبی", author: "Maulana Tariq Jameel", isbn: "978-0-000-00005", accession_number: "ACC-0005", publisher: "Darussalam", edition: "1st", category: "Islamiat", category_id: "libcat-isl", language: "Urdu", publication_year: 2017, total_copies: 4, available_copies: 4, shelf_location: "Rack E-1", price: 300, condition: "fair", status: "active" },
];

export const demoBookIssues: BookIssue[] = [
  { id: "issue-1", school_id: DEMO_SCHOOL_ID, book_id: "book-1", student_id: "st-1", issue_date: lastNDays(7)[0], due_date: futureDate(7), fine_amount: 0, issued_by: "u-admin", status: "issued" },
  { id: "issue-2", school_id: DEMO_SCHOOL_ID, book_id: "book-1", student_id: "st-3", issue_date: lastNDays(20)[0], due_date: lastNDays(6)[0], fine_amount: 0, issued_by: "u-admin", status: "issued" },
];

export const demoDrivers: Driver[] = [
  { id: "driver-1", school_id: DEMO_SCHOOL_ID, full_name: "Rasheed Khan", employee_id: "DRV-001", cnic: "35202-1234567-1", mobile: "0301-9876543", license_number: "LHR-2019-4521", license_expiry: futureDate(400), status: "active" },
  { id: "driver-2", school_id: DEMO_SCHOOL_ID, full_name: "Aslam Butt", employee_id: "DRV-002", cnic: "35202-7654321-2", mobile: "0302-1239876", license_number: "LHR-2020-8842", license_expiry: futureDate(200), status: "active" },
];

export const demoVehicles: Vehicle[] = [
  { id: "vehicle-1", school_id: DEMO_SCHOOL_ID, vehicle_number: "LEA-14-1234", vehicle_type: "Van", make_model: "Toyota Hiace", capacity: 20, driver_id: "driver-1", status: "active", start_date: "2023-01-10", insurance_expiry: futureDate(120), fitness_expiry: futureDate(90) },
  { id: "vehicle-2", school_id: DEMO_SCHOOL_ID, vehicle_number: "LEB-15-5678", vehicle_type: "Bus", make_model: "Hino School Bus", capacity: 40, driver_id: "driver-2", status: "active", start_date: "2022-06-01", insurance_expiry: futureDate(60), fitness_expiry: futureDate(45) },
];

export const demoRoutes: Route[] = [
  { id: "route-1", school_id: DEMO_SCHOOL_ID, vehicle_id: "vehicle-1", name: "Model Town Route", route_code: "RT-01", starting_point: "Model Town Park", destination: "School Campus", distance_km: 8.5, estimated_minutes: 25, driver_id: "driver-1", fare: 2000, fee_structure_id: null, status: "active" },
  { id: "route-2", school_id: DEMO_SCHOOL_ID, vehicle_id: "vehicle-2", name: "Johar Town Route", route_code: "RT-02", starting_point: "Johar Town Chowk", destination: "School Campus", distance_km: 12, estimated_minutes: 35, driver_id: "driver-2", fare: 2500, fee_structure_id: null, status: "active" },
];

export const demoRouteStops: RouteStop[] = [
  { id: "stop-1a", school_id: DEMO_SCHOOL_ID, route_id: "route-1", stop_name: "Model Town Park", stop_order: 1, pickup_time: "07:00", dropoff_time: "14:15", location_description: "Main gate of the park" },
  { id: "stop-1b", school_id: DEMO_SCHOOL_ID, route_id: "route-1", stop_name: "Township Chowk", stop_order: 2, pickup_time: "07:10", dropoff_time: "14:05", location_description: "Near the mosque" },
  { id: "stop-2a", school_id: DEMO_SCHOOL_ID, route_id: "route-2", stop_name: "Johar Town Chowk", stop_order: 1, pickup_time: "06:50", dropoff_time: "14:25", location_description: "Main chowk" },
];

export const demoRouteStudents: StudentTransportAssignment[] = [
  { id: "rs-1", school_id: DEMO_SCHOOL_ID, route_id: "route-1", student_id: "st-1", stop_id: "stop-1a", stop_name: "Model Town Park", start_date: "2025-08-01", status: "active" },
];

export const demoInventoryCategories: InventoryCategory[] = [
  { id: "invcat-furniture", school_id: DEMO_SCHOOL_ID, name: "Furniture" },
  { id: "invcat-computers", school_id: DEMO_SCHOOL_ID, name: "Computers" },
  { id: "invcat-lab", school_id: DEMO_SCHOOL_ID, name: "Laboratory Equipment" },
  { id: "invcat-sports", school_id: DEMO_SCHOOL_ID, name: "Sports Equipment" },
  { id: "invcat-stationery", school_id: DEMO_SCHOOL_ID, name: "Stationery" },
];

export const demoInventoryLocations: InventoryLocation[] = [
  { id: "invloc-office", school_id: DEMO_SCHOOL_ID, name: "Office" },
  { id: "invloc-lab", school_id: DEMO_SCHOOL_ID, name: "Computer Lab" },
  { id: "invloc-store", school_id: DEMO_SCHOOL_ID, name: "Store Room" },
  { id: "invloc-1a", school_id: DEMO_SCHOOL_ID, name: "Classroom 1-A" },
];

export const demoInventory: InventoryItem[] = [
  { id: "inv-1", school_id: DEMO_SCHOOL_ID, asset_id: "LAP-001", name: "Dell Laptop", category: "Computers", category_id: "invcat-computers", description: "Core i5, 8GB RAM", quantity: 10, available_quantity: 7, purchase_date: "2024-01-15", cost: 85000, supplier: "Dell Pakistan", condition: "good", location: "Computer Lab", location_id: "invloc-lab", status: "active", warranty_expiry: futureDate(300), minimum_stock: 3 },
  { id: "inv-2", school_id: DEMO_SCHOOL_ID, asset_id: "WBM-001", name: "Whiteboard Marker (Box)", category: "Stationery", category_id: "invcat-stationery", quantity: 20, available_quantity: 4, purchase_date: "2025-06-01", cost: 300, supplier: "Local Stationers", condition: "new", location: "Store Room", location_id: "invloc-store", status: "active", minimum_stock: 10 },
  { id: "inv-3", school_id: DEMO_SCHOOL_ID, asset_id: "DSK-001", name: "Student Desk", category: "Furniture", category_id: "invcat-furniture", quantity: 60, available_quantity: 55, purchase_date: "2022-03-01", cost: 4500, supplier: "City Furniture Mart", condition: "fair", location: "Classroom 1-A", location_id: "invloc-1a", status: "active", minimum_stock: 5 },
  { id: "inv-4", school_id: DEMO_SCHOOL_ID, asset_id: "PRJ-001", name: "Projector", category: "Computers", category_id: "invcat-computers", quantity: 3, available_quantity: 2, purchase_date: "2023-09-10", cost: 55000, supplier: "Dell Pakistan", condition: "good", location: "Computer Lab", location_id: "invloc-lab", status: "active", warranty_expiry: futureDate(150), minimum_stock: 1 },
];

export const demoInventoryTransactions: InventoryTransaction[] = [
  { id: "invtx-1", school_id: DEMO_SCHOOL_ID, item_id: "inv-1", transaction_type: "stock_in", quantity: 10, performed_by: "u-admin", created_at: "2024-01-15T09:00:00.000Z" },
  { id: "invtx-2", school_id: DEMO_SCHOOL_ID, item_id: "inv-1", transaction_type: "assignment", quantity: 3, assigned_to_type: "teacher", assigned_to_id: "t-1", assigned_to_label: "Ayesha Siddiqui", reason: "Classroom use", performed_by: "u-admin", created_at: "2024-02-01T09:00:00.000Z" },
];

export const demoAuditLogs: AuditLogEntry[] = [];

export interface DemoUser {
  profile: Profile;
  label: string;
  description: string;
}

export const demoUsers: DemoUser[] = [
  { profile: { id: "u-super", school_id: DEMO_SCHOOL_ID, role: "super_admin", full_name: "Super Admin", is_active: true }, label: "Super Admin", description: "Manages all schools on the platform" },
  { profile: { id: "u-admin", school_id: DEMO_SCHOOL_ID, role: "school_admin", full_name: "Muhammad Aslam", is_active: true }, label: "School Admin / Headteacher", description: "Runs Government Model Primary School" },
  { profile: { id: "u-teacher", school_id: DEMO_SCHOOL_ID, role: "teacher", full_name: "Ayesha Siddiqui", is_active: true }, label: "Teacher", description: "Class 1-A teacher" },
  { profile: { id: "u-accountant", school_id: DEMO_SCHOOL_ID, role: "accountant", full_name: "Nadia Farooq", is_active: true }, label: "Accountant", description: "Manages fees & finance" },
  { profile: { id: "u-parent", school_id: DEMO_SCHOOL_ID, role: "parent", full_name: "Imran Hassan", is_active: true }, label: "Parent (2 children)", description: "Father of Ali Hassan (Grade 1-A) & Usman Hassan (Grade 3-A)" },
  { profile: { id: "u-parent2", school_id: DEMO_SCHOOL_ID, role: "parent", full_name: "Nasir Khan", is_active: true }, label: "Parent (1 child)", description: "Father of Hamza Khan (Grade 2-A)" },
  { profile: { id: "u-student", school_id: DEMO_SCHOOL_ID, role: "student", full_name: "Ali Hassan", is_active: true }, label: "Student", description: "Grade 1-A" },
];

export function findDemoUser(profileId: string): DemoUser | undefined {
  return demoUsers.find((u) => u.profile.id === profileId);
}

export const roleLabels: Record<UserRole, string> = {
  super_admin: "Super Admin",
  school_admin: "School Admin",
  teacher: "Teacher",
  accountant: "Accountant",
  parent: "Parent",
  student: "Student",
};
