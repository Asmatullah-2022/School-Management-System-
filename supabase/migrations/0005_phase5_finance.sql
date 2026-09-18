-- =====================================================================
-- Phase 5 — Fees + Finance.
-- Extends the existing fee_structures / fees / payments tables (created
-- in Phase 1) rather than duplicating them. "fees" rows are the
-- per-student fee CHARGES (ledger lines); new tables add periods,
-- payment allocation (one payment can settle several charges),
-- discounts, scholarships, refunds, and per-school financial settings
-- (receipt numbering). Money movement is an append-only ledger:
-- payments / payment_allocations / refunds are insert+select only —
-- nothing about a historical payment can be edited, only reversed via a
-- refund row. fees.paid_amount / fees.balance / fees.status are never
-- written directly by app code; only the recompute trigger (running as
-- the function owner) may set them, guarded below.
-- =====================================================================

create type discount_kind as enum ('fixed', 'percentage');
create type discount_scope as enum ('school', 'class', 'section', 'student');
create type scholarship_status as enum ('pending', 'approved', 'rejected');
create type refund_status as enum ('completed');

-- ---------------------------------------------------------------------
-- Helper: finance-privileged roles (School Admin, Accountant, Super Admin).
-- Teachers/parents/students never get this — matches the spec's explicit
-- "Accountant should not receive unrelated admin access, teacher must
-- not have finance access unless permitted" requirement.
-- ---------------------------------------------------------------------
create or replace function is_finance_staff() returns boolean as $$
  select auth_role() in ('super_admin', 'school_admin', 'accountant')
$$ language sql stable security definer set search_path = public;

-- ---------------------------------------------------------------------
-- FEE_STRUCTURES: add type + active flag (frequency/name/amount already exist)
-- ---------------------------------------------------------------------
alter table fee_structures add column if not exists fee_type text not null default 'tuition';
alter table fee_structures add column if not exists is_active boolean not null default true;
alter table fee_structures add column if not exists updated_at timestamptz not null default now();
alter table fee_structures add column if not exists created_by uuid references profiles(id);
alter table fee_structures add constraint fee_structures_frequency_check
  check (frequency in ('monthly', 'one_time', 'quarterly', 'annual'));

drop trigger if exists trg_set_updated_at on fee_structures;
create trigger trg_set_updated_at before update on fee_structures
  for each row execute function set_updated_at();

-- ---------------------------------------------------------------------
-- FEE_PERIODS: the billing period a recurring charge belongs to (e.g.
-- "September 2025"), used to prevent double-generation of the same
-- month's fee for the same student.
-- ---------------------------------------------------------------------
create table fee_periods (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references schools(id) on delete cascade,
  academic_session_id uuid references academic_sessions(id) on delete set null,
  name text not null, -- "September 2025"
  month int not null check (month between 1 and 12),
  year int not null,
  start_date date not null,
  end_date date not null,
  created_at timestamptz not null default now(),
  unique (school_id, month, year)
);
create index idx_fee_periods_school on fee_periods(school_id);

-- ---------------------------------------------------------------------
-- FEES (student fee charges / ledger lines): add period link, computed
-- paid_amount/balance, and duplicate-generation guards.
-- ---------------------------------------------------------------------
alter table fees add column if not exists fee_period_id uuid references fee_periods(id) on delete set null;
alter table fees add column if not exists paid_amount numeric not null default 0;
alter table fees add column if not exists balance numeric generated always as (amount - discount - paid_amount) stored;
alter table fees add column if not exists notes text;
alter table fees add column if not exists updated_at timestamptz not null default now();
alter table fees add column if not exists created_by uuid references profiles(id);
alter table fees add constraint fees_amount_check check (amount >= 0);
alter table fees add constraint fees_discount_check check (discount >= 0 and discount <= amount);
alter table fees add constraint fees_paid_amount_check check (paid_amount >= 0);

drop trigger if exists trg_set_updated_at on fees;
create trigger trg_set_updated_at before update on fees
  for each row execute function set_updated_at();

-- Prevent generating the same recurring charge twice for a student/period,
-- and the same one-time charge twice for a student.
drop index if exists uq_fees_recurring_charge;
create unique index uq_fees_recurring_charge on fees (student_id, fee_structure_id, fee_period_id)
  where fee_period_id is not null;
drop index if exists uq_fees_onetime_charge;
create unique index uq_fees_onetime_charge on fees (student_id, fee_structure_id)
  where fee_period_id is null and fee_structure_id is not null;

create index if not exists idx_fees_period on fees(fee_period_id);

-- fees.status is derived automatically from balance/due_date — never set
-- by hand — so "unpaid"/"partial"/"paid"/"overdue" always reflects reality.
create or replace function recompute_fee_status() returns trigger as $$
begin
  if new.balance <= 0 then
    new.status := 'paid';
  elsif new.paid_amount > 0 then
    new.status := 'partial';
  elsif new.due_date < current_date then
    new.status := 'overdue';
  else
    new.status := 'unpaid';
  end if;
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_recompute_fee_status on fees;
create trigger trg_recompute_fee_status before insert or update on fees
  for each row execute function recompute_fee_status();

-- Guard: paid_amount may only be changed by the internal recompute
-- function below (which sets app.internal_recalc for the duration of its
-- update) — never by an ordinary UPDATE from the app or an admin.
create or replace function guard_fee_paid_amount() returns trigger as $$
begin
  if new.paid_amount is distinct from old.paid_amount
     and coalesce(current_setting('app.internal_recalc', true), '') <> 'on' then
    raise exception 'fees.paid_amount is computed automatically from payments and cannot be edited directly.';
  end if;
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_guard_fee_paid_amount on fees;
create trigger trg_guard_fee_paid_amount before update on fees
  for each row execute function guard_fee_paid_amount();

-- Recomputes a fee's paid_amount from its allocations minus any refunds,
-- bypassing the guard above via app.internal_recalc. Security definer so
-- it can write even though the caller (accountant) has no direct grant
-- to touch paid_amount.
create or replace function recompute_fee_paid_amount(p_fee_id uuid) returns void as $$
declare
  v_allocated numeric;
  v_refunded numeric;
begin
  select coalesce(sum(pa.amount), 0) into v_allocated
    from payment_allocations pa where pa.fee_id = p_fee_id;
  select coalesce(sum(r.amount), 0) into v_refunded
    from refunds r where r.fee_id = p_fee_id and r.status = 'completed';

  perform set_config('app.internal_recalc', 'on', true);
  update fees set paid_amount = greatest(v_allocated - v_refunded, 0) where id = p_fee_id;
  perform set_config('app.internal_recalc', 'off', true);
end;
$$ language plpgsql security definer set search_path = public;

-- ---------------------------------------------------------------------
-- DISCOUNTS: reusable discount definitions (fixed/percentage), scoped to
-- the whole school, a class, a section, or one student.
-- ---------------------------------------------------------------------
create table discounts (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references schools(id) on delete cascade,
  name text not null,
  kind discount_kind not null,
  value numeric not null check (value > 0),
  scope discount_scope not null default 'school',
  class_id uuid references classes(id) on delete cascade,
  section_id uuid references sections(id) on delete cascade,
  student_id uuid references students(id) on delete cascade,
  academic_session_id uuid references academic_sessions(id) on delete set null,
  is_active boolean not null default true,
  created_by uuid references profiles(id),
  created_at timestamptz not null default now(),
  check (
    (scope = 'school' and class_id is null and section_id is null and student_id is null) or
    (scope = 'class' and class_id is not null) or
    (scope = 'section' and section_id is not null) or
    (scope = 'student' and student_id is not null)
  )
);
create index idx_discounts_school on discounts(school_id);

-- ---------------------------------------------------------------------
-- SCHOLARSHIPS / CONCESSIONS: per-student, with approval tracking.
-- ---------------------------------------------------------------------
create table scholarships (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references schools(id) on delete cascade,
  student_id uuid not null references students(id) on delete cascade,
  name text not null,
  kind discount_kind not null,
  value numeric not null check (value > 0),
  status scholarship_status not null default 'pending',
  academic_session_id uuid references academic_sessions(id) on delete set null,
  notes text,
  created_by uuid references profiles(id),
  approved_by uuid references profiles(id),
  approved_at timestamptz,
  created_at timestamptz not null default now()
);
create index idx_scholarships_school on scholarships(school_id);
create index idx_scholarships_student on scholarships(student_id);

-- ---------------------------------------------------------------------
-- FEE_DISCOUNTS: audit of which discount/scholarship was applied to
-- which charge, and for how much (snapshot at generation time).
-- ---------------------------------------------------------------------
create table fee_discounts (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references schools(id) on delete cascade,
  fee_id uuid not null references fees(id) on delete cascade,
  discount_id uuid references discounts(id) on delete set null,
  scholarship_id uuid references scholarships(id) on delete set null,
  applied_amount numeric not null check (applied_amount > 0),
  created_at timestamptz not null default now(),
  check (discount_id is not null or scholarship_id is not null)
);
create index idx_fee_discounts_fee on fee_discounts(fee_id);

-- ---------------------------------------------------------------------
-- FINANCIAL_SETTINGS: one row per school — receipt numbering sequence.
-- ---------------------------------------------------------------------
create table financial_settings (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null unique references schools(id) on delete cascade,
  receipt_prefix text not null default 'REC',
  last_receipt_number int not null default 0,
  currency text not null default 'PKR',
  late_fee_percentage numeric not null default 0,
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_set_updated_at on financial_settings;
create trigger trg_set_updated_at before update on financial_settings
  for each row execute function set_updated_at();

-- Atomically reserves and returns the next receipt number for a school,
-- e.g. REC-2026-000001. Row-locks the settings row so concurrent
-- payments can never collide on the same number.
create or replace function next_receipt_number(p_school_id uuid) returns text as $$
declare
  v_prefix text;
  v_next int;
begin
  insert into financial_settings (school_id) values (p_school_id)
    on conflict (school_id) do nothing;

  update financial_settings
    set last_receipt_number = last_receipt_number + 1
    where school_id = p_school_id
    returning receipt_prefix, last_receipt_number into v_prefix, v_next;

  return v_prefix || '-' || extract(year from current_date)::text || '-' || lpad(v_next::text, 6, '0');
end;
$$ language plpgsql security definer set search_path = public;

-- ---------------------------------------------------------------------
-- PAYMENTS: append-only ledger. Add receipt number + status + notes.
-- No UPDATE/DELETE policy is ever granted (see RLS below) — a payment
-- can only be reversed by inserting a refund row.
-- ---------------------------------------------------------------------
alter table payments add column if not exists receipt_number text;
alter table payments add column if not exists status text not null default 'completed';
alter table payments add column if not exists notes text;
alter table payments add constraint payments_amount_check check (amount_paid > 0);
alter table payments add constraint payments_status_check check (status in ('completed'));
create unique index if not exists uq_payments_receipt on payments(school_id, receipt_number);

-- ---------------------------------------------------------------------
-- PAYMENT_ALLOCATIONS: splits one payment across one or more fee charges.
-- Append-only (insert+select only).
-- ---------------------------------------------------------------------
create table payment_allocations (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references schools(id) on delete cascade,
  payment_id uuid not null references payments(id) on delete cascade,
  fee_id uuid not null references fees(id) on delete restrict,
  amount numeric not null check (amount > 0),
  created_at timestamptz not null default now()
);
create index idx_payment_allocations_payment on payment_allocations(payment_id);
create index idx_payment_allocations_fee on payment_allocations(fee_id);

-- A payment's allocations may never exceed the amount actually paid.
create or replace function guard_allocation_sum() returns trigger as $$
declare
  v_paid numeric;
  v_allocated numeric;
begin
  select amount_paid into v_paid from payments where id = new.payment_id;
  select coalesce(sum(amount), 0) into v_allocated from payment_allocations where payment_id = new.payment_id;
  if v_allocated > v_paid then
    raise exception 'Allocated amount (%) exceeds the amount paid (%) for this payment.', v_allocated, v_paid;
  end if;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists trg_guard_allocation_sum on payment_allocations;
create constraint trigger trg_guard_allocation_sum after insert on payment_allocations
  deferrable initially deferred
  for each row execute function guard_allocation_sum();

-- Keep the target fee's paid_amount/balance/status in sync whenever an
-- allocation is recorded.
create or replace function trg_recompute_fee_on_allocation() returns trigger as $$
begin
  perform recompute_fee_paid_amount(coalesce(new.fee_id, old.fee_id));
  return coalesce(new, old);
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists trg_recompute_fee_on_allocation on payment_allocations;
create trigger trg_recompute_fee_on_allocation after insert or update or delete on payment_allocations
  for each row execute function trg_recompute_fee_on_allocation();

-- ---------------------------------------------------------------------
-- REFUNDS: controlled, capped, audit-logged reversal of a payment,
-- against one specific fee allocation. Append-only.
-- ---------------------------------------------------------------------
create table refunds (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references schools(id) on delete cascade,
  payment_id uuid not null references payments(id) on delete restrict,
  fee_id uuid not null references fees(id) on delete restrict,
  student_id uuid not null references students(id) on delete cascade,
  amount numeric not null check (amount > 0),
  reason text not null,
  status refund_status not null default 'completed',
  refunded_by uuid references profiles(id),
  created_at timestamptz not null default now()
);
create index idx_refunds_payment on refunds(payment_id);
create index idx_refunds_school on refunds(school_id, created_at desc);

-- Cap: a refund against a given (payment, fee) allocation can never
-- exceed what was actually allocated there, minus refunds already made.
create or replace function guard_refund_cap() returns trigger as $$
declare
  v_allocated numeric;
  v_already_refunded numeric;
begin
  select coalesce(sum(amount), 0) into v_allocated
    from payment_allocations where payment_id = new.payment_id and fee_id = new.fee_id;
  select coalesce(sum(amount), 0) into v_already_refunded
    from refunds where payment_id = new.payment_id and fee_id = new.fee_id and status = 'completed';

  if v_allocated = 0 then
    raise exception 'This payment has no allocation against the selected fee.';
  end if;
  if new.amount > (v_allocated - v_already_refunded) then
    raise exception 'Refund amount (%) exceeds the eligible paid amount (%) for this charge.', new.amount, v_allocated - v_already_refunded;
  end if;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists trg_guard_refund_cap on refunds;
create trigger trg_guard_refund_cap before insert on refunds
  for each row execute function guard_refund_cap();

create or replace function trg_recompute_fee_on_refund() returns trigger as $$
begin
  perform recompute_fee_paid_amount(new.fee_id);
  insert into audit_logs (school_id, profile_id, action, target_table, target_id, metadata)
    values (new.school_id, new.refunded_by, 'refund', 'payments', new.payment_id,
      jsonb_build_object('fee_id', new.fee_id, 'amount', new.amount, 'reason', new.reason));
  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists trg_recompute_fee_on_refund on refunds;
create trigger trg_recompute_fee_on_refund after insert on refunds
  for each row execute function trg_recompute_fee_on_refund();

-- ---------------------------------------------------------------------
-- record_payment: the only sanctioned way to create a payment. Computes
-- amount_paid from the allocation list, reserves a receipt number, and
-- inserts the payment + its allocations in one transaction. Runs as the
-- caller (security invoker) so normal RLS still governs who may call it
-- successfully.
-- ---------------------------------------------------------------------
create or replace function record_payment(
  p_school_id uuid,
  p_student_id uuid,
  p_method text,
  p_allocations jsonb, -- [{"fee_id": "...", "amount": 123.45}, ...]
  p_notes text default null
) returns payments as $$
declare
  v_payment payments;
  v_total numeric;
  v_receipt text;
  v_item jsonb;
begin
  select coalesce(sum((item->>'amount')::numeric), 0) into v_total
    from jsonb_array_elements(p_allocations) item;

  if v_total <= 0 then
    raise exception 'Payment must allocate a positive amount to at least one fee.';
  end if;

  v_receipt := next_receipt_number(p_school_id);

  insert into payments (school_id, student_id, fee_id, amount_paid, payment_method, receipt_number, received_by, notes)
  values (
    p_school_id, p_student_id,
    (p_allocations->0->>'fee_id')::uuid, -- first fee kept for the legacy fee_id column
    v_total, p_method, v_receipt, auth.uid(), p_notes
  ) returning * into v_payment;

  for v_item in select * from jsonb_array_elements(p_allocations) loop
    insert into payment_allocations (school_id, payment_id, fee_id, amount)
    values (p_school_id, v_payment.id, (v_item->>'fee_id')::uuid, (v_item->>'amount')::numeric);
  end loop;

  return v_payment;
end;
$$ language plpgsql security invoker set search_path = public;

-- record_refund: the only sanctioned way to create a refund.
create or replace function record_refund(
  p_school_id uuid, p_payment_id uuid, p_fee_id uuid, p_student_id uuid, p_amount numeric, p_reason text
) returns refunds as $$
declare
  v_refund refunds;
begin
  if trim(coalesce(p_reason, '')) = '' then
    raise exception 'A reason is required to issue a refund.';
  end if;
  insert into refunds (school_id, payment_id, fee_id, student_id, amount, reason, refunded_by)
  values (p_school_id, p_payment_id, p_fee_id, p_student_id, p_amount, p_reason, auth.uid())
  returning * into v_refund;
  return v_refund;
end;
$$ language plpgsql security invoker set search_path = public;

-- ---------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------

-- fee_structures / fee_periods / discounts / scholarships / financial_settings:
-- finance-staff only (accountant/school_admin/super_admin) — teachers,
-- parents, and students never see these definition tables directly.
do $$
declare tbl text;
declare finance_tables text[] := array['fee_structures', 'fee_periods', 'discounts', 'financial_settings'];
begin
  foreach tbl in array finance_tables loop
    execute format('drop policy if exists %I on %I;', tbl || '_tenant_select', tbl);
    execute format('drop policy if exists %I on %I;', tbl || '_staff_insert', tbl);
    execute format('drop policy if exists %I on %I;', tbl || '_staff_update', tbl);
    execute format('drop policy if exists %I on %I;', tbl || '_staff_delete', tbl);

    execute format('create policy %I on %I for select using (is_super_admin() or (is_finance_staff() and school_id = auth_school_id()));', tbl || '_finance_select', tbl);
    execute format('create policy %I on %I for insert with check (is_super_admin() or (is_finance_staff() and school_id = auth_school_id()));', tbl || '_finance_insert', tbl);
    execute format('create policy %I on %I for update using (is_super_admin() or (is_finance_staff() and school_id = auth_school_id()));', tbl || '_finance_update', tbl);
    execute format('create policy %I on %I for delete using (is_super_admin() or (is_finance_staff() and school_id = auth_school_id()));', tbl || '_finance_delete', tbl);
  end loop;
end $$;

alter table scholarships enable row level security;
create policy scholarships_select on scholarships for select
  using (
    is_super_admin() or (is_finance_staff() and school_id = auth_school_id())
    or (auth_role() in ('student', 'parent') and student_id in (
      select id from students where profile_id = auth.uid()
      union
      select sp.student_id from student_parents sp join parents p on p.id = sp.parent_id where p.profile_id = auth.uid()
    ))
  );
create policy scholarships_insert on scholarships for insert
  with check (is_super_admin() or (is_finance_staff() and school_id = auth_school_id()));
-- Approving/rejecting a scholarship is an admin decision, not a routine
-- accountant action — matches the spec's "approval tracking" requirement.
create policy scholarships_admin_update on scholarships for update
  using (is_super_admin() or (is_school_admin_role() and school_id = auth_school_id()));

alter table fee_discounts enable row level security;
create policy fee_discounts_select on fee_discounts for select
  using (is_super_admin() or (is_finance_staff() and school_id = auth_school_id()));
create policy fee_discounts_insert on fee_discounts for insert
  with check (is_super_admin() or (is_finance_staff() and school_id = auth_school_id()));

-- fees (charges): finance staff full tenant access; teachers get NONE
-- (replaces the generic staff_* policies which used to include teachers);
-- a student/parent may see only their own/child's charges.
drop policy if exists fees_tenant_select on fees;
drop policy if exists fees_staff_insert on fees;
drop policy if exists fees_staff_update on fees;
drop policy if exists fees_staff_delete on fees;

create policy fees_select on fees for select
  using (
    is_super_admin() or (is_finance_staff() and school_id = auth_school_id())
    or (auth_role() in ('student', 'parent') and student_id in (
      select id from students where profile_id = auth.uid()
      union
      select sp.student_id from student_parents sp join parents p on p.id = sp.parent_id where p.profile_id = auth.uid()
    ))
  );
create policy fees_insert on fees for insert
  with check (is_super_admin() or (is_finance_staff() and school_id = auth_school_id()));
create policy fees_update on fees for update
  using (is_super_admin() or (is_finance_staff() and school_id = auth_school_id()));
create policy fees_delete on fees for delete
  using (is_super_admin() or (is_finance_staff() and school_id = auth_school_id()));

-- payments / payment_allocations / refunds: append-only ledger.
-- INSERT is allowed for finance staff (used by the record_payment /
-- record_refund RPCs); there is deliberately NO update or delete policy
-- on any of the three tables, so no role — including School Admin — can
-- ever edit or delete a historical financial transaction. The only way
-- to reverse money is to insert a refund row.
drop policy if exists payments_tenant_select on payments;
drop policy if exists payments_staff_insert on payments;
drop policy if exists payments_staff_update on payments;
drop policy if exists payments_staff_delete on payments;

create policy payments_select on payments for select
  using (
    is_super_admin() or (is_finance_staff() and school_id = auth_school_id())
    or (auth_role() in ('student', 'parent') and student_id in (
      select id from students where profile_id = auth.uid()
      union
      select sp.student_id from student_parents sp join parents p on p.id = sp.parent_id where p.profile_id = auth.uid()
    ))
  );
create policy payments_insert on payments for insert
  with check (is_super_admin() or (is_finance_staff() and school_id = auth_school_id()));

alter table payment_allocations enable row level security;
create policy payment_allocations_select on payment_allocations for select
  using (is_super_admin() or (is_finance_staff() and school_id = auth_school_id()));
create policy payment_allocations_insert on payment_allocations for insert
  with check (is_super_admin() or (is_finance_staff() and school_id = auth_school_id()));

alter table refunds enable row level security;
create policy refunds_select on refunds for select
  using (
    is_super_admin() or (is_finance_staff() and school_id = auth_school_id())
    or (auth_role() in ('student', 'parent') and student_id in (
      select id from students where profile_id = auth.uid()
      union
      select sp.student_id from student_parents sp join parents p on p.id = sp.parent_id where p.profile_id = auth.uid()
    ))
  );
create policy refunds_insert on refunds for insert
  with check (is_super_admin() or (is_finance_staff() and school_id = auth_school_id()));
