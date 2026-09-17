-- =====================================================================
-- School Management System — Core Schema (Phase 1)
-- Multi-tenant (school_id on every tenant-scoped table) + RLS
-- =====================================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------
-- ENUMS
-- ---------------------------------------------------------------------
create type user_role as enum (
  'super_admin', 'school_admin', 'teacher', 'accountant', 'parent', 'student'
);

create type gender_type as enum ('male', 'female', 'other');
create type attendance_status as enum ('present', 'absent', 'late', 'leave');
create type leave_status as enum ('pending', 'approved', 'rejected');
create type exam_type as enum ('monthly_test', 'mid_term', 'first_semester', 'second_semester', 'annual');
create type fee_status as enum ('paid', 'partial', 'unpaid', 'overdue');
create type homework_status as enum ('pending', 'submitted', 'late', 'checked');
create type notice_audience as enum ('all', 'teachers', 'students', 'parents', 'class');
create type person_status as enum ('active', 'inactive', 'archived');

-- ---------------------------------------------------------------------
-- CORE: schools / users / roles
-- ---------------------------------------------------------------------
create table schools (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  school_code text unique not null,
  logo_url text,
  address text,
  district text,
  province text,
  phone text,
  email text,
  website text,
  principal_name text,
  principal_signature_url text,
  school_stamp_url text,
  theme text default 'light',
  language text default 'en',
  currency text default 'PKR',
  grading_system jsonb default '{}'::jsonb,
  is_demo boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

-- Profile row for every authenticated user (1:1 with auth.users)
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  school_id uuid references schools(id) on delete cascade,
  role user_role not null default 'student',
  full_name text not null,
  phone text,
  avatar_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_profiles_school on profiles(school_id);
create index idx_profiles_role on profiles(role);

create table permissions (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  description text
);

create table role_permissions (
  role user_role not null,
  permission_id uuid not null references permissions(id) on delete cascade,
  primary key (role, permission_id)
);

-- ---------------------------------------------------------------------
-- ACADEMICS: sessions / classes / sections / subjects
-- ---------------------------------------------------------------------
create table academic_sessions (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references schools(id) on delete cascade,
  name text not null, -- e.g. "2025-2026"
  start_date date not null,
  end_date date not null,
  is_current boolean not null default false,
  created_at timestamptz not null default now()
);
create index idx_sessions_school on academic_sessions(school_id);

create table classes (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references schools(id) on delete cascade,
  name text not null, -- Nursery, KG, Grade 1 ...
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  deleted_at timestamptz,
  unique (school_id, name)
);
create index idx_classes_school on classes(school_id);

create table sections (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references schools(id) on delete cascade,
  class_id uuid not null references classes(id) on delete cascade,
  name text not null, -- A, B, C
  class_teacher_id uuid,
  room text,
  capacity int,
  created_at timestamptz not null default now(),
  unique (class_id, name)
);
create index idx_sections_school on sections(school_id);
create index idx_sections_class on sections(class_id);

create table subjects (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references schools(id) on delete cascade,
  name text not null,
  code text,
  created_at timestamptz not null default now(),
  unique (school_id, name)
);
create index idx_subjects_school on subjects(school_id);

create table class_subjects (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references schools(id) on delete cascade,
  class_id uuid not null references classes(id) on delete cascade,
  subject_id uuid not null references subjects(id) on delete cascade,
  unique (class_id, subject_id)
);

-- ---------------------------------------------------------------------
-- PEOPLE: teachers / staff / students / parents
-- ---------------------------------------------------------------------
create table teachers (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references schools(id) on delete cascade,
  profile_id uuid references profiles(id) on delete set null,
  employee_id text not null,
  full_name text not null,
  father_name text,
  cnic text,
  gender gender_type,
  mobile text,
  email text,
  address text,
  designation text,
  qualification text,
  joining_date date,
  photo_url text,
  status person_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  unique (school_id, employee_id)
);
create index idx_teachers_school on teachers(school_id);

alter table sections
  add constraint fk_sections_class_teacher foreign key (class_teacher_id) references teachers(id) on delete set null;

create table staff (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references schools(id) on delete cascade,
  profile_id uuid references profiles(id) on delete set null,
  employee_id text not null,
  full_name text not null,
  designation text,
  mobile text,
  email text,
  joining_date date,
  status person_status not null default 'active',
  created_at timestamptz not null default now(),
  unique (school_id, employee_id)
);

create table teacher_subjects (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references schools(id) on delete cascade,
  teacher_id uuid not null references teachers(id) on delete cascade,
  subject_id uuid not null references subjects(id) on delete cascade,
  class_id uuid references classes(id) on delete cascade,
  section_id uuid references sections(id) on delete cascade,
  unique (teacher_id, subject_id, class_id, section_id)
);

create table parents (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references schools(id) on delete cascade,
  profile_id uuid references profiles(id) on delete set null,
  full_name text not null,
  relation text default 'father',
  cnic text,
  mobile text not null,
  email text,
  address text,
  occupation text,
  created_at timestamptz not null default now()
);
create index idx_parents_school on parents(school_id);

create table students (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references schools(id) on delete cascade,
  profile_id uuid references profiles(id) on delete set null,
  admission_number text not null,
  full_name text not null,
  father_name text,
  mother_name text,
  gender gender_type,
  date_of_birth date,
  b_form_number text,
  contact_number text,
  address text,
  district text,
  province text,
  class_id uuid references classes(id) on delete set null,
  section_id uuid references sections(id) on delete set null,
  roll_number text,
  admission_date date not null default current_date,
  previous_school text,
  blood_group text,
  emergency_contact text,
  photo_url text,
  medical_info text,
  status person_status not null default 'active',
  academic_session_id uuid references academic_sessions(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  unique (school_id, admission_number)
);
create index idx_students_school on students(school_id);
create index idx_students_class on students(class_id, section_id);
create index idx_students_status on students(status);

create table student_parents (
  student_id uuid not null references students(id) on delete cascade,
  parent_id uuid not null references parents(id) on delete cascade,
  primary key (student_id, parent_id)
);

-- ---------------------------------------------------------------------
-- ATTENDANCE
-- ---------------------------------------------------------------------
create table attendance (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references schools(id) on delete cascade,
  student_id uuid not null references students(id) on delete cascade,
  class_id uuid references classes(id),
  section_id uuid references sections(id),
  date date not null,
  status attendance_status not null default 'present',
  remarks text,
  marked_by uuid references profiles(id),
  created_at timestamptz not null default now(),
  unique (student_id, date)
);
create index idx_attendance_school_date on attendance(school_id, date);
create index idx_attendance_class_date on attendance(class_id, section_id, date);

create table teacher_attendance (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references schools(id) on delete cascade,
  teacher_id uuid not null references teachers(id) on delete cascade,
  date date not null,
  status attendance_status not null default 'present',
  remarks text,
  marked_by uuid references profiles(id),
  created_at timestamptz not null default now(),
  unique (teacher_id, date)
);
create index idx_teacher_attendance_school_date on teacher_attendance(school_id, date);

-- ---------------------------------------------------------------------
-- TIMETABLE
-- ---------------------------------------------------------------------
create table timetables (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references schools(id) on delete cascade,
  class_id uuid not null references classes(id) on delete cascade,
  section_id uuid not null references sections(id) on delete cascade,
  subject_id uuid not null references subjects(id) on delete cascade,
  teacher_id uuid references teachers(id) on delete set null,
  day_of_week smallint not null check (day_of_week between 0 and 6),
  period_number smallint not null,
  start_time time not null,
  end_time time not null,
  room text,
  created_at timestamptz not null default now(),
  unique (section_id, day_of_week, period_number)
);
create index idx_timetables_school on timetables(school_id);
create index idx_timetables_teacher on timetables(teacher_id, day_of_week);

-- ---------------------------------------------------------------------
-- EXAMS / MARKS / RESULTS
-- ---------------------------------------------------------------------
create table exams (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references schools(id) on delete cascade,
  academic_session_id uuid references academic_sessions(id) on delete set null,
  name text not null,
  exam_type exam_type not null default 'monthly_test',
  start_date date not null,
  end_date date not null,
  created_at timestamptz not null default now()
);
create index idx_exams_school on exams(school_id);

create table exam_subjects (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references schools(id) on delete cascade,
  exam_id uuid not null references exams(id) on delete cascade,
  class_id uuid not null references classes(id) on delete cascade,
  subject_id uuid not null references subjects(id) on delete cascade,
  exam_date date,
  exam_room text,
  invigilator_id uuid references teachers(id) on delete set null,
  total_marks numeric not null default 100,
  passing_marks numeric not null default 33,
  unique (exam_id, class_id, subject_id)
);
create index idx_exam_subjects_exam on exam_subjects(exam_id);

create table marks (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references schools(id) on delete cascade,
  exam_subject_id uuid not null references exam_subjects(id) on delete cascade,
  student_id uuid not null references students(id) on delete cascade,
  obtained_marks numeric not null default 0,
  entered_by uuid references profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (exam_subject_id, student_id)
);
create index idx_marks_student on marks(student_id);

create table results (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references schools(id) on delete cascade,
  exam_id uuid not null references exams(id) on delete cascade,
  student_id uuid not null references students(id) on delete cascade,
  total_obtained numeric not null default 0,
  total_marks numeric not null default 0,
  percentage numeric not null default 0,
  grade text,
  gpa numeric,
  class_rank int,
  is_pass boolean not null default true,
  created_at timestamptz not null default now(),
  unique (exam_id, student_id)
);
create index idx_results_student on results(student_id);

-- ---------------------------------------------------------------------
-- HOMEWORK / ASSIGNMENTS
-- ---------------------------------------------------------------------
create table homework (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references schools(id) on delete cascade,
  class_id uuid not null references classes(id) on delete cascade,
  section_id uuid references sections(id) on delete cascade,
  subject_id uuid not null references subjects(id) on delete cascade,
  teacher_id uuid references teachers(id) on delete set null,
  title text not null,
  description text,
  attachment_url text,
  due_date date not null,
  created_at timestamptz not null default now()
);
create index idx_homework_school on homework(school_id);
create index idx_homework_class on homework(class_id, section_id);

create table assignments (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references schools(id) on delete cascade,
  homework_id uuid not null references homework(id) on delete cascade,
  student_id uuid not null references students(id) on delete cascade,
  status homework_status not null default 'pending',
  submitted_at timestamptz,
  submission_url text,
  remarks text,
  unique (homework_id, student_id)
);

-- ---------------------------------------------------------------------
-- FEES / FINANCE
-- ---------------------------------------------------------------------
create table fee_structures (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references schools(id) on delete cascade,
  class_id uuid references classes(id) on delete cascade,
  academic_session_id uuid references academic_sessions(id) on delete set null,
  name text not null, -- Monthly Tuition, Admission, Exam, Transport ...
  amount numeric not null,
  frequency text not null default 'monthly', -- monthly, one_time, quarterly, annual
  created_at timestamptz not null default now()
);
create index idx_fee_structures_school on fee_structures(school_id);

create table fees (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references schools(id) on delete cascade,
  student_id uuid not null references students(id) on delete cascade,
  fee_structure_id uuid references fee_structures(id) on delete set null,
  title text not null,
  amount numeric not null,
  discount numeric not null default 0,
  due_date date not null,
  status fee_status not null default 'unpaid',
  created_at timestamptz not null default now()
);
create index idx_fees_school on fees(school_id);
create index idx_fees_student on fees(student_id);
create index idx_fees_status on fees(status);

create table payments (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references schools(id) on delete cascade,
  fee_id uuid not null references fees(id) on delete cascade,
  student_id uuid not null references students(id) on delete cascade,
  amount_paid numeric not null,
  payment_date date not null default current_date,
  payment_method text default 'cash',
  receipt_number text,
  received_by uuid references profiles(id),
  created_at timestamptz not null default now()
);
create index idx_payments_school on payments(school_id);
create index idx_payments_student on payments(student_id);

-- ---------------------------------------------------------------------
-- LEAVE / NOTICES / EVENTS
-- ---------------------------------------------------------------------
create table leave_requests (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references schools(id) on delete cascade,
  requester_profile_id uuid not null references profiles(id) on delete cascade,
  requester_role user_role not null,
  student_id uuid references students(id) on delete cascade,
  teacher_id uuid references teachers(id) on delete cascade,
  start_date date not null,
  end_date date not null,
  reason text not null,
  status leave_status not null default 'pending',
  reviewed_by uuid references profiles(id),
  review_remarks text,
  created_at timestamptz not null default now()
);
create index idx_leave_school on leave_requests(school_id);

create table notices (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references schools(id) on delete cascade,
  title text not null,
  description text,
  attachment_url text,
  audience notice_audience not null default 'all',
  class_id uuid references classes(id) on delete cascade,
  priority text not null default 'normal',
  publish_date date not null default current_date,
  expiry_date date,
  created_by uuid references profiles(id),
  created_at timestamptz not null default now()
);
create index idx_notices_school on notices(school_id);

create table events (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references schools(id) on delete cascade,
  title text not null,
  description text,
  start_date date not null,
  end_date date,
  location text,
  created_by uuid references profiles(id),
  created_at timestamptz not null default now()
);
create index idx_events_school on events(school_id);

-- ---------------------------------------------------------------------
-- LIBRARY
-- ---------------------------------------------------------------------
create table books (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references schools(id) on delete cascade,
  title text not null,
  author text,
  isbn text,
  category text,
  total_copies int not null default 1,
  available_copies int not null default 1,
  created_at timestamptz not null default now()
);
create index idx_books_school on books(school_id);

create table book_issues (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references schools(id) on delete cascade,
  book_id uuid not null references books(id) on delete cascade,
  student_id uuid references students(id) on delete cascade,
  teacher_id uuid references teachers(id) on delete cascade,
  issue_date date not null default current_date,
  due_date date not null,
  return_date date,
  fine_amount numeric not null default 0,
  created_at timestamptz not null default now()
);
create index idx_book_issues_school on book_issues(school_id);

-- ---------------------------------------------------------------------
-- TRANSPORT
-- ---------------------------------------------------------------------
create table vehicles (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references schools(id) on delete cascade,
  vehicle_number text not null,
  vehicle_type text,
  capacity int,
  driver_name text,
  driver_contact text,
  created_at timestamptz not null default now()
);

create table routes (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references schools(id) on delete cascade,
  vehicle_id uuid references vehicles(id) on delete set null,
  name text not null,
  fare numeric not null default 0,
  created_at timestamptz not null default now()
);

create table route_students (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references schools(id) on delete cascade,
  route_id uuid not null references routes(id) on delete cascade,
  student_id uuid not null references students(id) on delete cascade,
  stop_name text,
  unique (route_id, student_id)
);

-- ---------------------------------------------------------------------
-- INVENTORY / CERTIFICATES / DOCUMENTS
-- ---------------------------------------------------------------------
create table inventory (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references schools(id) on delete cascade,
  asset_id text not null,
  name text not null,
  category text,
  quantity int not null default 1,
  purchase_date date,
  cost numeric,
  condition text default 'good',
  location text,
  responsible_person text,
  created_at timestamptz not null default now(),
  unique (school_id, asset_id)
);

create table certificates (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references schools(id) on delete cascade,
  student_id uuid not null references students(id) on delete cascade,
  certificate_type text not null,
  issue_date date not null default current_date,
  file_url text,
  issued_by uuid references profiles(id),
  created_at timestamptz not null default now()
);

create table documents (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references schools(id) on delete cascade,
  owner_type text not null, -- student | teacher | staff | school
  owner_id uuid,
  title text not null,
  file_url text not null,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- NOTIFICATIONS / AUDIT LOGS
-- ---------------------------------------------------------------------
create table notifications (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references schools(id) on delete cascade,
  profile_id uuid not null references profiles(id) on delete cascade,
  title text not null,
  message text,
  type text default 'general',
  is_read boolean not null default false,
  link text,
  created_at timestamptz not null default now()
);
create index idx_notifications_profile on notifications(profile_id, is_read);

create table audit_logs (
  id uuid primary key default gen_random_uuid(),
  school_id uuid references schools(id) on delete cascade,
  profile_id uuid references profiles(id),
  action text not null,
  target_table text,
  target_id uuid,
  metadata jsonb default '{}'::jsonb,
  ip_address text,
  created_at timestamptz not null default now()
);
create index idx_audit_school on audit_logs(school_id, created_at desc);

-- ---------------------------------------------------------------------
-- updated_at trigger helper
-- ---------------------------------------------------------------------
create or replace function set_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

do $$
declare t text;
begin
  foreach t in array array['schools','profiles','teachers','students','marks']
  loop
    execute format('create trigger trg_set_updated_at before update on %I for each row execute function set_updated_at();', t);
  end loop;
end $$;
