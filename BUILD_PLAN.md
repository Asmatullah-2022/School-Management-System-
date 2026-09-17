# Build plan

Building the full spec in phases so every shipped increment stays fully
functional (real CRUD, tested UI, no half-finished screens), per the
project brief. Status below reflects the current branch.

- [x] **Phase 1** — Project architecture, database schema (all modules,
      multi-tenant + RLS), authentication (Supabase Auth + demo mode),
      role-based route protection.
- [x] **Phase 2** — Dashboard, Students (CRUD + profile tabs), Teachers
      (CRUD), Classes & Sections.
- [x] Attendance, Notices, Events, Homework, Fees read/write views pulled
      forward from later phases since the schema and dashboard needed them.
- [ ] **Phase 3** — Subjects assignment UI, Timetable builder, Attendance
      analytics.
- [ ] **Phase 4** — Exams, Marks entry, Results/report cards, PDF export.
- [ ] **Phase 5** — Parents module, Student Promotion.
- [ ] **Phase 6** — richer Homework/Notices/Events workflows (submissions,
      targeted audiences).
- [ ] **Phase 7** — Library, Transport, Inventory.
- [ ] **Phase 8** — Certificates, Reports Center, PDF generation.
- [ ] **Phase 9** — Users & Roles admin UI, editable School Settings,
      performance/security hardening pass.
- [ ] **Phase 10** — Final testing pass, PWA manifest, deployment prep.

Modules not yet built show a "coming soon" placeholder in the sidebar
(`src/app/(app)/modules/[slug]/page.tsx`) naming their phase, so the full
navigation structure from the spec is visible today even where the screen
isn't built yet.
