import type {
  AttendanceRecord,
  EventRecord,
  FeeRecord,
  HomeworkRecord,
  NoticeRecord,
  Profile,
  School,
  SchoolClass,
  Section,
  Student,
  Subject,
  Teacher,
  UserRole,
} from "@/types/database";

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
  { id: "sub-eng", school_id: DEMO_SCHOOL_ID, name: "English", code: "ENG" },
  { id: "sub-urd", school_id: DEMO_SCHOOL_ID, name: "Urdu", code: "URD" },
  { id: "sub-math", school_id: DEMO_SCHOOL_ID, name: "Mathematics", code: "MATH" },
  { id: "sub-sci", school_id: DEMO_SCHOOL_ID, name: "General Science", code: "SCI" },
  { id: "sub-isl", school_id: DEMO_SCHOOL_ID, name: "Islamiat", code: "ISL" },
  { id: "sub-cs", school_id: DEMO_SCHOOL_ID, name: "Computer Science", code: "CS" },
  { id: "sub-sst", school_id: DEMO_SCHOOL_ID, name: "Social Studies", code: "SST" },
];

export const demoTeachers: Teacher[] = [
  { id: "t-1", school_id: DEMO_SCHOOL_ID, employee_id: "EMP-001", full_name: "Ayesha Siddiqui", father_name: "Muhammad Siddiqui", gender: "female", mobile: "0300-1111111", email: "ayesha@gmps.edu.pk", designation: "Senior Teacher", qualification: "M.Ed", joining_date: "2019-06-01", status: "active" },
  { id: "t-2", school_id: DEMO_SCHOOL_ID, employee_id: "EMP-002", full_name: "Bilal Ahmed", father_name: "Rasheed Ahmed", gender: "male", mobile: "0300-2222222", email: "bilal@gmps.edu.pk", designation: "Teacher", qualification: "B.Ed", joining_date: "2021-08-15", status: "active" },
  { id: "t-3", school_id: DEMO_SCHOOL_ID, employee_id: "EMP-003", full_name: "Sana Malik", father_name: "Tariq Malik", gender: "female", mobile: "0300-3333333", email: "sana@gmps.edu.pk", designation: "Teacher", qualification: "B.A, B.Ed", joining_date: "2020-03-10", status: "active" },
  { id: "t-4", school_id: DEMO_SCHOOL_ID, employee_id: "EMP-004", full_name: "Kamran Iqbal", father_name: "Iqbal Hussain", gender: "male", mobile: "0300-4444444", email: "kamran@gmps.edu.pk", designation: "Computer Teacher", qualification: "BSCS", joining_date: "2022-01-05", status: "active" },
];

export const demoStudents: Student[] = [
  { id: "st-1", school_id: DEMO_SCHOOL_ID, admission_number: "GMPS-2025-001", full_name: "Ali Hassan", father_name: "Imran Hassan", mother_name: "Sadia Imran", gender: "male", date_of_birth: "2018-05-12", contact_number: "0301-1111111", address: "Street 5, Model Town", district: "Lahore", province: "Punjab", class_id: "c-1", section_id: "s-1a", roll_number: "1", admission_date: "2024-04-01", blood_group: "O+", status: "active" },
  { id: "st-2", school_id: DEMO_SCHOOL_ID, admission_number: "GMPS-2025-002", full_name: "Fatima Noor", father_name: "Shahid Noor", mother_name: "Rubina Shahid", gender: "female", date_of_birth: "2018-07-20", contact_number: "0301-2222222", address: "Street 8, Model Town", district: "Lahore", province: "Punjab", class_id: "c-1", section_id: "s-1a", roll_number: "2", admission_date: "2024-04-01", blood_group: "B+", status: "active" },
  { id: "st-3", school_id: DEMO_SCHOOL_ID, admission_number: "GMPS-2025-003", full_name: "Hamza Khan", father_name: "Nasir Khan", mother_name: "Farah Nasir", gender: "male", date_of_birth: "2017-02-15", contact_number: "0301-3333333", address: "Street 2, Township", district: "Lahore", province: "Punjab", class_id: "c-2", section_id: "s-2a", roll_number: "1", admission_date: "2023-04-01", blood_group: "A+", status: "active" },
  { id: "st-4", school_id: DEMO_SCHOOL_ID, admission_number: "GMPS-2025-004", full_name: "Zainab Bibi", father_name: "Aslam Ali", mother_name: "Kausar Aslam", gender: "female", date_of_birth: "2017-09-09", contact_number: "0301-4444444", address: "Street 3, Township", district: "Lahore", province: "Punjab", class_id: "c-2", section_id: "s-2a", roll_number: "2", admission_date: "2023-04-01", blood_group: "AB+", status: "active" },
  { id: "st-5", school_id: DEMO_SCHOOL_ID, admission_number: "GMPS-2025-005", full_name: "Usman Tariq", father_name: "Tariq Mehmood", mother_name: "Nasreen Tariq", gender: "male", date_of_birth: "2016-11-01", contact_number: "0301-5555555", address: "Street 1, Gulberg", district: "Lahore", province: "Punjab", class_id: "c-3", section_id: "s-3a", roll_number: "1", admission_date: "2022-04-01", blood_group: "O-", status: "active" },
  { id: "st-6", school_id: DEMO_SCHOOL_ID, admission_number: "GMPS-2025-006", full_name: "Ayesha Batool", father_name: "Farhan Sheikh", mother_name: "Nadia Farhan", gender: "female", date_of_birth: "2019-01-22", contact_number: "0301-6666666", address: "Street 4, Gulberg", district: "Lahore", province: "Punjab", class_id: "c-nursery", section_id: null, roll_number: "1", admission_date: "2025-04-01", blood_group: "B-", status: "active" },
  { id: "st-7", school_id: DEMO_SCHOOL_ID, admission_number: "GMPS-2025-007", full_name: "Bilal Saeed", father_name: "Saeed Ahmed", mother_name: "Shazia Saeed", gender: "male", date_of_birth: "2016-03-18", contact_number: "0301-7777777", address: "Street 9, Johar Town", district: "Lahore", province: "Punjab", class_id: "c-4", section_id: "s-4a", roll_number: "1", admission_date: "2022-04-01", blood_group: "A-", status: "active" },
  { id: "st-8", school_id: DEMO_SCHOOL_ID, admission_number: "GMPS-2025-008", full_name: "Mahnoor Fatima", father_name: "Waqas Ahmed", mother_name: "Sobia Waqas", gender: "female", date_of_birth: "2015-06-30", contact_number: "0301-8888888", address: "Street 6, Johar Town", district: "Lahore", province: "Punjab", class_id: "c-5", section_id: "s-5a", roll_number: "1", admission_date: "2021-04-01", blood_group: "O+", status: "active" },
];

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
