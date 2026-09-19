import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { listNotices } from "@/lib/data/records";
import { listStudents } from "@/lib/data/students";
import { getStudentIdForProfile, getChildStudentIdsForProfile } from "@/lib/data/people";
import { visibleNotices, classIdsForStudents } from "@/lib/notices/visibility";
import { Card } from "@/components/ui/card";

const priorityStyles: Record<string, string> = {
  high: "bg-danger/10 text-danger",
  normal: "bg-primary/10 text-primary",
  low: "bg-muted/10 text-muted",
};

export default async function NoticesPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const allNotices = await listNotices();

  let classIds: string[] = [];
  if (session.profile.role === "student") {
    const id = await getStudentIdForProfile(session.profile.id);
    const student = id ? (await listStudents()).find((s) => s.id === id) : undefined;
    classIds = student?.class_id ? [student.class_id] : [];
  } else if (session.profile.role === "parent") {
    const childIds = await getChildStudentIdsForProfile(session.profile.id);
    const children = (await listStudents()).filter((s) => childIds.includes(s.id));
    classIds = classIdsForStudents(children);
  }

  const notices = visibleNotices(allNotices, session.profile.role, classIds);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold">Notices & Announcements</h1>
        <p className="text-sm text-muted">{notices.length} published notices</p>
      </div>

      <div className="space-y-3">
        {notices.map((n) => (
          <Card key={n.id} className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold">{n.title}</h3>
                <p className="mt-1 text-sm text-muted">{n.description}</p>
                {n.attachment_url && (
                  <a href={n.attachment_url} target="_blank" rel="noreferrer" className="mt-1 inline-block text-xs font-medium text-primary hover:underline">
                    View attachment
                  </a>
                )}
                <p className="mt-2 text-xs text-muted">
                  Published {new Date(n.publish_date).toLocaleDateString()} · Audience: {n.audience}
                  {n.expiry_date && <> · Expires {new Date(n.expiry_date).toLocaleDateString()}</>}
                </p>
              </div>
              <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium capitalize ${priorityStyles[n.priority] ?? priorityStyles.normal}`}>
                {n.priority}
              </span>
            </div>
          </Card>
        ))}
        {notices.length === 0 && <p className="text-sm text-muted">No notices yet.</p>}
      </div>
    </div>
  );
}
