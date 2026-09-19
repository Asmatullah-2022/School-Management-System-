import Link from "next/link";
import { redirect } from "next/navigation";
import { Users, ArrowRight } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { getChildStudentIdsForProfile } from "@/lib/data/people";
import { listStudents } from "@/lib/data/students";
import { listClasses, listSections } from "@/lib/data/academics";
import { Card, EmptyState } from "@/components/ui/card";

export default async function MyChildrenPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.profile.role !== "parent") redirect("/dashboard");

  const [childIds, allStudents, classes, sections] = await Promise.all([
    getChildStudentIdsForProfile(session.profile.id),
    listStudents(),
    listClasses(),
    listSections(),
  ]);
  const children = allStudents.filter((s) => childIds.includes(s.id));

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold">My Children</h1>
        <p className="text-sm text-muted">{children.length} child{children.length === 1 ? "" : "ren"} linked to your account.</p>
      </div>

      {children.length === 0 ? (
        <Card><EmptyState label="No children are linked to your account yet. Please contact the school office." /></Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {children.map((c) => (
            <Card key={c.id} className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-lg font-semibold text-primary">
                  {c.full_name.charAt(0)}
                </div>
                <div className="min-w-0">
                  <p className="truncate font-medium">{c.full_name}</p>
                  <p className="text-xs text-muted">
                    {classes.find((cl) => cl.id === c.class_id)?.name ?? "—"} - {sections.find((s) => s.id === c.section_id)?.name ?? "—"}
                  </p>
                </div>
              </div>
              <Link
                href={`/children/${c.id}`}
                className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
              >
                <Users size={14} /> View Profile <ArrowRight size={14} />
              </Link>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
