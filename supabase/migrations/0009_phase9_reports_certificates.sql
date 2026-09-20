-- =====================================================================
-- PHASE 9 — Reports Center, Student/Class 360, Certificates, and
-- document numbering/branding settings.
--
-- `certificates` and `documents` were already reserved (unused) in the
-- Phase 1 schema, with the same generic tenant-wide SELECT policy that
-- was tightened for books/vehicles/inventory in Phase 8 — this migration
-- extends `certificates` rather than replacing it, and applies the same
-- RLS fix. `schools` already carries almost every field Part F asks for
-- (logo_url, address, phone, email, principal_name/signature/stamp); it
-- only needed a few additions plus a certificate-numbering counter,
-- mirroring the existing `next_receipt_number()` pattern from 0005.
-- =====================================================================

alter table schools add column if not exists website text;
alter table schools add column if not exists headteacher_name text;
alter table schools add column if not exists document_footer text;
alter table schools add column if not exists certificate_prefix text not null default 'CERT';
alter table schools add column if not exists last_certificate_number int not null default 0;

-- Atomically reserves and returns the next certificate number for a
-- school, e.g. CERT-2026-000001 — same locking approach as
-- next_receipt_number() so concurrent issuance can never collide.
create or replace function next_certificate_number(p_school_id uuid) returns text as $$
declare
  v_prefix text;
  v_next int;
begin
  update schools
    set last_certificate_number = last_certificate_number + 1
    where id = p_school_id
    returning certificate_prefix, last_certificate_number into v_prefix, v_next;

  return v_prefix || '-' || extract(year from current_date)::text || '-' || lpad(v_next::text, 6, '0');
end;
$$ language plpgsql security definer set search_path = public;

-- ---------------------------------------------------------------------
-- CERTIFICATE_TEMPLATES: reusable wording for the fixed types, plus
-- fully custom templates an admin authors. body_template holds plain
-- text/HTML with {{variable}} placeholders only — never executable code
-- (the rendering step in the app does simple string substitution, no
-- eval/template-engine with logic).
-- ---------------------------------------------------------------------
create table certificate_templates (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references schools(id) on delete cascade,
  name text not null,
  certificate_type text not null,
  body_template text not null,
  is_custom boolean not null default true,
  created_by uuid references profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint certificate_templates_type_check check (
    certificate_type in ('bonafide','character','leaving','transfer','result','attendance','enrollment','custom')
  )
);
create index idx_certificate_templates_school on certificate_templates(school_id);
create trigger trg_set_updated_at before update on certificate_templates
  for each row execute function set_updated_at();

alter table certificates add column if not exists certificate_number text;
alter table certificates add column if not exists template_id uuid references certificate_templates(id) on delete set null;
alter table certificates add column if not exists body_text text;
alter table certificates add column if not exists status text not null default 'issued';
alter table certificates add column if not exists created_by uuid references profiles(id);
alter table certificates add column if not exists cancelled_by uuid references profiles(id);
alter table certificates add column if not exists cancelled_at timestamptz;
alter table certificates add column if not exists cancellation_reason text;
alter table certificates add column if not exists updated_at timestamptz not null default now();
alter table certificates add constraint certificates_type_check check (
  certificate_type in ('bonafide','character','leaving','transfer','result','attendance','enrollment','custom')
);
alter table certificates add constraint certificates_status_check check (status in ('issued','cancelled'));
create unique index if not exists uq_certificates_number on certificates(school_id, certificate_number) where certificate_number is not null;
create trigger trg_set_updated_at before update on certificates
  for each row execute function set_updated_at();

-- Certificates are issued-then-optionally-cancelled, never deleted —
-- matches the append-only-history philosophy already used for payments/
-- refunds/inventory transactions. No delete policy is ever granted.
drop policy if exists certificates_tenant_select on certificates;
create policy certificates_select on certificates for select
  using (
    is_super_admin()
    or (is_school_staff() and school_id = auth_school_id())
    or student_id in (select my_student_ids())
  );
drop policy if exists certificates_staff_insert on certificates;
drop policy if exists certificates_staff_update on certificates;
drop policy if exists certificates_staff_delete on certificates;
create policy certificates_admin_insert on certificates for insert
  with check (is_super_admin() or (is_school_admin_role() and school_id = auth_school_id()));
create policy certificates_admin_update on certificates for update
  using (is_super_admin() or (is_school_admin_role() and school_id = auth_school_id()));

alter table certificate_templates enable row level security;
create policy certificate_templates_select on certificate_templates for select
  using (is_super_admin() or (is_school_staff() and school_id = auth_school_id()));
create policy certificate_templates_admin_write on certificate_templates for insert
  with check (is_super_admin() or (is_school_admin_role() and school_id = auth_school_id()));
create policy certificate_templates_admin_update on certificate_templates for update
  using (is_super_admin() or (is_school_admin_role() and school_id = auth_school_id()));
create policy certificate_templates_admin_delete on certificate_templates for delete
  using (is_super_admin() or (is_school_admin_role() and school_id = auth_school_id()));
