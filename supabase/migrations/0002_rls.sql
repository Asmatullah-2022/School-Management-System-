-- =====================================================================
-- Row Level Security — multi-tenant isolation + role-based access
-- =====================================================================

-- Helper: current user's school_id and role, read from profiles table.
create or replace function auth_school_id() returns uuid as $$
  select school_id from profiles where id = auth.uid()
$$ language sql stable security definer set search_path = public;

create or replace function auth_role() returns user_role as $$
  select role from profiles where id = auth.uid()
$$ language sql stable security definer set search_path = public;

create or replace function is_super_admin() returns boolean as $$
  select auth_role() = 'super_admin'
$$ language sql stable security definer set search_path = public;

create or replace function is_school_staff() returns boolean as $$
  select auth_role() in ('super_admin','school_admin','teacher','accountant')
$$ language sql stable security definer set search_path = public;

-- profiles: users can read/update their own row; staff can read same-school profiles
alter table profiles enable row level security;
create policy profiles_self_select on profiles for select
  using (id = auth.uid() or is_super_admin() or (is_school_staff() and school_id = auth_school_id()));
create policy profiles_self_update on profiles for update
  using (id = auth.uid()) with check (id = auth.uid());
create policy profiles_admin_write on profiles for insert
  with check (is_super_admin() or (auth_role() = 'school_admin' and school_id = auth_school_id()));

-- schools: super_admin sees all; others see only their own school
alter table schools enable row level security;
create policy schools_select on schools for select
  using (is_super_admin() or id = auth_school_id());
create policy schools_admin_write on schools for insert with check (is_super_admin());
create policy schools_admin_update on schools for update
  using (is_super_admin() or (auth_role() = 'school_admin' and id = auth_school_id()));

-- Generic tenant-scoped policy applied to every school_id-bearing table.
do $$
declare tbl text;
declare tenant_tables text[] := array[
  'academic_sessions','classes','sections','subjects','class_subjects',
  'teachers','staff','teacher_subjects','parents','students','student_parents',
  'attendance','teacher_attendance','timetables','exams','exam_subjects','marks','results',
  'homework','assignments','fee_structures','fees','payments','leave_requests',
  'notices','events','books','book_issues','vehicles','routes','route_students',
  'inventory','certificates','documents','notifications','audit_logs'
];
begin
  foreach tbl in array tenant_tables loop
    execute format('alter table %I enable row level security;', tbl);
    execute format(
      'create policy %I on %I for select using (is_super_admin() or school_id = auth_school_id());',
      tbl || '_tenant_select', tbl
    );
    execute format(
      'create policy %I on %I for insert with check (is_super_admin() or (is_school_staff() and school_id = auth_school_id()));',
      tbl || '_staff_insert', tbl
    );
    execute format(
      'create policy %I on %I for update using (is_super_admin() or (is_school_staff() and school_id = auth_school_id()));',
      tbl || '_staff_update', tbl
    );
    execute format(
      'create policy %I on %I for delete using (is_super_admin() or (is_school_staff() and school_id = auth_school_id()));',
      tbl || '_staff_delete', tbl
    );
  end loop;
end $$;

-- Parents/students can additionally read only rows tied to their own child/self
-- (kept permissive at the tenant level above; tighten further with app-level
-- filtering by student_id/parent profile_id in queries, since fine-grained
-- per-row policies vary by table shape).
