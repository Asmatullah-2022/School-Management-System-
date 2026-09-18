-- =====================================================================
-- Phase 4 — Examinations, Exam Schedule, Marks workflow, Results,
-- configurable grading, and published-mark revision audit trail.
-- Extends existing tables (exams, exam_subjects, marks, results) rather
-- than introducing a parallel structure.
-- =====================================================================

alter type exam_type add value if not exists 'unit_test';
alter type exam_type add value if not exists 'custom';

create type exam_status as enum ('draft', 'scheduled', 'ongoing', 'completed', 'published', 'archived');
create type marks_status as enum ('draft', 'submitted', 'verified', 'published');

-- ---------------------------------------------------------------------
-- EXAMS: add workflow status + publication tracking
-- ---------------------------------------------------------------------
alter table exams add column if not exists status exam_status not null default 'draft';
alter table exams add column if not exists updated_at timestamptz not null default now();
alter table exams add column if not exists created_by uuid references profiles(id);
alter table exams add column if not exists published_at timestamptz;
alter table exams add column if not exists published_by uuid references profiles(id);

drop trigger if exists trg_set_updated_at on exams;
create trigger trg_set_updated_at before update on exams
  for each row execute function set_updated_at();

-- ---------------------------------------------------------------------
-- EXAM_SUBJECTS: this doubles as the "Exam Schedule" entity — add
-- section, timing, and DB-level conflict guards (room / invigilator /
-- class-section double-booked on the same date).
-- ---------------------------------------------------------------------
alter table exam_subjects add column if not exists section_id uuid references sections(id) on delete cascade;
alter table exam_subjects add column if not exists start_time time;
alter table exam_subjects add column if not exists end_time time;
alter table exam_subjects add column if not exists updated_at timestamptz not null default now();

drop trigger if exists trg_set_updated_at on exam_subjects;
create trigger trg_set_updated_at before update on exam_subjects
  for each row execute function set_updated_at();

create index if not exists idx_exam_subjects_section on exam_subjects(section_id);

drop index if exists uq_exam_schedule_class_section_slot;
create unique index uq_exam_schedule_class_section_slot
  on exam_subjects (school_id, class_id, section_id, exam_date)
  where section_id is not null and exam_date is not null;

drop index if exists uq_exam_schedule_room_slot;
create unique index uq_exam_schedule_room_slot
  on exam_subjects (school_id, exam_room, exam_date)
  where exam_room is not null and exam_room <> '' and exam_date is not null;

drop index if exists uq_exam_schedule_invigilator_slot;
create unique index uq_exam_schedule_invigilator_slot
  on exam_subjects (school_id, invigilator_id, exam_date)
  where invigilator_id is not null and exam_date is not null;

-- ---------------------------------------------------------------------
-- MARKS: draft -> submitted -> verified -> published workflow
-- ---------------------------------------------------------------------
alter table marks add column if not exists status marks_status not null default 'draft';
alter table marks add column if not exists submitted_at timestamptz;
alter table marks add column if not exists submitted_by uuid references profiles(id);
alter table marks add column if not exists verified_at timestamptz;
alter table marks add column if not exists verified_by uuid references profiles(id);
alter table marks add column if not exists published_at timestamptz;

alter table marks add constraint marks_obtained_range check (obtained_marks >= 0);

drop trigger if exists trg_set_updated_at on marks;
create trigger trg_set_updated_at before update on marks
  for each row execute function set_updated_at();

-- ---------------------------------------------------------------------
-- RESULTS: aggregate per student per exam (computed, not hand-entered)
-- ---------------------------------------------------------------------
alter table results add column if not exists passed_subjects int not null default 0;
alter table results add column if not exists failed_subjects int not null default 0;
alter table results add column if not exists remarks text;
alter table results add column if not exists updated_at timestamptz not null default now();

drop trigger if exists trg_set_updated_at on results;
create trigger trg_set_updated_at before update on results
  for each row execute function set_updated_at();

-- ---------------------------------------------------------------------
-- MARK_REVISIONS: audit trail for any change to an already-published
-- mark (reason / old value / new value / user / timestamp).
-- ---------------------------------------------------------------------
create table mark_revisions (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references schools(id) on delete cascade,
  mark_id uuid not null references marks(id) on delete cascade,
  old_obtained_marks numeric not null,
  new_obtained_marks numeric not null,
  reason text not null,
  changed_by uuid references profiles(id),
  created_at timestamptz not null default now()
);
create index idx_mark_revisions_mark on mark_revisions(mark_id);
create index idx_mark_revisions_school on mark_revisions(school_id, created_at desc);

-- DB-level safety net: changing obtained_marks on an already-published
-- mark row is rejected unless a reason has been set on the connection
-- for this transaction (the revise_published_mark() RPC below does this),
-- and the change is logged into mark_revisions automatically.
create or replace function guard_published_mark_update() returns trigger as $$
declare
  reason text;
begin
  if old.status = 'published' and new.obtained_marks is distinct from old.obtained_marks then
    reason := current_setting('app.revision_reason', true);
    if reason is null or length(trim(reason)) = 0 then
      raise exception 'A reason is required to change a published mark.';
    end if;
    insert into mark_revisions (school_id, mark_id, old_obtained_marks, new_obtained_marks, reason, changed_by)
    values (new.school_id, new.id, old.obtained_marks, new.obtained_marks, reason, auth.uid());
  end if;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists trg_guard_published_mark on marks;
create trigger trg_guard_published_mark before update on marks
  for each row execute function guard_published_mark_update();

-- RPC used by the app to make an authorized, reasoned change to a
-- published mark. Runs as the caller (security invoker), so normal RLS
-- update policies still apply — only admins can call this successfully
-- because the marks_write policy below only allows admins to update a
-- published row.
create or replace function revise_published_mark(p_mark_id uuid, p_new_marks numeric, p_reason text)
returns marks as $$
declare
  result marks;
begin
  perform set_config('app.revision_reason', p_reason, true);
  update marks set obtained_marks = p_new_marks where id = p_mark_id returning * into result;
  return result;
end;
$$ language plpgsql security invoker set search_path = public;

-- ---------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------
alter table mark_revisions enable row level security;
create policy mark_revisions_tenant_select on mark_revisions for select
  using (is_super_admin() or school_id = auth_school_id());
create policy mark_revisions_admin_insert on mark_revisions for insert
  with check (is_super_admin() or (is_school_admin_role() and school_id = auth_school_id()));

-- Exams / exam schedule / results: admin-managed, same pattern as Phase 3's
-- subjects/periods/timetable (replaces the generic staff_* write policies
-- from 0002 with admin-only ones).
do $$
declare tbl text;
declare admin_write_tables text[] := array['exams', 'exam_subjects', 'results'];
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

-- Marks: admins can write anything in their school; teachers can only
-- write marks for exam subjects that match one of their own active
-- subject assignments (class + section + subject).
drop policy if exists marks_staff_insert on marks;
drop policy if exists marks_staff_update on marks;
drop policy if exists marks_staff_delete on marks;

create policy marks_write_insert on marks for insert
  with check (
    is_super_admin()
    or (is_school_admin_role() and school_id = auth_school_id())
    or (
      auth_role() = 'teacher' and school_id = auth_school_id()
      and exists (
        select 1 from exam_subjects es
        join teacher_subjects ts on ts.subject_id = es.subject_id
          and ts.class_id = es.class_id
          and (ts.section_id = es.section_id or es.section_id is null)
        join teachers t on t.id = ts.teacher_id
        where es.id = marks.exam_subject_id and t.profile_id = auth.uid() and ts.status = 'active'
      )
    )
  );

create policy marks_write_update on marks for update
  using (
    is_super_admin()
    or (is_school_admin_role() and school_id = auth_school_id())
    or (
      auth_role() = 'teacher' and school_id = auth_school_id() and status in ('draft', 'submitted')
      and exists (
        select 1 from exam_subjects es
        join teacher_subjects ts on ts.subject_id = es.subject_id
          and ts.class_id = es.class_id
          and (ts.section_id = es.section_id or es.section_id is null)
        join teachers t on t.id = ts.teacher_id
        where es.id = marks.exam_subject_id and t.profile_id = auth.uid() and ts.status = 'active'
      )
    )
  );

create policy marks_write_delete on marks for delete
  using (is_super_admin() or (is_school_admin_role() and school_id = auth_school_id()));

-- Marks / results SELECT: staff see everything in their school; a
-- student/parent may only see rows belonging to them/their child, and
-- only once the owning exam has been published.
drop policy if exists marks_tenant_select on marks;
create policy marks_select on marks for select
  using (
    is_super_admin()
    or (is_school_staff() and school_id = auth_school_id())
    or (
      auth_role() in ('student', 'parent')
      and exists (
        select 1 from exam_subjects es join exams e on e.id = es.exam_id
        where es.id = marks.exam_subject_id and e.status = 'published'
      )
      and student_id in (
        select id from students where profile_id = auth.uid()
        union
        select sp.student_id from student_parents sp
        join parents p on p.id = sp.parent_id
        where p.profile_id = auth.uid()
      )
    )
  );

drop policy if exists results_tenant_select on results;
create policy results_select on results for select
  using (
    is_super_admin()
    or (is_school_staff() and school_id = auth_school_id())
    or (
      auth_role() in ('student', 'parent')
      and exists (select 1 from exams e where e.id = results.exam_id and e.status = 'published')
      and student_id in (
        select id from students where profile_id = auth.uid()
        union
        select sp.student_id from student_parents sp
        join parents p on p.id = sp.parent_id
        where p.profile_id = auth.uid()
      )
    )
  );
