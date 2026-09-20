# School Management System

A modern, role-based school management platform for schools in Pakistan, built
with Next.js (App Router), TypeScript, Tailwind CSS, and Supabase (PostgreSQL
+ Auth).

Being built in phases (see `BUILD_PLAN.md`). **Phase 1 and Phase 2 are done
and functional.**

## Quick start

```bash
npm install
npm run dev
```

Open http://localhost:3000. With no Supabase project configured, the app
runs in **demo mode** automatically: a role picker on the login page lets you
sign in as Super Admin, School Admin, Teacher, Accountant, Parent, or Student
and explore a fully working dashboard backed by realistic sample data
("Government Model Primary School").

## Connecting a real Supabase project

This repository's `supabase/migrations/` files are plain numbered SQL
scripts, not a `supabase init`-managed project — there is no CLI-tracked
migration history. Before running anything against an existing database,
run `supabase/check_migration_status.sql` in the SQL editor first to see
which migrations (if any) have already been applied; re-running an
already-applied migration is not safe (most statements are `create table`/
`create policy`, not `if not exists` guarded).

1. Create a project at https://supabase.com.
2. Run `supabase/check_migration_status.sql` and confirm the target
   database is empty (all rows `f`) before a first-time setup, or note
   exactly which migrations are already applied before adding new ones.
3. Run every file in `supabase/migrations/` **in numeric order**,
   `0001` through `0010` (currently: `0001_schema.sql`, `0002_rls.sql`,
   `0003_phase3_academics.sql`, `0004_phase4_examinations.sql`,
   `0005_phase5_finance.sql`, `0006_phase6_portals.sql`,
   `0007_phase7_enhancements.sql`,
   `0008_phase8_library_transport_inventory.sql`,
   `0009_phase9_reports_certificates.sql`,
   `0010_phase10_security_hardening.sql`) — each depends on tables/
   functions the previous ones create.
4. Optionally run `supabase/seed.sql` for the same demo data used in demo
   mode, so switching over doesn't change what you see. Never run it
   against a database that already holds real school data.
5. Copy `.env.example` to `.env.local` (locally) or set the equivalent
   environment variables in your hosting provider, and fill in your
   project's URL and anon key. Demo mode turns off automatically once
   those are set. `SUPABASE_SERVICE_ROLE_KEY` is not currently used by any
   part of this app — do not set it unless a future feature needs it, and
   never expose it as a `NEXT_PUBLIC_*` variable if you do.

## What's implemented (Phase 1 + 2)

- **Database**: full normalized schema for every module in the spec
  (students, teachers, classes/sections/subjects, attendance, exams/marks,
  homework, fees/payments, leave, notices, events, library, transport,
  inventory, certificates, notifications, audit logs) with RLS policies.
- **Auth & roles**: Supabase Auth in production, demo-mode role switcher in
  development; role-based sidebar navigation; route protection in
  `src/middleware.ts` → `src/proxy.ts` (Next.js 16 renamed the convention).
- **Dashboard**: stat cards, enrollment/attendance/fee charts (Recharts),
  latest notices, upcoming events, students requiring attention.
- **Students**: list (search/sort/paginate), multi-step add form, profile
  page with Overview/Attendance/Fees/Homework tabs, archive.
- **Teachers**: list and add form.
- **Classes & Sections**: overview with per-section student counts and
  class teachers.
- **Attendance**: one-click "mark all present" + per-student status editing.
- **Homework, Notices, Events, Fees**: functional read views wired to real
  data.
- Responsive layout (mobile drawer sidebar, stacked cards), dark mode
  (persisted in localStorage), light/professional design system.

Every other module in the original spec (exams/marks, timetable, library,
transport, inventory, certificates, reports, PDF generation, parent/student
portals, multi-school admin, etc.) has its **database tables already
migrated** and a **"coming soon" placeholder page** in the sidebar naming the
phase it ships in — see `src/lib/nav.ts` and `BUILD_PLAN.md`.

## Project structure

```
src/
  app/(app)/…       Authenticated routes (dashboard, students, teachers, …)
  app/login/        Public login page
  components/       UI building blocks (data table, charts, forms, shell)
  lib/data/         Data-access layer (Supabase in prod, demo store in dev)
  lib/demo/         Bundled sample data + in-memory demo store
  lib/auth/         Session helpers + login/logout server actions
  lib/nav.ts        Role-based sidebar navigation config
  types/database.ts TypeScript types mirroring the SQL schema
supabase/
  migrations/       SQL schema + RLS policies
  seed.sql          Demo data matching src/lib/demo
```

## Scripts

- `npm run dev` — start the dev server
- `npm run build` — production build
- `npm run lint` — ESLint
