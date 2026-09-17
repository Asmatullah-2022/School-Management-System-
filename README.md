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

1. Create a project at https://supabase.com.
2. Run `supabase/migrations/0001_schema.sql` then `0002_rls.sql` in the SQL
   editor (schema + row-level security for multi-tenant isolation).
3. Optionally run `supabase/seed.sql` for the same demo data used in demo
   mode, so switching over doesn't change what you see.
4. Copy `.env.example` to `.env.local` and fill in your project's URL and
   anon key. Demo mode turns off automatically once those are set.

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
