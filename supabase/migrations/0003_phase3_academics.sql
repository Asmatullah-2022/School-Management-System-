-- =====================================================================
-- Phase 3 — Subjects, Periods, Subject Assignments, Timetable
-- Extends existing tables (subjects, teacher_subjects, timetables) rather
-- than introducing a parallel structure. Adds the new `periods` table.
-- =====================================================================

-- ---------------------------------------------------------------------
-- SCHOOLS: which weekdays the school operates (default Mon–Sat)
-- ---------------------------------------------------------------------
alter table schools add column if not exists working_days smallint[] not null default '{1,2,3,4,5,6}';
-- day numbers follow JS Date.getDay(): 0=Sunday .. 6=Saturday

-- ---------------------------------------------------------------------
-- SUBJECTS: extend with the Phase 3 fields
-- ---------------------------------------------------------------------
alter table subjects add column if not exists name_urdu text;
alter table subjects add column if not exists description text;
alter table subjects add column if not exists subject_type text not null default 'core'
  check (subject_type in ('core', 'elective', 'optional'));
alter table subjects add column if not exists total_marks numeric not null default 100;
alter table subjects add column if not exists passing_marks numeric not null default 33;
alter table subjects add column if not exists status text not null default 'active'
  check (status in ('active', 'archived'));
alter table subjects add column if not exists updated_at timestamptz not null default now();

drop trigger if exists trg_set_updated_at on subjects;
create trigger trg_set_updated_at before update on subjects
  for each row execute function set_updated_at();

-- ---------------------------------------------------------------------
-- PERIODS: reusable period/break definitions per school
-- ---------------------------------------------------------------------
create table if not exists periods (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references schools(id) on delete cascade,
  period_number int not null,
  name text not null,
  start_time time not null,
  end_time time not null,
  is_break boolean not null default false,
  sort_order int not null default 0,
  status text not null default 'active' check (status in ('active', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (school_id, period_number)
);
create index if not exists idx_periods_school on periods(school_id);

drop trigger if exists trg_set_updated_at on periods;
create trigger trg_set_updated_at before update on periods
  for each row execute function set_updated_at();

-- ---------------------------------------------------------------------
-- TEACHER_SUBJECTS: extend into a proper "subject assignment"
-- (subject → class → section → teacher, with weekly period count)
-- ---------------------------------------------------------------------
alter table teacher_subjects add column if not exists academic_session_id uuid references academic_sessions(id) on delete set null;
alter table teacher_subjects add column if not exists weekly_periods int not null default 5;
alter table teacher_subjects add column if not exists status text not null default 'active'
  check (status in ('active', 'inactive'));
alter table teacher_subjects add column if not exists updated_at timestamptz not null default now();

drop trigger if exists trg_set_updated_at on teacher_subjects;
create trigger trg_set_updated_at before update on teacher_subjects
  for each row execute function set_updated_at();

-- A class/section can only have ONE active teacher assigned per subject —
-- prevents the duplicate assignments the spec calls out.
drop index if exists uq_teacher_subjects_assignment;
create unique index uq_teacher_subjects_assignment
  on teacher_subjects (school_id, class_id, section_id, subject_id)
  where section_id is not null and status = 'active';

create index if not exists idx_teacher_subjects_teacher on teacher_subjects(teacher_id);

-- ---------------------------------------------------------------------
-- TIMETABLES: reference periods instead of duplicating start/end time,
-- and add DB-level conflict guards (teacher / section / room double-books)
-- ---------------------------------------------------------------------
alter table timetables add column if not exists period_id uuid references periods(id) on delete cascade;
alter table timetables add column if not exists academic_session_id uuid references academic_sessions(id) on delete set null;
alter table timetables alter column start_time drop not null;
alter table timetables alter column end_time drop not null;
alter table timetables add column if not exists updated_at timestamptz not null default now();

drop trigger if exists trg_set_updated_at on timetables;
create trigger trg_set_updated_at before update on timetables
  for each row execute function set_updated_at();

-- Replace the old period_number-based uniqueness with period_id-based
-- conflict guards (source of truth is now the periods table).
alter table timetables drop constraint if exists timetables_section_id_day_of_week_period_number_key;

drop index if exists uq_timetable_section_slot;
create unique index uq_timetable_section_slot
  on timetables (school_id, section_id, day_of_week, period_id);

drop index if exists uq_timetable_teacher_slot;
create unique index uq_timetable_teacher_slot
  on timetables (school_id, teacher_id, day_of_week, period_id)
  where teacher_id is not null;

drop index if exists uq_timetable_room_slot;
create unique index uq_timetable_room_slot
  on timetables (school_id, room, day_of_week, period_id)
  where room is not null and room <> '';

create index if not exists idx_timetables_section on timetables(section_id, day_of_week);

-- ---------------------------------------------------------------------
-- RLS: tighten writes on the four Phase 3 tables to admin roles only.
-- (Reading stays school-wide via the generic tenant policy from 0002 —
-- subjects/timetables are not sensitive per-student data.)
-- ---------------------------------------------------------------------
create or replace function is_school_admin_role() returns boolean as $$
  select auth_role() in ('super_admin', 'school_admin')
$$ language sql stable security definer set search_path = public;

do $$
declare tbl text;
declare admin_write_tables text[] := array['subjects', 'class_subjects', 'teacher_subjects', 'timetables'];
begin
  foreach tbl in array admin_write_tables loop
    execute format('drop policy if exists %I on %I;', tbl || '_staff_insert', tbl);
    execute format('drop policy if exists %I on %I;', tbl || '_staff_update', tbl);
    execute format('drop policy if exists %I on %I;', tbl || '_staff_delete', tbl);

    execute format(
      'create policy %I on %I for insert with check (is_super_admin() or (is_school_admin_role() and school_id = auth_school_id()));',
      tbl || '_admin_insert', tbl
    );
    execute format(
      'create policy %I on %I for update using (is_super_admin() or (is_school_admin_role() and school_id = auth_school_id()));',
      tbl || '_admin_update', tbl
    );
    execute format(
      'create policy %I on %I for delete using (is_super_admin() or (is_school_admin_role() and school_id = auth_school_id()));',
      tbl || '_admin_delete', tbl
    );
  end loop;
end $$;

-- periods: same tenant-select + admin-write pattern (table didn't exist in 0002's loop)
alter table periods enable row level security;
create policy periods_tenant_select on periods for select
  using (is_super_admin() or school_id = auth_school_id());
create policy periods_admin_insert on periods for insert
  with check (is_super_admin() or (is_school_admin_role() and school_id = auth_school_id()));
create policy periods_admin_update on periods for update
  using (is_super_admin() or (is_school_admin_role() and school_id = auth_school_id()));
create policy periods_admin_delete on periods for delete
  using (is_super_admin() or (is_school_admin_role() and school_id = auth_school_id()));
