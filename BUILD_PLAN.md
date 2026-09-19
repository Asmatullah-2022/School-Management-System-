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
- [x] **Phase 3** — Subjects (CRUD, bilingual name, type/marks), Periods,
      Subject Assignments (class+section+subject+teacher, duplicate-proof),
      Timetable builder with server- and DB-level conflict detection
      (teacher/section/room double-booking), role-scoped views (teacher's
      own timetable + "My Classes/My Subjects" dashboard, student's own
      class, parent's per-child selector), printable class/teacher
      timetables. Attendance analytics deferred (not in this phase's scope).
- [x] **Phase 4** — Examinations (create/edit/archive, draft→scheduled→
      ongoing→completed→published), Exam Schedule (subject/class/section/
      date/time/room/invigilator) with room/invigilator/class conflict
      detection, Marks entry (draft→submitted→verified→published) scoped
      to a teacher's own assignments, configurable grading scale, automatic
      result calculation (percentage/grade/pass-fail/rank), class results
      with CSV export and print, per-subject analytics, printable A4 result
      cards, student Academic History tab, published-mark revision audit
      trail (reason/old/new/user/timestamp, enforced by a DB trigger),
      results hidden from students/parents until the exam is published
      (enforced by RLS, not just the UI).
- [x] **Phase 5** — Fees & Finance: Fee Structures (type/frequency/CRUD/
      duplicate), Fee Periods, fee-charge generation (school/class/section/
      student scope, DB-enforced duplicate prevention), Discounts (fixed/
      percentage, school/class/section/student scope) and Scholarships
      (School-Admin approval workflow), an append-only payment ledger
      (`payments`/`payment_allocations`/`refunds` — insert+select only, no
      UPDATE/DELETE policy on any of the three, so a historical transaction
      can never be edited), atomic sequential receipt numbers
      (`REC-YYYY-000001` via a row-locking DB function), multi-fee payment
      allocation, capped and audit-logged refunds, printable receipts,
      Student Fee Accounts (ledger), Outstanding Fees (filters + CSV
      export), Payment History (filters + CSV export), a Finance Reports
      Center (collection/outstanding-by-class/payment-method/discount-
      scholarship/defaulters/refunds, each CSV-exportable), in-app fee
      reminders (no SMS/WhatsApp claimed), and a Finance Dashboard with
      real charts. RLS: School Admin/Accountant/Super Admin only for every
      finance table; teachers get none; parents/students see only their
      own/child's charges, payments, and refunds.
- [x] **Phase 6** — Parent + Student Portals: dedicated dashboards (My
      Children switcher, today's attendance/class/homework/result/fees/
      exams/notices cards), a My Children directory + per-child profile,
      an Attendance overview (daily/weekly/monthly/session views, a
      calendar grid, trend chart), an Exam Schedule view (upcoming/past,
      scoped to the child's class/section), Homework submissions (the
      long-unused `assignments` table finally wired up: student submits,
      status pending→submitted/late→checked), a Leave Requests page
      (submit/status/history for parent/student, review for School Admin,
      finally using the long-unused `leave_requests` table), a real
      Notification Center (mark-as-read, topbar badge wired to real
      unread counts), a Profile page (own info + a student self-service
      contact-details form, DB-trigger-guarded against editing admin
      fields), and audience/expiry-aware Notices + upcoming/past Events.
      Closed a set of pre-existing RLS gaps left over from Phase 1's
      generic tenant policy (`students`/`parents`/`student_parents`/
      `attendance`/`assignments`/`leave_requests`/`notifications` were
      previously readable tenant-wide by any authenticated user); added
      matching server-side route guards on staff-only pages that had only
      ever been hidden from the sidebar, not actually protected
      (`/students`, `/teachers`, `/classes`, `/attendance` marking).
      Verified live against real Postgres and Playwright: cross-family
      data isolation, direct-URL/ID probing, identity-spoofed leave
      submission, and a student trying to self-approve homework all
      correctly rejected.
- [ ] **Phase 7** — Homework + Notifications + Events enhancement (richer
      targeting, attachments, richer notification triggers), building on
      the Phase 6 portal foundation.
- [ ] **Phase 8** — Library, Transport, Inventory.
- [ ] **Phase 9** — Certificates, Reports Center, PDF generation.
- [ ] **Phase 10** — Users & Roles admin UI, editable School Settings,
      performance/security hardening pass.
- [ ] **Phase 11** — Final testing pass, PWA manifest, deployment prep.

Modules not yet built show a "coming soon" placeholder in the sidebar
(`src/app/(app)/modules/[slug]/page.tsx`) naming their phase, so the full
navigation structure from the spec is visible today even where the screen
isn't built yet.
