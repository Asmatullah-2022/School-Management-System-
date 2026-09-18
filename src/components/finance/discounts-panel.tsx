"use client";

import { useState, useTransition } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import type { Discount, Scholarship, SchoolClass, Section, Student } from "@/types/database";

export function DiscountsPanel({
  discounts,
  classes,
  sections,
  canManage,
  createAction,
  toggleAction,
}: {
  discounts: Discount[];
  classes: SchoolClass[];
  sections: Section[];
  canManage: boolean;
  createAction: (formData: FormData) => Promise<{ error?: string } | void>;
  toggleAction: (id: string, isActive: boolean) => Promise<void>;
}) {
  const [scope, setScope] = useState<Discount["scope"]>("school");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <div className="space-y-4">
      {canManage && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setError(null);
            const formData = new FormData(e.currentTarget);
            startTransition(async () => {
              const res = await createAction(formData);
              if (res?.error) setError(res.error);
              else (e.target as HTMLFormElement).reset();
            });
          }}
          className="grid grid-cols-1 gap-3 rounded-xl border border-border p-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          {error && <p className="col-span-full rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>}
          <input name="name" required placeholder="Discount name" className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
          <select name="kind" className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary">
            <option value="percentage">Percentage (%)</option>
            <option value="fixed">Fixed (PKR)</option>
          </select>
          <input name="value" type="number" min={0.01} step="0.01" required placeholder="Value" className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
          <select name="scope" value={scope} onChange={(e) => setScope(e.target.value as Discount["scope"])} className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary">
            <option value="school">Entire school</option>
            <option value="class">One class</option>
            <option value="section">One section</option>
          </select>
          {scope === "class" && (
            <select name="class_id" required className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary">
              <option value="">Select class</option>
              {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          )}
          {scope === "section" && (
            <select name="section_id" required className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary">
              <option value="">Select section</option>
              {sections.map((s) => <option key={s.id} value={s.id}>{classes.find((c) => c.id === s.class_id)?.name} - {s.name}</option>)}
            </select>
          )}
          <button type="submit" disabled={pending} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-60">
            {pending ? "Adding…" : "Add Discount"}
          </button>
        </form>
      )}

      <ul className="divide-y divide-border">
        {discounts.length === 0 && <li className="px-1 py-6 text-center text-sm text-muted">No discounts defined yet.</li>}
        {discounts.map((d) => (
          <li key={d.id} className="flex items-center justify-between py-3 text-sm">
            <div>
              <p className="font-medium">{d.name}</p>
              <p className="text-xs text-muted">
                {d.kind === "percentage" ? `${d.value}%` : `PKR ${d.value.toLocaleString()}`} · {d.scope === "school" ? "Entire school" : d.scope === "class" ? classes.find((c) => c.id === d.class_id)?.name : `${classes.find((c) => c.id === sections.find((s) => s.id === d.section_id)?.class_id)?.name} - ${sections.find((s) => s.id === d.section_id)?.name}`}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${d.is_active ? "bg-success/10 text-success" : "bg-muted/10 text-muted"}`}>
                {d.is_active ? "Active" : "Inactive"}
              </span>
              {canManage && (
                <button onClick={() => toggleAction(d.id, !d.is_active)} className="text-xs font-medium text-primary hover:underline">
                  {d.is_active ? "Deactivate" : "Activate"}
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ScholarshipsPanel({
  scholarships,
  students,
  canPropose,
  canApprove,
  createAction,
  decideAction,
}: {
  scholarships: Scholarship[];
  students: Student[];
  canPropose: boolean;
  canApprove: boolean;
  createAction: (formData: FormData) => Promise<{ error?: string } | void>;
  decideAction: (id: string, status: "approved" | "rejected") => Promise<{ error?: string } | void>;
}) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const statusStyles: Record<string, string> = {
    approved: "bg-success/10 text-success",
    pending: "bg-warning/10 text-warning",
    rejected: "bg-danger/10 text-danger",
  };

  return (
    <div className="space-y-4">
      {canPropose && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setError(null);
            const formData = new FormData(e.currentTarget);
            startTransition(async () => {
              const res = await createAction(formData);
              if (res?.error) setError(res.error);
              else (e.target as HTMLFormElement).reset();
            });
          }}
          className="grid grid-cols-1 gap-3 rounded-xl border border-border p-4 sm:grid-cols-2 lg:grid-cols-5"
        >
          {error && <p className="col-span-full rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>}
          <select name="student_id" required className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary">
            <option value="">Select student</option>
            {students.map((s) => <option key={s.id} value={s.id}>{s.full_name} ({s.admission_number})</option>)}
          </select>
          <input name="name" required placeholder="Scholarship name" className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
          <select name="kind" className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary">
            <option value="percentage">Percentage (%)</option>
            <option value="fixed">Fixed (PKR)</option>
          </select>
          <input name="value" type="number" min={0.01} step="0.01" required placeholder="Value" className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
          <input name="notes" placeholder="Notes (optional)" className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
          <button type="submit" disabled={pending} className="col-span-full rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-60 sm:col-span-1">
            {pending ? "Submitting…" : "Propose"}
          </button>
        </form>
      )}

      <ul className="divide-y divide-border">
        {scholarships.length === 0 && <li className="px-1 py-6 text-center text-sm text-muted">No scholarships proposed yet.</li>}
        {scholarships.map((s) => (
          <li key={s.id} className="flex items-center justify-between py-3 text-sm">
            <div>
              <p className="font-medium">
                {students.find((st) => st.id === s.student_id)?.full_name ?? "—"} — {s.name}
              </p>
              <p className="text-xs text-muted">
                {s.kind === "percentage" ? `${s.value}%` : `PKR ${s.value.toLocaleString()}`}
                {s.notes ? ` · ${s.notes}` : ""}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${statusStyles[s.status]}`}>{s.status}</span>
              {canApprove && s.status === "pending" && (
                <>
                  <button onClick={() => decideAction(s.id, "approved")} className="rounded-md p-1.5 text-success hover:bg-success/10" aria-label="Approve">
                    <CheckCircle2 size={16} />
                  </button>
                  <button onClick={() => decideAction(s.id, "rejected")} className="rounded-md p-1.5 text-danger hover:bg-danger/10" aria-label="Reject">
                    <XCircle size={16} />
                  </button>
                </>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
