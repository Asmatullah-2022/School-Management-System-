import type {
  AttendanceRecord,
  Exam,
  ExamSubject,
  EventRecord,
  FeeRecord,
  GradeBand,
  HomeworkRecord,
  Mark,
  MarkRevision,
  NoticeRecord,
  Period,
  Profile,
  Result,
  School,
  SchoolClass,
  Section,
  Student,
  Subject,
  SubjectAssignment,
  Teacher,
  TimetableEntry,
  UserRole,
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
  { id: "st-5", school_id: DEMO_SCHOOL_ID, admission_number: "GMPS-2025-005", full_name: "Usman Tariq", father_name: "Tariq Mehmood", mother_name: "Nasreen Tariq", gender: "male", date_of_birth: "2016-11-01", contact_number: "0301-5555555", address: "Street 1, Gulberg", district: "Lahore", province: "Punjab", class_id: "c-3", section_id: "s-3a", roll_number: "1", admission_date: "2022-04-01", blood_group: "O-", status: "active" },
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
  "u-parent": ["st-1"],
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

export const demoFees: FeeRecord[] = [
  { id: "fee-1", school_id: DEMO_SCHOOL_ID, student_id: "st-1", title: "Monthly Tuition Fee - Sep 2025", amount: 2500, discount: 0, due_date: "2025-09-10", status: "paid" },
  { id: "fee-2", school_id: DEMO_SCHOOL_ID, student_id: "st-2", title: "Monthly Tuition Fee - Sep 2025", amount: 2500, discount: 0, due_date: "2025-09-10", status: "unpaid" },
  { id: "fee-3", school_id: DEMO_SCHOOL_ID, student_id: "st-3", title: "Monthly Tuition Fee - Sep 2025", amount: 2200, discount: 200, due_date: "2025-09-10", status: "paid" },
  { id: "fee-4", school_id: DEMO_SCHOOL_ID, student_id: "st-4", title: "Monthly Tuition Fee - Sep 2025", amount: 2200, discount: 0, due_date: "2025-09-10", status: "overdue" },
  { id: "fee-5", school_id: DEMO_SCHOOL_ID, student_id: "st-5", title: "Monthly Tuition Fee - Sep 2025", amount: 2800, discount: 0, due_date: "2025-09-10", status: "unpaid" },
];

export const demoHomework: HomeworkRecord[] = [
  { id: "hw-1", school_id: DEMO_SCHOOL_ID, class_id: "c-1", section_id: "s-1a", subject_id: "sub-math", teacher_id: "t-1", title: "Practice Sheet: Addition", description: "Complete exercise 3.1 to 3.3", due_date: lastNDays(1)[0] },
  { id: "hw-2", school_id: DEMO_SCHOOL_ID, class_id: "c-2", section_id: "s-2a", subject_id: "sub-eng", teacher_id: "t-2", title: "Story Writing", description: "Write a short story about your favourite animal", due_date: lastNDays(1)[0] },
];

export const demoNotices: NoticeRecord[] = [
  { id: "not-1", school_id: DEMO_SCHOOL_ID, title: "Mid-Term Exams Schedule Announced", description: "Mid-term examinations will begin from 1st October. Please check the exam schedule.", audience: "all", priority: "high", publish_date: new Date().toISOString().slice(0, 10) },
  { id: "not-2", school_id: DEMO_SCHOOL_ID, title: "Parent-Teacher Meeting", description: "PTM will be held this Saturday at 10 AM in the main hall.", audience: "parents", priority: "normal", publish_date: new Date().toISOString().slice(0, 10) },
];

export const demoEvents: EventRecord[] = [
  { id: "ev-1", school_id: DEMO_SCHOOL_ID, title: "Annual Sports Day", description: "Inter-house sports competition for all classes.", start_date: lastNDays(1)[0], location: "School Playground" },
];

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
  { profile: { id: "u-parent", school_id: DEMO_SCHOOL_ID, role: "parent", full_name: "Imran Hassan", is_active: true }, label: "Parent", description: "Father of Ali Hassan (Grade 1-A)" },
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
