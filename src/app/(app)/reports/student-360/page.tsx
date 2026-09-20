import { redirect } from "next/navigation";
import { getSession, isSchoolStaff } from "@/lib/auth/session";
import { listStudents } from "@/lib/data/students";
import { getStudentIdForProfile, getChildStudentIdsForProfile } from "@/lib/data/people";
import { loadStudent360 } from "@/lib/reports/load-student-360";
import { Card, EmptyState } from "@/components/ui/card";
import { Student360Selector } from "@/components/reports/student-360-selector";

export default async function Student360Page({ searchParams }: { searchParams: Promise<{ studentId?: string }> }) {
  const session = await getSession();
  if (!session) redirect("/login");

  const { studentId: requestedId } = await searchParams;
  const isStaff = isSchoolStaff(session.profile.role);

  // Security: a parent/student may only ever generate their OWN or their
  // OWN child's Student 360 — never an arbitrary id from the query string.
  // We compute the authorized id set server-side and ignore any
  // unauthorized `studentId` a client might supply.
  let authorizedIds: string[];
  if (isStaff) {
    authorizedIds = (await listStudents()).map((s) => s.id);
  } else if (session.profile.role === "student") {
    const id = await getStudentIdForProfile(session.profile.id);
    authorizedIds = id ? [id] : [];
  } else {
    authorizedIds = await getChildStudentIdsForProfile(session.profile.id);
  }

  if (authorizedIds.length === 0) {
    return (
      <div className="mx-auto max-w-2xl">
        <Card><EmptyState label="No linked student record was found for your account." /></Card>
      </div>
    );
  }

  const studentId = requestedId && authorizedIds.includes(requestedId) ? requestedId : authorizedIds[0];
  const report = await loadStudent360(studentId, session.school.id, session.profile.role);

  const allStudents = isStaff ? await listStudents() : (await listStudents()).filter((s) => authorizedIds.includes(s.id));

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div>
        <h1 className="text-xl font-semibold">Student 360</h1>
        <p className="text-sm text-muted">A complete cross-module snapshot for one student.</p>
      </div>
      <Student360Selector students={allStudents} selectedId={studentId} searchable={isStaff} report={report} />
    </div>
  );
}
