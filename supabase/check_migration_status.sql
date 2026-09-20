-- =====================================================================
-- READ-ONLY migration status check.
--
-- This repository's migrations (0001-0010) are plain numbered SQL files,
-- not a `supabase init`-scaffolded project - there is no
-- `supabase/config.toml` and no CLI-tracked migration history table.
-- That means a real production Supabase project has NO built-in record
-- of which of these files have already been run. Re-running an already
-- applied migration is NOT safe (most statements are plain `create
-- table`/`create policy`, not `create table if not exists`), so run this
-- script FIRST, before applying anything, to see what state the target
-- database is actually in.
--
-- This script only reads from information_schema/pg_catalog — it makes
-- no changes.
-- =====================================================================
select
  '0001_schema' as migration,
  exists (select 1 from information_schema.tables where table_name = 'students') as applied
union all
select '0002_rls',
  exists (select 1 from pg_proc where proname = 'auth_school_id')
union all
select '0003_phase3_academics',
  exists (select 1 from information_schema.tables where table_name = 'periods')
union all
select '0004_phase4_examinations',
  exists (select 1 from information_schema.tables where table_name = 'mark_revisions')
union all
select '0005_phase5_finance',
  exists (select 1 from information_schema.tables where table_name = 'fee_periods')
union all
select '0006_phase6_portals',
  exists (select 1 from pg_proc where proname = 'my_student_ids')
union all
select '0007_phase7_enhancements',
  exists (select 1 from information_schema.tables where table_name = 'event_responses')
union all
select '0008_phase8_library_transport_inventory',
  exists (select 1 from information_schema.tables where table_name = 'library_categories')
union all
select '0009_phase9_reports_certificates',
  exists (select 1 from information_schema.tables where table_name = 'certificate_templates')
union all
select '0010_phase10_security_hardening',
  exists (select 1 from information_schema.views where table_name = 'teacher_directory')
order by 1;
