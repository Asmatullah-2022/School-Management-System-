import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, ClipboardCheck, FileText, NotebookPen, Wallet, CalendarClock } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { getChildStudentIdsForProfile } from "@/lib/data/people";
import { getStudent } from "@/lib/data/students";
import { listClasses, listSections } from "@/lib/data/academics";
import { getCurrentAcademicSession } from "@/lib/data/sessions";
import { Card, CardHeader } from "@/components/ui/card";

export default async function ChildProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.profile.role !== "parent") redirect("/dashboard");

  const { id } = await params;
  const childIds = await getChildStudentIdsForProfile(session.profile.id);
  if (!childIds.includes(id)) redirect("/children");

  const [student, classes, sections, academicSession] = await Promise.all([
    getStudent(id),
    listClasses(),
    listSections(),
    getCurrentAcademicSession(),
  ]);
  if (!student) notFound();

  const links = [
    { href: "/attendance", label: "Attendance", icon: ClipboardCheck },
    { href: "/results", label: "Results", icon: FileText },
    { href: "/homework", label: "Homework", icon: NotebookPen },
    { href: "/timetable", label: "Timetable", icon: CalendarClock },
    { href: `/fees/account/${student.id}`, label: "Fee Account", icon: Wallet },
  ];

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <Link href="/children" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-primary">
        <ArrowLeft size={15} /> Back to My Children
      </Link>

      <Card>
        <CardHeader title="Student Profile" />
        <div className="flex items-center gap-4 p-5">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-primary/10 text-2xl font-semibold text-primary">
            {student.full_name.charAt(0)}
          </div>
          <div>
            <p className="text-lg font-semibold">{student.full_name}</p>
            <p className="text-sm text-muted">Admission #{student.admission_number}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 border-t border-border p-5 text-sm sm:grid-cols-3">
          <Field label="Father/Guardian" value={student.father_name ?? "—"} />
          <Field label="Roll #" value={student.roll_number ?? "—"} />
          <Field label="Class" value={classes.find((c) => c.id === student.class_id)?.name ?? "—"} />
          <Field label="Section" value={sections.find((s) => s.id === student.section_id)?.name ?? "—"} />
          <Field label="Academic Session" value={academicSession?.name ?? "—"} />
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {links.map((l) => (
          <Link
            key={l.label}
            href={l.href}
            className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-surface p-4 text-center text-sm font-medium shadow-sm hover:bg-background"
          >
            <l.icon size={20} className="text-primary" />
            {l.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted">{label}</p>
      <p className="mt-0.5 font-medium">{value}</p>
    </div>
  );
}
