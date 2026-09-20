-- =====================================================================
-- PHASE 10 — Security/RLS hardening found during the production-readiness
-- audit. No table is dropped or recreated; every change is additive or a
-- policy replacement, exactly like the pattern used in 0006/0008/0009.
--
-- Findings fixed here:
--
-- 1. `teachers` — never narrowed past the original 0002 generic
--    tenant-wide SELECT policy, so ANY authenticated user in a school
--    (including a parent or student) could read every teacher's CNIC,
--    mobile, personal email and home address by querying the table
--    directly — confirmed reachable through the real app too: the
--    Timetable page and the Teacher dashboard passed the full teacher
--    list (fetched under this same policy) into Client Components,
--    which serializes it into the page's RSC payload for every viewer,
--    including parents/students. The app-side fix (this migration's
--    companion code change) now fetches only a name-only projection for
--    those non-admin call sites; this migration backs that with a real
--    database-level fix so the restriction cannot be bypassed by calling
--    Supabase directly: the `teachers` table itself becomes staff-only,
--    and a `teacher_directory` view exposes just id/school_id/full_name/
--    status to every same-school user (still needed so a parent/student
--    can see a teacher's name against a timetable slot or homework item).
--
-- 2. `staff`, `teacher_attendance`, `documents` — same generic tenant-wide
--    SELECT policy, never narrowed, and (unlike `teachers`) never used by
--    any parent/student-reachable page at all. Since there is no
--    legitimate non-staff use case, these are simply narrowed to
--    staff-only SELECT.
-- =====================================================================

-- ---------------------------------------------------------------------
-- TEACHERS: staff (existing full-tenant access) only, at the table level.
-- ---------------------------------------------------------------------
drop policy if exists teachers_tenant_select on teachers;
create policy teachers_select on teachers for select
  using (is_super_admin() or (is_school_staff() and school_id = auth_school_id()));

-- A safe, column-limited directory for non-staff viewers (parent/student
-- timetable and homework screens need a teacher's name, never their CNIC
-- or contact details). Declared with security_invoker = off (the
-- default) so it runs as its owner and is NOT subject to the table
-- policy above — its own `where` clause re-implements the same tenant
-- scoping using the existing SECURITY DEFINER helpers.
create or replace view teacher_directory as
  select id, school_id, full_name, status
  from teachers
  where is_super_admin() or school_id = auth_school_id();

grant select on teacher_directory to authenticated;

-- ---------------------------------------------------------------------
-- STAFF / TEACHER_ATTENDANCE / DOCUMENTS: no parent/student-facing
-- feature reads these tables; narrow SELECT to staff (insert/update/
-- delete were already staff-only from the original generic policy).
-- ---------------------------------------------------------------------
drop policy if exists staff_tenant_select on staff;
create policy staff_select on staff for select
  using (is_super_admin() or (is_school_staff() and school_id = auth_school_id()));

drop policy if exists teacher_attendance_tenant_select on teacher_attendance;
create policy teacher_attendance_select on teacher_attendance for select
  using (is_super_admin() or (is_school_staff() and school_id = auth_school_id()));

drop policy if exists documents_tenant_select on documents;
create policy documents_select on documents for select
  using (is_super_admin() or (is_school_staff() and school_id = auth_school_id()));

-- ---------------------------------------------------------------------
-- Missing indexes found during the query/index audit — each one backs a
-- query pattern that currently has no matching index (verified against
-- the actual table definitions in 0001/0009, not added speculatively):
--   * attendance: every per-student attendance percentage/history lookup
--     (parent/student portal, Student 360) filters by student_id alone;
--     the existing indexes are (school_id, date) and (class_id,
--     section_id, date), neither of which has student_id as a leading
--     column.
--   * book_issues / route_students: per-student library/transport
--     history filters by student_id alone; route_students' only index is
--     the (route_id, student_id) unique constraint, which cannot serve a
--     student_id-only lookup, and book_issues has no student index at all.
--   * certificates: per-student certificate history (My Certificates,
--     Student 360) filters by student_id; the only existing index is the
--     partial unique index on certificate_number.
-- (marks/results already get this for free from their existing
-- unique(exam_subject_id/exam_id, student_id) indexes, whose leading
-- column already serves an exam-only lookup — not duplicated here.)
-- ---------------------------------------------------------------------
create index if not exists idx_attendance_student on attendance(student_id);
create index if not exists idx_book_issues_student on book_issues(student_id);
create index if not exists idx_route_students_student on route_students(student_id);
create index if not exists idx_certificates_student on certificates(student_id);

-- ---------------------------------------------------------------------
-- ACADEMIC INTEGRITY: `marks` already has a DB-level floor
-- (marks_obtained_range check, obtained_marks >= 0, from 0004) but no
-- ceiling — nothing stopped obtained_marks from exceeding the owning
-- exam_subject's total_marks except client-side form validation, which a
-- direct RPC/API call bypasses entirely. A CHECK constraint can't express
-- this (it would need a cross-table subquery), so it's enforced with a
-- trigger, the same mechanism already used for the published-mark guard
-- immediately above it in 0004.
-- ---------------------------------------------------------------------
create or replace function guard_marks_within_total() returns trigger as $$
declare
  cap numeric;
begin
  select total_marks into cap from exam_subjects where id = new.exam_subject_id;
  if cap is not null and new.obtained_marks > cap then
    raise exception 'Obtained marks (%) cannot exceed the total marks for this subject (%).', new.obtained_marks, cap;
  end if;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists trg_guard_marks_within_total on marks;
create trigger trg_guard_marks_within_total before insert or update on marks
  for each row execute function guard_marks_within_total();
