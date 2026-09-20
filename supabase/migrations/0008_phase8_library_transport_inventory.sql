-- =====================================================================
-- PHASE 8 — Library, Transport, and Inventory/Asset management.
--
-- The Phase 1 schema already reserved `books`, `book_issues`, `vehicles`,
-- `routes`, `route_students`, and `inventory` tables (with a generic,
-- tenant-wide RLS policy applied to them by the loop in 0002_rls.sql) —
-- this migration extends those tables with the real columns each module
-- needs rather than creating parallel ones, and replaces their overly
-- permissive SELECT policies with properly scoped ones, mirroring the
-- pattern already used for attendance/students/homework/events in
-- 0006/0007.
-- =====================================================================

-- ---------------------------------------------------------------------
-- PART A — LIBRARY
-- ---------------------------------------------------------------------

create table library_categories (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references schools(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now(),
  unique (school_id, name)
);

create table library_settings (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null unique references schools(id) on delete cascade,
  fine_per_day numeric not null default 10,
  grace_period_days int not null default 0,
  max_fine numeric,
  default_loan_days int not null default 14,
  updated_at timestamptz not null default now()
);
create trigger trg_set_updated_at before update on library_settings
  for each row execute function set_updated_at();

alter table books add column if not exists accession_number text;
alter table books add column if not exists title_urdu text;
alter table books add column if not exists publisher text;
alter table books add column if not exists edition text;
alter table books add column if not exists category_id uuid references library_categories(id) on delete set null;
alter table books add column if not exists language text not null default 'English';
alter table books add column if not exists publication_year int;
alter table books add column if not exists shelf_location text;
alter table books add column if not exists price numeric;
alter table books add column if not exists condition text not null default 'good';
alter table books add column if not exists description text;
alter table books add column if not exists cover_image_url text;
alter table books add column if not exists status text not null default 'active';
alter table books add column if not exists created_by uuid references profiles(id);
alter table books add column if not exists updated_at timestamptz not null default now();
alter table books add constraint books_condition_check check (condition in ('new','good','fair','damaged'));
alter table books add constraint books_status_check check (status in ('active','archived'));
create unique index if not exists uq_books_accession on books(school_id, accession_number) where accession_number is not null;
create trigger trg_set_updated_at before update on books
  for each row execute function set_updated_at();

alter table book_issues add column if not exists issued_by uuid references profiles(id);
alter table book_issues add column if not exists returned_by uuid references profiles(id);
alter table book_issues add column if not exists condition_at_return text;
alter table book_issues add column if not exists remarks text;
alter table book_issues add column if not exists status text not null default 'issued';
alter table book_issues add column if not exists updated_at timestamptz not null default now();
alter table book_issues add constraint book_issues_status_check check (status in ('issued','returned'));
alter table book_issues add constraint book_issues_borrower_check check (student_id is not null or teacher_id is not null);
create trigger trg_set_updated_at before update on book_issues
  for each row execute function set_updated_at();

-- Available copies can never go negative or above total_copies.
create or replace function guard_book_availability() returns trigger as $$
begin
  if new.available_copies < 0 or new.available_copies > new.total_copies then
    raise exception 'Available copies (%) must be between 0 and total copies (%).', new.available_copies, new.total_copies;
  end if;
  return new;
end;
$$ language plpgsql;
create trigger trg_guard_book_availability before insert or update on books
  for each row execute function guard_book_availability();

-- books/library_categories/library_settings stay tenant-wide readable
-- (a catalog students/parents may browse per Part A §9); only staff may
-- write. book_issues is per-borrower data and must be scoped down.
alter table library_categories enable row level security;
create policy library_categories_select on library_categories for select
  using (is_super_admin() or school_id = auth_school_id());
create policy library_categories_admin_write on library_categories for insert
  with check (is_super_admin() or (is_school_admin_role() and school_id = auth_school_id()));
create policy library_categories_admin_update on library_categories for update
  using (is_super_admin() or (is_school_admin_role() and school_id = auth_school_id()));
create policy library_categories_admin_delete on library_categories for delete
  using (is_super_admin() or (is_school_admin_role() and school_id = auth_school_id()));

alter table library_settings enable row level security;
create policy library_settings_select on library_settings for select
  using (is_super_admin() or (is_school_staff() and school_id = auth_school_id()));
create policy library_settings_admin_write on library_settings for insert
  with check (is_super_admin() or (is_school_admin_role() and school_id = auth_school_id()));
create policy library_settings_admin_update on library_settings for update
  using (is_super_admin() or (is_school_admin_role() and school_id = auth_school_id()));

drop policy if exists books_staff_insert on books;
drop policy if exists books_staff_update on books;
drop policy if exists books_staff_delete on books;
create policy books_admin_write on books for insert
  with check (is_super_admin() or (is_school_admin_role() and school_id = auth_school_id()));
create policy books_admin_update on books for update
  using (is_super_admin() or (is_school_admin_role() and school_id = auth_school_id()));
create policy books_admin_delete on books for delete
  using (is_super_admin() or (is_school_admin_role() and school_id = auth_school_id()));

drop policy if exists book_issues_tenant_select on book_issues;
create policy book_issues_select on book_issues for select
  using (
    is_super_admin()
    or (is_school_staff() and school_id = auth_school_id())
    or student_id in (select my_student_ids())
    or teacher_id = my_teacher_id()
  );
-- book_issues_staff_insert/update/delete (from 0002) stay as-is: any
-- school staff member can issue/return/waive a fine, matching a small
-- school where "librarian" is just whichever staff member is on duty.

-- ---------------------------------------------------------------------
-- PART B — TRANSPORT
-- ---------------------------------------------------------------------

create table drivers (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references schools(id) on delete cascade,
  staff_id uuid references staff(id) on delete set null,
  full_name text not null,
  employee_id text,
  cnic text,
  mobile text,
  license_number text,
  license_expiry date,
  status text not null default 'active',
  created_by uuid references profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint drivers_status_check check (status in ('active','inactive'))
);
create index idx_drivers_school on drivers(school_id);
create trigger trg_set_updated_at before update on drivers
  for each row execute function set_updated_at();

alter table vehicles add column if not exists driver_id uuid references drivers(id) on delete set null;
alter table vehicles add column if not exists make_model text;
alter table vehicles add column if not exists status text not null default 'active';
alter table vehicles add column if not exists start_date date;
alter table vehicles add column if not exists insurance_expiry date;
alter table vehicles add column if not exists fitness_expiry date;
alter table vehicles add column if not exists notes text;
alter table vehicles add column if not exists created_by uuid references profiles(id);
alter table vehicles add column if not exists updated_at timestamptz not null default now();
alter table vehicles add constraint vehicles_status_check check (status in ('active','inactive','maintenance'));
create trigger trg_set_updated_at before update on vehicles
  for each row execute function set_updated_at();

alter table routes add column if not exists route_code text;
alter table routes add column if not exists starting_point text;
alter table routes add column if not exists destination text;
alter table routes add column if not exists distance_km numeric;
alter table routes add column if not exists estimated_minutes int;
alter table routes add column if not exists driver_id uuid references drivers(id) on delete set null;
alter table routes add column if not exists status text not null default 'active';
alter table routes add column if not exists fee_structure_id uuid references fee_structures(id) on delete set null;
alter table routes add column if not exists created_by uuid references profiles(id);
alter table routes add column if not exists updated_at timestamptz not null default now();
alter table routes add constraint routes_status_check check (status in ('active','inactive'));
create trigger trg_set_updated_at before update on routes
  for each row execute function set_updated_at();

create table route_stops (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references schools(id) on delete cascade,
  route_id uuid not null references routes(id) on delete cascade,
  stop_name text not null,
  stop_order int not null default 0,
  pickup_time time,
  dropoff_time time,
  location_description text,
  created_at timestamptz not null default now(),
  unique (route_id, stop_order)
);
create index idx_route_stops_route on route_stops(route_id);

alter table route_students add column if not exists stop_id uuid references route_stops(id) on delete set null;
alter table route_students add column if not exists start_date date not null default current_date;
alter table route_students add column if not exists end_date date;
alter table route_students add column if not exists status text not null default 'active';
alter table route_students add column if not exists created_by uuid references profiles(id);
alter table route_students add column if not exists updated_at timestamptz not null default now();
alter table route_students add constraint route_students_status_check check (status in ('active','ended'));
create trigger trg_set_updated_at before update on route_students
  for each row execute function set_updated_at();

-- A student may only ever have one *active* transport assignment at a
-- time; ended assignments are kept for history, so the old
-- (route_id, student_id) unique constraint (which would block
-- re-assigning a student to the same route later) is replaced.
alter table route_students drop constraint if exists route_students_route_id_student_id_key;
create unique index if not exists uq_route_students_active_student on route_students(student_id) where status = 'active';

-- A route can never have more active students assigned than its
-- vehicle's seating capacity.
create or replace function guard_route_capacity() returns trigger as $$
declare
  v_capacity int;
  v_current int;
begin
  if new.status <> 'active' then
    return new;
  end if;
  select capacity into v_capacity from vehicles where id = (select vehicle_id from routes where id = new.route_id);
  if v_capacity is null then
    return new;
  end if;
  select count(*) into v_current from route_students
    where route_id = new.route_id and status = 'active' and id <> coalesce(new.id, '00000000-0000-0000-0000-000000000000'::uuid);
  if v_current + 1 > v_capacity then
    raise exception 'This route''s vehicle is at full capacity (%).', v_capacity;
  end if;
  return new;
end;
$$ language plpgsql;
create trigger trg_guard_route_capacity before insert or update on route_students
  for each row execute function guard_route_capacity();

-- Reference data (drivers/vehicles/routes/stops) stays tenant-wide
-- readable (parents/students may browse route info); per-student
-- assignments are scoped to staff + the student/their guardian.
alter table drivers enable row level security;
create policy drivers_select on drivers for select
  using (is_super_admin() or school_id = auth_school_id());
create policy drivers_admin_write on drivers for insert
  with check (is_super_admin() or (is_school_admin_role() and school_id = auth_school_id()));
create policy drivers_admin_update on drivers for update
  using (is_super_admin() or (is_school_admin_role() and school_id = auth_school_id()));
create policy drivers_admin_delete on drivers for delete
  using (is_super_admin() or (is_school_admin_role() and school_id = auth_school_id()));

drop policy if exists vehicles_staff_insert on vehicles;
drop policy if exists vehicles_staff_update on vehicles;
drop policy if exists vehicles_staff_delete on vehicles;
create policy vehicles_admin_write on vehicles for insert
  with check (is_super_admin() or (is_school_admin_role() and school_id = auth_school_id()));
create policy vehicles_admin_update on vehicles for update
  using (is_super_admin() or (is_school_admin_role() and school_id = auth_school_id()));
create policy vehicles_admin_delete on vehicles for delete
  using (is_super_admin() or (is_school_admin_role() and school_id = auth_school_id()));

drop policy if exists routes_staff_insert on routes;
drop policy if exists routes_staff_update on routes;
drop policy if exists routes_staff_delete on routes;
create policy routes_admin_write on routes for insert
  with check (is_super_admin() or (is_school_admin_role() and school_id = auth_school_id()));
create policy routes_admin_update on routes for update
  using (is_super_admin() or (is_school_admin_role() and school_id = auth_school_id()));
create policy routes_admin_delete on routes for delete
  using (is_super_admin() or (is_school_admin_role() and school_id = auth_school_id()));

alter table route_stops enable row level security;
create policy route_stops_select on route_stops for select
  using (is_super_admin() or school_id = auth_school_id());
create policy route_stops_admin_write on route_stops for insert
  with check (is_super_admin() or (is_school_admin_role() and school_id = auth_school_id()));
create policy route_stops_admin_update on route_stops for update
  using (is_super_admin() or (is_school_admin_role() and school_id = auth_school_id()));
create policy route_stops_admin_delete on route_stops for delete
  using (is_super_admin() or (is_school_admin_role() and school_id = auth_school_id()));

drop policy if exists route_students_tenant_select on route_students;
create policy route_students_select on route_students for select
  using (
    is_super_admin()
    or (is_school_staff() and school_id = auth_school_id())
    or student_id in (select my_student_ids())
  );
drop policy if exists route_students_staff_insert on route_students;
drop policy if exists route_students_staff_update on route_students;
drop policy if exists route_students_staff_delete on route_students;
create policy route_students_admin_write on route_students for insert
  with check (is_super_admin() or (is_school_admin_role() and school_id = auth_school_id()));
create policy route_students_admin_update on route_students for update
  using (is_super_admin() or (is_school_admin_role() and school_id = auth_school_id()));
create policy route_students_admin_delete on route_students for delete
  using (is_super_admin() or (is_school_admin_role() and school_id = auth_school_id()));

-- ---------------------------------------------------------------------
-- PART C — INVENTORY / ASSETS. Students and parents get NO access at
-- all (unlike library/transport, there is no per-student inventory
-- record), so every policy below is staff-only — the pre-existing
-- tenant-wide SELECT from 0002 is dropped, not narrowed.
-- ---------------------------------------------------------------------

create table inventory_categories (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references schools(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now(),
  unique (school_id, name)
);

create table inventory_locations (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references schools(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now(),
  unique (school_id, name)
);

alter table inventory add column if not exists category_id uuid references inventory_categories(id) on delete set null;
alter table inventory add column if not exists description text;
alter table inventory add column if not exists available_quantity int not null default 0;
alter table inventory add column if not exists supplier text;
alter table inventory add column if not exists location_id uuid references inventory_locations(id) on delete set null;
alter table inventory add column if not exists status text not null default 'active';
alter table inventory add column if not exists warranty_expiry date;
alter table inventory add column if not exists minimum_stock int;
alter table inventory add column if not exists notes text;
alter table inventory add column if not exists created_by uuid references profiles(id);
alter table inventory add column if not exists updated_at timestamptz not null default now();
update inventory set available_quantity = quantity where available_quantity = 0;
alter table inventory drop constraint if exists inventory_condition_check;
alter table inventory add constraint inventory_condition_check check (condition in ('new','good','fair','damaged','under_repair','disposed'));
alter table inventory add constraint inventory_status_check check (status in ('active','disposed'));
alter table inventory add constraint inventory_quantity_check check (available_quantity >= 0 and available_quantity <= quantity);
create trigger trg_set_updated_at before update on inventory
  for each row execute function set_updated_at();

create table inventory_transactions (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references schools(id) on delete cascade,
  item_id uuid not null references inventory(id) on delete cascade,
  transaction_type text not null,
  quantity int not null,
  from_location text,
  to_location text,
  assigned_to_type text,
  assigned_to_id uuid,
  assigned_to_label text,
  reason text,
  performed_by uuid references profiles(id),
  created_at timestamptz not null default now(),
  constraint inventory_transactions_type_check check (
    transaction_type in ('stock_in','stock_out','assignment','return','transfer','adjustment','repair','dispose')
  ),
  constraint inventory_transactions_quantity_check check (quantity > 0),
  constraint inventory_transactions_assigned_type_check check (
    assigned_to_type is null or assigned_to_type in ('teacher','staff','department','room')
  )
);
create index idx_inventory_transactions_item on inventory_transactions(item_id, created_at desc);
create index idx_inventory_transactions_school on inventory_transactions(school_id);

-- Applies the stock/assignment effect of a new transaction to the item.
-- Corrections are made by inserting a new, opposite transaction — this
-- table is never updated or deleted (see RLS below), matching the
-- append-only ledger pattern already used for payments/refunds.
create or replace function apply_inventory_transaction() returns trigger as $$
declare
  v_item inventory%rowtype;
begin
  select * into v_item from inventory where id = new.item_id for update;
  if v_item.id is null then
    raise exception 'Inventory item % not found.', new.item_id;
  end if;

  if new.transaction_type = 'stock_in' then
    update inventory set quantity = quantity + new.quantity, available_quantity = available_quantity + new.quantity where id = new.item_id;
  elsif new.transaction_type = 'stock_out' then
    if new.quantity > v_item.available_quantity then
      raise exception 'Cannot stock out % units — only % available.', new.quantity, v_item.available_quantity;
    end if;
    update inventory set quantity = quantity - new.quantity, available_quantity = available_quantity - new.quantity where id = new.item_id;
  elsif new.transaction_type in ('assignment','repair') then
    if new.quantity > v_item.available_quantity then
      raise exception 'Cannot assign/send % units for repair — only % available.', new.quantity, v_item.available_quantity;
    end if;
    update inventory set available_quantity = available_quantity - new.quantity,
      condition = case when new.transaction_type = 'repair' then 'under_repair' else condition end
      where id = new.item_id;
  elsif new.transaction_type = 'return' then
    if v_item.available_quantity + new.quantity > v_item.quantity then
      raise exception 'Cannot return % units — would exceed total quantity of %.', new.quantity, v_item.quantity;
    end if;
    update inventory set available_quantity = available_quantity + new.quantity where id = new.item_id;
  elsif new.transaction_type = 'dispose' then
    if new.quantity > v_item.available_quantity then
      raise exception 'Cannot dispose % units — only % available.', new.quantity, v_item.available_quantity;
    end if;
    update inventory set
      quantity = quantity - new.quantity,
      available_quantity = available_quantity - new.quantity,
      status = case when quantity - new.quantity <= 0 then 'disposed' else status end,
      condition = case when quantity - new.quantity <= 0 then 'disposed' else condition end
      where id = new.item_id;
  elsif new.transaction_type = 'transfer' then
    update inventory set location = coalesce(new.to_location, location) where id = new.item_id;
  end if;
  -- 'adjustment' rows are audit-only (e.g. a physical-count note) and do
  -- not change quantities on their own.

  return new;
end;
$$ language plpgsql;
create trigger trg_apply_inventory_transaction after insert on inventory_transactions
  for each row execute function apply_inventory_transaction();

alter table inventory_categories enable row level security;
create policy inventory_categories_select on inventory_categories for select
  using (is_super_admin() or (is_school_staff() and school_id = auth_school_id()));
create policy inventory_categories_admin_write on inventory_categories for insert
  with check (is_super_admin() or (is_school_admin_role() and school_id = auth_school_id()));
create policy inventory_categories_admin_update on inventory_categories for update
  using (is_super_admin() or (is_school_admin_role() and school_id = auth_school_id()));
create policy inventory_categories_admin_delete on inventory_categories for delete
  using (is_super_admin() or (is_school_admin_role() and school_id = auth_school_id()));

alter table inventory_locations enable row level security;
create policy inventory_locations_select on inventory_locations for select
  using (is_super_admin() or (is_school_staff() and school_id = auth_school_id()));
create policy inventory_locations_admin_write on inventory_locations for insert
  with check (is_super_admin() or (is_school_admin_role() and school_id = auth_school_id()));
create policy inventory_locations_admin_update on inventory_locations for update
  using (is_super_admin() or (is_school_admin_role() and school_id = auth_school_id()));
create policy inventory_locations_admin_delete on inventory_locations for delete
  using (is_super_admin() or (is_school_admin_role() and school_id = auth_school_id()));

drop policy if exists inventory_tenant_select on inventory;
create policy inventory_select on inventory for select
  using (is_super_admin() or (is_school_staff() and school_id = auth_school_id()));
-- inventory_staff_insert/update/delete (from 0002) stay as-is: any
-- school staff member may manage assets (no dedicated "inventory
-- manager" role exists yet in this system).

alter table inventory_transactions enable row level security;
create policy inventory_transactions_select on inventory_transactions for select
  using (is_super_admin() or (is_school_staff() and school_id = auth_school_id()));
create policy inventory_transactions_staff_insert on inventory_transactions for insert
  with check (is_super_admin() or (is_school_staff() and school_id = auth_school_id()));
-- No update or delete policy: this ledger is append-only, exactly like
-- payments/refunds in Phase 5. A mistaken entry is corrected by
-- inserting a new, opposite transaction, never by editing history.

-- audit_logs: first real usage in this build. Its tenant-wide SELECT
-- from 0002 would let a student/parent read staff-only operational
-- history (who issued which book, who was assigned which asset) — tighten
-- to staff-only, and drop update/delete entirely (append-only, same
-- reasoning as inventory_transactions).
drop policy if exists audit_logs_tenant_select on audit_logs;
create policy audit_logs_select on audit_logs for select
  using (is_super_admin() or (is_school_staff() and school_id = auth_school_id()));
drop policy if exists audit_logs_staff_update on audit_logs;
drop policy if exists audit_logs_staff_delete on audit_logs;
