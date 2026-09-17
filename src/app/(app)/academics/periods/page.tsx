import Link from "next/link";
import { Plus, Pencil, Archive, Coffee } from "lucide-react";
import { getSession, isSchoolAdmin } from "@/lib/auth/session";
import { listPeriods } from "@/lib/data/periods";
import { Card, EmptyState } from "@/components/ui/card";
import { archivePeriodAction } from "./actions";

function formatTime(t: string) {
  const [h, m] = t.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${String(m).padStart(2, "0")} ${period}`;
}

export default async function PeriodsPage() {
  const [session, periods] = await Promise.all([getSession(), listPeriods()]);
  const canManage = !!session && isSchoolAdmin(session.profile.role);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold">Periods</h1>
          <p className="text-sm text-muted">Define the daily period/break schedule used by the timetable.</p>
        </div>
        {canManage && (
          <Link
            href="/academics/periods/new"
            className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            <Plus size={16} /> Add Period
          </Link>
        )}
      </div>

      <Card>
        {periods.length === 0 ? (
          <EmptyState label="No periods have been added yet." />
        ) : (
          <ul className="divide-y divide-border">
            {periods.map((p) => (
              <li key={p.id} className="flex items-center justify-between gap-3 px-5 py-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-xl text-sm font-semibold ${
                      p.is_break ? "bg-warning/10 text-warning" : "bg-primary/10 text-primary"
                    }`}
                  >
                    {p.is_break ? <Coffee size={16} /> : p.period_number}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{p.name}</p>
                    <p className="text-xs text-muted">
                      {formatTime(p.start_time)} – {formatTime(p.end_time)}
                    </p>
                  </div>
                </div>
                {canManage && (
                  <div className="flex items-center gap-1">
                    <Link
                      href={`/academics/periods/${p.id}/edit`}
                      className="rounded-md p-1.5 text-muted hover:bg-background hover:text-primary"
                      aria-label={`Edit ${p.name}`}
                    >
                      <Pencil size={15} />
                    </Link>
                    <form action={archivePeriodAction.bind(null, p.id)}>
                      <button
                        type="submit"
                        className="rounded-md p-1.5 text-muted hover:bg-background hover:text-danger"
                        aria-label={`Archive ${p.name}`}
                      >
                        <Archive size={15} />
                      </button>
                    </form>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
