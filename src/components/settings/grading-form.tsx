"use client";

import { useState, useTransition } from "react";
import { Plus, Trash2 } from "lucide-react";
import type { GradeBand } from "@/types/database";

export function GradingForm({
  initialBands,
  action,
}: {
  initialBands: GradeBand[];
  action: (bands: GradeBand[]) => Promise<{ error?: string; success?: true } | void>;
}) {
  const [bands, setBands] = useState<GradeBand[]>(initialBands.length ? initialBands : [{ min: 0, max: 100, grade: "A" }]);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();

  const update = (idx: number, patch: Partial<GradeBand>) => {
    setBands((prev) => prev.map((b, i) => (i === idx ? { ...b, ...patch } : b)));
    setSaved(false);
  };

  const save = () => {
    setError(null);
    setSaved(false);
    startTransition(async () => {
      const res = await action(bands);
      if (res?.error) {
        setError(res.error);
        return;
      }
      setSaved(true);
    });
  };

  return (
    <div className="space-y-3">
      {error && <p className="rounded-lg border border-danger/30 bg-danger/10 px-4 py-2 text-sm text-danger">{error}</p>}
      {saved && <p className="rounded-lg border border-success/30 bg-success/10 px-4 py-2 text-sm text-success">Grading system saved.</p>}

      <div className="space-y-2">
        {bands
          .map((band, idx) => ({ band, idx }))
          .sort((a, b) => b.band.min - a.band.min)
          .map(({ band, idx }) => (
            <div key={idx} className="flex items-center gap-2">
              <input
                type="number"
                value={band.min}
                onChange={(e) => update(idx, { min: Number(e.target.value) })}
                className="w-20 rounded-lg border border-border bg-background px-2 py-2 text-sm outline-none focus:border-primary"
                aria-label="Minimum percentage"
              />
              <span className="text-sm text-muted">–</span>
              <input
                type="number"
                value={band.max}
                onChange={(e) => update(idx, { max: Number(e.target.value) })}
                className="w-20 rounded-lg border border-border bg-background px-2 py-2 text-sm outline-none focus:border-primary"
                aria-label="Maximum percentage"
              />
              <span className="text-sm text-muted">% →</span>
              <input
                value={band.grade}
                onChange={(e) => update(idx, { grade: e.target.value })}
                className="w-24 rounded-lg border border-border bg-background px-2 py-2 text-sm outline-none focus:border-primary"
                aria-label="Grade"
              />
              <button
                onClick={() => setBands((prev) => prev.filter((_, i) => i !== idx))}
                className="rounded-md p-1.5 text-muted hover:bg-background hover:text-danger"
                aria-label="Remove grade band"
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))}
      </div>

      <button
        onClick={() => setBands((prev) => [...prev, { min: 0, max: 0, grade: "" }])}
        className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm font-medium hover:bg-background"
      >
        <Plus size={15} /> Add Band
      </button>

      <div className="flex justify-end border-t border-border pt-4">
        <button
          onClick={save}
          disabled={pending}
          className="rounded-lg bg-primary px-5 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60"
        >
          {pending ? "Saving…" : "Save Grading System"}
        </button>
      </div>
    </div>
  );
}
