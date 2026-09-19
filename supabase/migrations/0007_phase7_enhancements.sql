-- =====================================================================
-- Phase 7 — Homework & Assignments, Notifications, Events, Notices
-- enhancement. Extends existing tables (homework, assignments, events,
-- notices, notifications) rather than duplicating them, and adds only
-- the genuinely new tables the spec calls out as possibly missing:
-- notification_preferences, event_responses, event_attendance,
-- notice_acknowledgements.
-- =====================================================================

create type homework_stage as enum ('draft', 'published', 'closed');
create type event_type as enum ('academic', 'sports', 'parent_meeting', 'holiday', 'training', 'competition', 'school_function', 'meeting', 'other');
create type event_status as enum ('scheduled', 'cancelled', 'completed');
create type event_response_kind as enum ('going', 'not_going', 'maybe', 'acknowledged');
create type attendance_mark as enum ('expected', 'present', 'absent');

-- ---------------------------------------------------------------------
-- Helper: a signed-in teacher's own teachers.id row. SECURITY DEFINER for
-- the same reason as my_student_ids()/my_parent_id() (0006) — used inside
-- other tables' policies without triggering recursive RLS evaluation.
-- ---------------------------------------------------------------------
create or replace function my_teacher_id() returns uuid as $$
  select id from teachers where profile_id = auth.uid()
$$ language sql stable security definer set search_path = public;

-- Whether the signed-in teacher currently has an active subject
-- assignment for this exact class/subject (and, if given, section) —
-- the gate for "teachers must not assign homework to classes/subjects
-- they are not assigned to".
create or replace function teacher_has_assignment(p_class_id uuid, p_section_id uuid, p_subject_id uuid) returns boolean as $$
  select exists (
    select 1 from teacher_subjects ts
    where ts.teacher_id = my_teacher_id()
      and ts.status = 'active'
      and ts.class_id = p_class_id
      and ts.subject_id = p_subject_id
      and (ts.section_id is null or ts.section_id = p_section_id)
  )
$$ language sql stable security definer set search_path = public;

-- ---------------------------------------------------------------------
-- HOMEWORK: lifecycle, richer authoring fields, targeting metadata.
-- ---------------------------------------------------------------------
alter table homework add column if not exists stage homework_stage not null default 'published';
alter table homework add column if not exists instructions text;
alter table homework add column if not exists assigned_date date not null default current_date;
alter table homework add column if not exists max_marks numeric;
alter table homework add column if not exists allow_late boolean not null default false;
alter table homework add column if not exists created_by uuid references profiles(id);
alter table homework add column if not exists updated_at timestamptz not null default now();

drop trigger if exists trg_set_updated_at on homework;
create trigger trg_set_updated_at before update on homework
  for each row execute function set_updated_at();

-- Homework SELECT: staff see everything in their school; a student/parent
-- sees only published homework for their own/child's class (and, if the
-- row targets a specific section, only that section) — drafts stay
-- visible only to the authoring teacher and admins.
drop policy if exists homework_tenant_select on homework;
create policy homework_select on homework for select
  using (
    is_super_admin()
    or (is_school_staff() and school_id = auth_school_id())
    or (
      stage = 'published'
      and auth_role() in ('student', 'parent')
      and class_id in (select class_id from students where id in (select my_student_ids()))
      and (section_id is null or section_id in (select section_id from students where id in (select my_student_ids())))
    )
  );

-- Homework writes: admins may manage anything in their school; a teacher
-- may only create/edit homework for a class+subject(+section) they are
-- actively assigned to, and may only edit/close/delete their own rows.
drop policy if exists homework_staff_insert on homework;
drop policy if exists homework_staff_update on homework;
drop policy if exists homework_staff_delete on homework;

create policy homework_insert on homework for insert
  with check (
    is_super_admin()
    or (is_school_admin_role() and school_id = auth_school_id())
    or (
      auth_role() = 'teacher' and school_id = auth_school_id()
      and teacher_id = my_teacher_id()
      and teacher_has_assignment(class_id, section_id, subject_id)
    )
  );

create policy homework_update on homework for update
  using (
    is_super_admin()
    or (is_school_admin_role() and school_id = auth_school_id())
    or (auth_role() = 'teacher' and teacher_id = my_teacher_id())
  );

create policy homework_delete on homework for delete
  using (
    is_super_admin()
    or (is_school_admin_role() and school_id = auth_school_id())
    or (auth_role() = 'teacher' and teacher_id = my_teacher_id())
  );

-- ---------------------------------------------------------------------
-- ASSIGNMENTS (homework submissions): add marks/feedback/comment. A
-- student may still only ever touch their own submission mechanics
-- (status/submission_url/submitted_at/comment) — marks, feedback, and
-- who checked it stay teacher/admin-controlled, enforced by trigger
-- below (RLS alone can't express "these specific columns only").
-- ---------------------------------------------------------------------
alter table assignments add column if not exists comment text;
alter table assignments add column if not exists marks numeric;
alter table assignments add column if not exists checked_by uuid references profiles(id);
alter table assignments add column if not exists updated_at timestamptz not null default now();

drop trigger if exists trg_set_updated_at on assignments;
create trigger trg_set_updated_at before update on assignments
  for each row execute function set_updated_at();

create or replace function guard_assignment_student_update() returns trigger as $$
begin
  if auth_role() = 'student' then
    if new.marks is distinct from old.marks
      or new.remarks is distinct from old.remarks
      or new.checked_by is distinct from old.checked_by
      or new.homework_id is distinct from old.homework_id
      or new.student_id is distinct from old.student_id
    then
      raise exception 'Only a teacher can enter marks or feedback on a submission.';
    end if;
  end if;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists trg_guard_assignment_student_update on assignments;
create trigger trg_guard_assignment_student_update before update on assignments
  for each row execute function guard_assignment_student_update();

-- ---------------------------------------------------------------------
-- EVENTS: type, timing, organizer, attachment, targeting, lifecycle,
-- and opt-in RSVP/acknowledgement/attendance-tracking flags.
-- ---------------------------------------------------------------------
alter table events add column if not exists event_type event_type not null default 'other';
alter table events add column if not exists start_time time;
alter table events add column if not exists end_time time;
alter table events add column if not exists organizer text;
alter table events add column if not exists attachment_url text;
alter table events add column if not exists audience notice_audience not null default 'all';
alter table events add column if not exists class_id uuid references classes(id) on delete cascade;
alter table events add column if not exists section_id uuid references sections(id) on delete cascade;
alter table events add column if not exists status event_status not null default 'scheduled';
alter table events add column if not exists response_mode text not null default 'none' check (response_mode in ('none', 'rsvp', 'acknowledge'));
alter table events add column if not exists track_attendance boolean not null default false;
alter table events add column if not exists updated_at timestamptz not null default now();

drop trigger if exists trg_set_updated_at on events;
create trigger trg_set_updated_at before update on events
  for each row execute function set_updated_at();

-- Events SELECT: staff see everything; a student/parent sees only events
-- targeted at "all", their own role, or their own/child's class/section.
drop policy if exists events_tenant_select on events;
create policy events_select on events for select
  using (
    is_super_admin()
    or (is_school_staff() and school_id = auth_school_id())
    or (
      auth_role() in ('student', 'parent')
      and (
        audience = 'all'
        or (audience = 'students' and auth_role() = 'student')
        or (audience = 'parents' and auth_role() = 'parent')
        or (audience = 'class' and class_id in (select class_id from students where id in (select my_student_ids()))
            and (section_id is null or section_id in (select section_id from students where id in (select my_student_ids()))))
      )
    )
  );

-- Event writes stay admin-only (matches the existing staff_insert/update/
-- delete policies from 0002 — no change needed there).

-- ---------------------------------------------------------------------
-- EVENT_RESPONSES: RSVP (going/not_going/maybe) or a plain acknowledge,
-- one row per (event, person). Never writable on someone else's behalf.
-- ---------------------------------------------------------------------
create table event_responses (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references schools(id) on delete cascade,
  event_id uuid not null references events(id) on delete cascade,
  profile_id uuid not null references profiles(id) on delete cascade,
  response event_response_kind not null,
  responded_at timestamptz not null default now(),
  unique (event_id, profile_id)
);
create index idx_event_responses_event on event_responses(event_id);

alter table event_responses enable row level security;
create policy event_responses_select on event_responses for select
  using (is_super_admin() or (is_school_staff() and school_id = auth_school_id()) or profile_id = auth.uid());
create policy event_responses_insert on event_responses for insert
  with check (profile_id = auth.uid() and school_id = auth_school_id());
create policy event_responses_update on event_responses for update
  using (profile_id = auth.uid())
  with check (profile_id = auth.uid());

-- ---------------------------------------------------------------------
-- EVENT_ATTENDANCE: staff-recorded presence at an event — never exposed
-- to ordinary students/parents (per spec: "Do not expose attendance
-- management to ordinary students/parents").
-- ---------------------------------------------------------------------
create table event_attendance (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references schools(id) on delete cascade,
  event_id uuid not null references events(id) on delete cascade,
  profile_id uuid not null references profiles(id) on delete cascade,
  status attendance_mark not null default 'expected',
  recorded_by uuid references profiles(id),
  recorded_at timestamptz not null default now(),
  unique (event_id, profile_id)
);
create index idx_event_attendance_event on event_attendance(event_id);

alter table event_attendance enable row level security;
create policy event_attendance_staff_select on event_attendance for select
  using (is_super_admin() or (is_school_staff() and school_id = auth_school_id()));
create policy event_attendance_staff_insert on event_attendance for insert
  with check (is_super_admin() or (is_school_staff() and school_id = auth_school_id()));
create policy event_attendance_staff_update on event_attendance for update
  using (is_super_admin() or (is_school_staff() and school_id = auth_school_id()));

-- ---------------------------------------------------------------------
-- NOTICES: priority values, acknowledgement flag.
-- ---------------------------------------------------------------------
alter table notices add column if not exists requires_acknowledgement boolean not null default false;
alter table notices drop constraint if exists notices_priority_check;
alter table notices add constraint notices_priority_check check (priority in ('normal', 'important', 'urgent'));

-- Notices SELECT: staff see everything; a student/parent sees only
-- notices addressed to "all", their own role, or their own/child's class.
drop policy if exists notices_tenant_select on notices;
create policy notices_select on notices for select
  using (
    is_super_admin()
    or (is_school_staff() and school_id = auth_school_id())
    or (
      auth_role() in ('student', 'parent')
      and (
        audience = 'all'
        or (audience = 'students' and auth_role() = 'student')
        or (audience = 'parents' and auth_role() = 'parent')
        or (audience = 'class' and class_id in (select class_id from students where id in (select my_student_ids())))
      )
      and (expiry_date is null or expiry_date >= current_date)
    )
  );

create table notice_acknowledgements (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references schools(id) on delete cascade,
  notice_id uuid not null references notices(id) on delete cascade,
  profile_id uuid not null references profiles(id) on delete cascade,
  acknowledged_at timestamptz not null default now(),
  unique (notice_id, profile_id)
);
create index idx_notice_ack_notice on notice_acknowledgements(notice_id);

alter table notice_acknowledgements enable row level security;
create policy notice_ack_select on notice_acknowledgements for select
  using (is_super_admin() or (is_school_staff() and school_id = auth_school_id()) or profile_id = auth.uid());
create policy notice_ack_insert on notice_acknowledgements for insert
  with check (profile_id = auth.uid() and school_id = auth_school_id());

-- ---------------------------------------------------------------------
-- NOTIFICATION_PREFERENCES: one row per user, own-row only. Non-critical
-- categories a user can mute; nothing here can suppress a table's own
-- security — it only gates whether the app's notification helper bothers
-- to create the row in the first place.
-- ---------------------------------------------------------------------
create table notification_preferences (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references schools(id) on delete cascade,
  profile_id uuid not null unique references profiles(id) on delete cascade,
  homework boolean not null default true,
  events boolean not null default true,
  notices boolean not null default true,
  fee_reminders boolean not null default true,
  exam_notifications boolean not null default true,
  result_notifications boolean not null default true,
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_set_updated_at on notification_preferences;
create trigger trg_set_updated_at before update on notification_preferences
  for each row execute function set_updated_at();

alter table notification_preferences enable row level security;
create policy notification_preferences_select on notification_preferences for select
  using (profile_id = auth.uid());
create policy notification_preferences_insert on notification_preferences for insert
  with check (profile_id = auth.uid() and school_id = auth_school_id());
create policy notification_preferences_update on notification_preferences for update
  using (profile_id = auth.uid())
  with check (profile_id = auth.uid());
