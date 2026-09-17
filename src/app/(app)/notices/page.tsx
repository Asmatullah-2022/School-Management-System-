import { listNotices } from "@/lib/data/records";
import { Card } from "@/components/ui/card";

const priorityStyles: Record<string, string> = {
  high: "bg-danger/10 text-danger",
  normal: "bg-primary/10 text-primary",
  low: "bg-muted/10 text-muted",
};

export default async function NoticesPage() {
  const notices = await listNotices();

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
                <p className="mt-2 text-xs text-muted">
                  Published {new Date(n.publish_date).toLocaleDateString()} · Audience: {n.audience}
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
