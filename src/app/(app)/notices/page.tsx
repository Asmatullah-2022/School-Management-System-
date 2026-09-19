import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus, CheckCircle2 } from "lucide-react";
import { getSession, isSchoolAdmin } from "@/lib/auth/session";
import { listNotices } from "@/lib/data/records";
import { listStudents } from "@/lib/data/students";
import { getStudentIdForProfile, getChildStudentIdsForProfile } from "@/lib/data/people";
import { visibleNotices, classIdsForStudents } from "@/lib/notices/visibility";
import { noticeRecipientProfileIds } from "@/lib/notices/audience";
import { listNoticeAcknowledgements } from "@/lib/data/notices";
import { Card } from "@/components/ui/card";
import { AcknowledgeButton } from "@/components/notices/acknowledge-button";
import { acknowledgeNoticeAction } from "./actions";

const priorityStyles: Record<string, string> = {
  urgent: "bg-danger/10 text-danger",
  important: "bg-warning/10 text-warning",
  normal: "bg-primary/10 text-primary",
};

export default async function NoticesPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const [allNotices, myAcks] = await Promise.all([listNotices(), listNoticeAcknowledgements()]);
  const isAdmin = isSchoolAdmin(session.profile.role);

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
  const myAckIds = new Set(myAcks.filter((a) => a.profile_id === session.profile.id).map((a) => a.notice_id));

  const ackSummaries = new Map<string, { total: number; acknowledged: number }>();
  if (isAdmin) {
    for (const notice of notices) {
      if (!notice.requires_acknowledgement) continue;
      const recipients = await noticeRecipientProfileIds(notice);
      const acks = await listNoticeAcknowledgements(notice.id);
      const acknowledged = acks.filter((a) => recipients.has(a.profile_id)).length;
      ackSummaries.set(notice.id, { total: recipients.size, acknowledged });
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Notices & Announcements</h1>
          <p className="text-sm text-muted">{notices.length} published notices</p>
        </div>
        {isAdmin && (
          <Link
            href="/notices/new"
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            <Plus size={15} /> New Notice
          </Link>
        )}
      </div>

      <div className="space-y-3">
        {notices.map((n) => {
          const summary = ackSummaries.get(n.id);
          return (
            <Card key={n.id} className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
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

              {!isAdmin && n.requires_acknowledgement && (
                <div className="mt-3 border-t border-border pt-3">
                  {myAckIds.has(n.id) ? (
                    <p className="inline-flex items-center gap-1.5 text-sm font-medium text-success">
                      <CheckCircle2 size={15} /> Acknowledged
                    </p>
                  ) : (
                    <AcknowledgeButton noticeId={n.id} action={acknowledgeNoticeAction} />
                  )}
                </div>
              )}

              {isAdmin && summary && (
                <p className="mt-3 border-t border-border pt-3 text-xs text-muted">
                  Acknowledged: <span className="font-medium text-foreground">{summary.acknowledged}</span> / {summary.total} ·{" "}
                  Not acknowledged: <span className="font-medium text-foreground">{Math.max(summary.total - summary.acknowledged, 0)}</span>
                </p>
              )}
            </Card>
          );
        })}
        {notices.length === 0 && <p className="text-sm text-muted">No notices yet.</p>}
      </div>
    </div>
  );
}
