-- =====================================================================
-- Phase 6 — Parent + Student Portals.
--
-- Closes a set of pre-existing RLS gaps left over from the original
-- generic tenant-wide policy loop in 0002_rls.sql (its own comment
-- flagged this as deferred: "kept permissive at the tenant level...
-- tighten further ... since fine-grained per-row policies vary by table
-- shape"). Under that generic policy, ANY authenticated user in a school
-- could SELECT every row of `students`, `parents`, `student_parents`,
-- `attendance`, `leave_requests`, and `notifications` — meaning a parent
-- or student could read another family's personal details, attendance,
-- leave reasons, or notifications by calling the table directly,
-- regardless of what the app's UI shows. This migration makes the
-- database itself enforce "a parent/student may see only their own or
-- their own child's records" — the app no longer has to be trusted.
--
-- It also finally wires up the previously-unused `assignments` table
-- (homework submissions) and `leave_requests` for parent/student write
-- access, and adds a column-level guard so a student's own profile
-- self-service update can never touch administrator-controlled fields.
-- No existing table is dropped or recreated; every change is additive.
-- =====================================================================

-- ---------------------------------------------------------------------
-- Helpers: a parent/student's own authorized student id(s). SECURITY
-- DEFINER so the lookup runs as the (superuser-owned) function and
-- bypasses RLS internally — referencing `students`/`student_parents`/
-- `parents` directly inside each other's policies would otherwise cause
-- "infinite recursion detected in policy" the moment a parent policy on
-- one table queries a table whose own policy queries it back.
-- ---------------------------------------------------------------------
create or replace function my_student_ids() returns setof uuid as $$
  select id from students where profile_id = auth.uid()
  union
  select sp.student_id from student_parents sp
  join parents p on p.id = sp.parent_id
  where p.profile_id = auth.uid()
$$ language sql stable security definer set search_path = public;

create or replace function my_parent_id() returns uuid as $$
  select id from parents where profile_id = auth.uid()
$$ language sql stable security definer set search_path = public;

-- ---------------------------------------------------------------------
-- ATTENDANCE: staff (teacher/admin/accountant/super_admin) keep full
-- tenant visibility (needed for marking/analytics); a parent/student may
-- see only their own/child's attendance rows. Writes are unchanged
-- (staff-only, from the original generic policy).
-- ---------------------------------------------------------------------
drop policy if exists attendance_tenant_select on attendance;
create policy attendance_select on attendance for select
  using (
    is_super_admin()
    or (is_school_staff() and school_id = auth_school_id())
    or student_id in (select my_student_ids())
  );

-- ---------------------------------------------------------------------
-- STUDENTS: staff keep full tenant visibility; a student may see (and,
-- within limits, edit) only their own row; a parent may see only their
-- own children.
-- ---------------------------------------------------------------------
drop policy if exists students_tenant_select on students;
create policy students_select on students for select
  using (
    is_super_admin()
    or (is_school_staff() and school_id = auth_school_id())
    or profile_id = auth.uid()
    or id in (select my_student_ids())
  );

-- A student may update their own row, but only their own contact
-- details — never admission/class/section/roll/status/session, which
-- stay administrator-controlled. Enforced below by a trigger, not just
-- this policy, so it holds regardless of which permissive policy let
-- the UPDATE through.
create policy students_self_update on students for update
  using (auth_role() = 'student' and profile_id = auth.uid())
  with check (profile_id = auth.uid());

create or replace function guard_student_self_update() returns trigger as $$
begin
  if auth_role() = 'student' then
    if new.admission_number is distinct from old.admission_number
      or new.class_id is distinct from old.class_id
      or new.section_id is distinct from old.section_id
      or new.roll_number is distinct from old.roll_number
      or new.academic_session_id is distinct from old.academic_session_id
      or new.status is distinct from old.status
      or new.admission_date is distinct from old.admission_date
      or new.school_id is distinct from old.school_id
      or new.profile_id is distinct from old.profile_id
      or new.admission_number is distinct from old.admission_number
    then
      raise exception 'Students may update only their own contact details, not administrative fields.';
    end if;
  end if;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists trg_guard_student_self_update on students;
create trigger trg_guard_student_self_update before update on students
  for each row execute function guard_student_self_update();

-- ---------------------------------------------------------------------
-- PARENTS: staff keep full tenant visibility; a parent may see only
-- their own record.
-- ---------------------------------------------------------------------
drop policy if exists parents_tenant_select on parents;
create policy parents_select on parents for select
  using (is_super_admin() or (is_school_staff() and school_id = auth_school_id()) or profile_id = auth.uid());

-- ---------------------------------------------------------------------
-- STUDENT_PARENTS (the link table itself): staff keep full tenant
-- visibility; a parent/student may see only their own linkage rows —
-- never the full parent-child map of the school.
-- ---------------------------------------------------------------------
drop policy if exists student_parents_tenant_select on student_parents;
create policy student_parents_select on student_parents for select
  using (
    is_super_admin()
    or (is_school_staff() and school_id = auth_school_id())
    or parent_id = my_parent_id()
    or student_id in (select my_student_ids())
  );

-- ---------------------------------------------------------------------
-- ASSIGNMENTS (homework submissions — homework_id + student_id +
-- status/submission_url/remarks): staff keep full tenant visibility and
-- write access (unchanged); a student may now see and submit only their
-- own row, and a parent may see (but not write) their child's. Without
-- this, the "submit homework" feature was previously impossible: the
-- generic policy only ever let is_school_staff() write here.
-- ---------------------------------------------------------------------
drop policy if exists assignments_tenant_select on assignments;
create policy assignments_select on assignments for select
  using (
    is_super_admin()
    or (is_school_staff() and school_id = auth_school_id())
    or student_id in (select my_student_ids())
  );

create policy assignments_student_insert on assignments for insert
  with check (
    auth_role() = 'student'
    and school_id = auth_school_id()
    and student_id in (select my_student_ids())
    and status in ('pending', 'submitted')
  );

create policy assignments_student_update on assignments for update
  using (
    auth_role() = 'student'
    and student_id in (select my_student_ids())
    and status <> 'checked'
  )
  with check (status in ('submitted', 'pending'));

-- ---------------------------------------------------------------------
-- LEAVE_REQUESTS: staff keep full tenant visibility and review rights
-- (unchanged); any user (parent/student/teacher) may now submit and
-- view their OWN requests — previously impossible, since only
-- is_school_staff() could write under the generic policy.
-- ---------------------------------------------------------------------
drop policy if exists leave_requests_tenant_select on leave_requests;
create policy leave_requests_select on leave_requests for select
  using (is_super_admin() or (is_school_staff() and school_id = auth_school_id()) or requester_profile_id = auth.uid());

create policy leave_requests_self_insert on leave_requests for insert
  with check (requester_profile_id = auth.uid() and school_id = auth_school_id() and status = 'pending');

-- ---------------------------------------------------------------------
-- NOTIFICATIONS: staff keep full tenant visibility (oversight); every
-- other user may see and mark-as-read only their OWN notifications —
-- previously any same-school user could read (or even edit/delete)
-- anyone else's notifications under the generic policy.
-- ---------------------------------------------------------------------
drop policy if exists notifications_tenant_select on notifications;
create policy notifications_select on notifications for select
  using (is_super_admin() or (is_school_staff() and school_id = auth_school_id()) or profile_id = auth.uid());

create policy notifications_self_update on notifications for update
  using (profile_id = auth.uid())
  with check (profile_id = auth.uid());

-- A non-staff recipient may only flip is_read — never retitle, redirect,
-- or reassign someone else's notification to themselves.
create or replace function guard_notification_self_update() returns trigger as $$
begin
  if not is_school_staff() then
    if new.title is distinct from old.title
      or new.message is distinct from old.message
      or new.type is distinct from old.type
      or new.link is distinct from old.link
      or new.profile_id is distinct from old.profile_id
      or new.school_id is distinct from old.school_id
    then
      raise exception 'You may only mark a notification as read.';
    end if;
  end if;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists trg_guard_notification_self_update on notifications;
create trigger trg_guard_notification_self_update before update on notifications
  for each row execute function guard_notification_self_update();
