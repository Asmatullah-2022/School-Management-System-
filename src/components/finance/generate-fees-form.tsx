"use client";

import { useState, useTransition } from "react";
import type { FeeStructure, SchoolClass, Section, Student } from "@/types/database";

export function GenerateFeesForm({
  structures,
  classes,
  sections,
  students,
  action,
}: {
  structures: FeeStructure[];
  classes: SchoolClass[];
  sections: Section[];
  students: Student[];
  action: (formData: FormData) => Promise<{ error?: string; success?: string }>;
}) {
  const [scope, setScope] = useState("school");
  const [selectedClass, setSelectedClass] = useState("");
  const [structureId, setStructureId] = useState(structures[0]?.id ?? "");
  const [result, setResult] = useState<{ error?: string; success?: string } | null>(null);
  const [pending, startTransition] = useTransition();

  const structure = structures.find((s) => s.id === structureId);
  const needsPeriod = structure?.frequency === "monthly" || structure?.frequency === "quarterly";
  const filteredSections = sections.filter((sec) => !selectedClass || sec.class_id === selectedClass);
  const today = new Date();

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setResult(null);
        const formData = new FormData(e.currentTarget);
        startTransition(async () => setResult(await action(formData)));
      }}
      className="space-y-4"
    >
      {result?.error && <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">{result.error}</p>}
      {result?.success && <p className="rounded-lg bg-success/10 px-3 py-2 text-sm text-success">{result.success}</p>}

      <div>
        <label className="mb-1 block text-sm font-medium">Fee Structure</label>
        <select
          name="fee_structure_id"
          value={structureId}
          onChange={(e) => setStructureId(e.target.value)}
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
        >
          {structures
            .filter((s) => s.is_active)
            .map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} — PKR {s.amount.toLocaleString()} ({s.frequency.replace("_", " ")})
              </option>
            ))}
        </select>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Generate for</label>
        <select
          name="scope"
          value={scope}
          onChange={(e) => setScope(e.target.value)}
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
        >
          <option value="school">Entire school</option>
          <option value="class">A specific class</option>
          <option value="section">A specific section</option>
          <option value="student">One student</option>
        </select>
      </div>

      {scope === "class" && (
        <div>
          <label className="mb-1 block text-sm font-medium">Class</label>
          <select name="class_id" required onChange={(e) => setSelectedClass(e.target.value)} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary">
            <option value="">Select class</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      )}

      {scope === "section" && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-sm font-medium">Class</label>
            <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary">
              <option value="">All</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Section</label>
            <select name="section_id" required className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary">
              <option value="">Select section</option>
              {filteredSections.map((sec) => (
                <option key={sec.id} value={sec.id}>
                  {classes.find((c) => c.id === sec.class_id)?.name} - {sec.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {scope === "student" && (
        <div>
          <label className="mb-1 block text-sm font-medium">Student</label>
          <select name="student_id" required className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary">
            <option value="">Select student</option>
            {students.map((s) => (
              <option key={s.id} value={s.id}>
                {s.full_name} ({s.admission_number})
              </option>
            ))}
          </select>
        </div>
      )}

      {needsPeriod && (
        <div className="rounded-lg border border-border p-3">
          <label className="mb-2 flex items-center gap-2 text-sm font-medium">
            <input type="checkbox" name="use_period" defaultChecked className="rounded" /> Tag this charge to a billing period (prevents duplicate generation for the same month)
          </label>
          <div className="grid grid-cols-2 gap-3">
            <select name="month" defaultValue={today.getMonth() + 1} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary">
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                <option key={m} value={m}>
                  {new Date(2000, m - 1, 1).toLocaleString("en", { month: "long" })}
                </option>
              ))}
            </select>
            <input type="number" name="year" defaultValue={today.getFullYear()} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
          </div>
        </div>
      )}

      <div>
        <label className="mb-1 block text-sm font-medium">Due Date</label>
        <input
          name="due_date"
          type="date"
          required
          defaultValue={today.toISOString().slice(0, 10)}
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
        />
      </div>

      <button type="submit" disabled={pending} className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-60 sm:w-auto">
        {pending ? "Generating…" : "Generate Fee Charges"}
      </button>
    </form>
  );
}
