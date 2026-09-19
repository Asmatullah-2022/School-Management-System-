import { redirect } from "next/navigation";
import Link from "next/link";
import { Moon, Users } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { getStudentIdForProfile, getChildStudentIdsForProfile } from "@/lib/data/people";
import { getStudent, listStudents } from "@/lib/data/students";
import { listClasses, listSections } from "@/lib/data/academics";
import { getCurrentAcademicSession } from "@/lib/data/sessions";
import { Card, CardHeader } from "@/components/ui/card";
import { StudentProfileForm } from "@/components/profile/student-profile-form";
import { updateStudentProfileAction } from "./actions";

export default async function ProfilePage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const [classes, sections, academicSession] = await Promise.all([listClasses(), listSections(), getCurrentAcademicSession()]);

  if (session.profile.role === "student") {
    const studentId = await getStudentIdForProfile(session.profile.id);
    const student = studentId ? await getStudent(studentId) : undefined;

    if (!student) {
      return (
        <div className="mx-auto max-w-2xl space-y-4">
          <h1 className="text-xl font-semibold">My Profile</h1>
          <Card className="p-5 text-sm text-muted">No student record is linked to your account yet. Please contact the school office.</Card>
        </div>
      );
    }

    return (
      <div className="mx-auto max-w-2xl space-y-4">
        <h1 className="text-xl font-semibold">My Profile</h1>
        <Card>
          <CardHeader title="Academic Details" />
          <div className="grid grid-cols-2 gap-4 p-5 text-sm sm:grid-cols-3">
            <Field label="Name" value={student.full_name} />
            <Field label="Admission #" value={student.admission_number} />
            <Field label="Roll #" value={student.roll_number ?? "—"} />
            <Field label="Class" value={classes.find((c) => c.id === student.class_id)?.name ?? "—"} />
            <Field label="Section" value={sections.find((s) => s.id === student.section_id)?.name ?? "—"} />
            <Field label="Academic Session" value={academicSession?.name ?? "—"} />
            <Field label="Father/Guardian" value={student.father_name ?? "—"} />
          </div>
        </Card>
        <Card>
          <CardHeader title="Editable Contact Details" />
          <div className="p-5">
            <StudentProfileForm student={student} action={updateStudentProfileAction} />
          </div>
        </Card>
        <PreferencesCard />
      </div>
    );
  }

  if (session.profile.role === "parent") {
    const childIds = await getChildStudentIdsForProfile(session.profile.id);
    const allStudents = await listStudents();
    const children = allStudents.filter((s) => childIds.includes(s.id));

    return (
      <div className="mx-auto max-w-2xl space-y-4">
        <h1 className="text-xl font-semibold">My Profile</h1>
        <Card>
          <CardHeader title="Account" />
          <div className="grid grid-cols-2 gap-4 p-5 text-sm">
            <Field label="Name" value={session.profile.full_name} />
            <Field label="Phone" value={session.profile.phone ?? "—"} />
          </div>
        </Card>
        <Card>
          <CardHeader title="My Children" action={<Link href="/children" className="text-xs font-medium text-primary hover:underline">View all</Link>} />
          {children.length === 0 ? (
            <p className="px-5 py-6 text-sm text-muted">No children are linked to your account yet.</p>
          ) : (
            <ul className="divide-y divide-border">
              {children.map((c) => (
                <li key={c.id} className="flex items-center gap-3 px-5 py-3 text-sm">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Users size={14} />
                  </div>
                  <div>
                    <p className="font-medium">{c.full_name}</p>
                    <p className="text-xs text-muted">
                      {classes.find((cl) => cl.id === c.class_id)?.name} - {sections.find((s) => s.id === c.section_id)?.name}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
        <PreferencesCard />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <h1 className="text-xl font-semibold">My Profile</h1>
      <Card>
        <CardHeader title="Account" />
        <div className="grid grid-cols-2 gap-4 p-5 text-sm">
          <Field label="Name" value={session.profile.full_name} />
          <Field label="Role" value={session.profile.role.replace("_", " ")} />
          <Field label="Phone" value={session.profile.phone ?? "—"} />
        </div>
      </Card>
      <PreferencesCard />
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted">{label}</p>
      <p className="mt-0.5 font-medium capitalize">{value}</p>
    </div>
  );
}

function PreferencesCard() {
  return (
    <Card>
      <CardHeader title="Settings & Preferences" />
      <div className="flex items-center gap-3 p-5 text-sm text-muted">
        <Moon size={16} />
        <p>Use the moon/sun icon in the top bar to switch between light and dark mode — it applies everywhere, including this portal.</p>
      </div>
    </Card>
  );
}
