"use client";

import type { Exam } from "@/types/database";
import { useActionForm } from "@/lib/hooks/use-action-form";

const EXAM_TYPES: { value: Exam["exam_type"]; label: string }[] = [
  { value: "monthly_test", label: "Monthly Test" },
  { value: "unit_test", label: "Unit Test" },
  { value: "mid_term", label: "Mid-Term" },
  { value: "first_semester", label: "First Semester" },
  { value: "second_semester", label: "Second Semester" },
  { value: "annual", label: "Annual" },
  { value: "custom", label: "Custom" },
];

const STATUS_OPTIONS: Exam["status"][] = ["draft", "scheduled", "ongoing", "completed"];

export function ExamForm({
  action,
  defaultValues,
  submitLabel = "Save Exam",
  showStatus = false,
}: {
  action: (formData: FormData) => Promise<{ error?: string } | void>;
  defaultValues?: Partial<Exam>;
  submitLabel?: string;
  showStatus?: boolean;
}) {
  const { error, pending, handleSubmit } = useActionForm(action);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <p className="rounded-lg border border-danger/30 bg-danger/10 px-4 py-2 text-sm text-danger">{error}</p>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="block">
            <span className="mb-1 block text-sm font-medium">
              Exam Name <span className="text-danger">*</span>
            </span>
            <input
              name="name"
              required
              placeholder="e.g. Mid-Term Examination"
              defaultValue={defaultValues?.name}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
            />
          </label>
        </div>
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Exam Type</span>
          <select
            name="exam_type"
            defaultValue={defaultValues?.exam_type ?? "monthly_test"}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
          >
            {EXAM_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </label>
        {showStatus && (
          <label className="block">
            <span className="mb-1 block text-sm font-medium">Status</span>
            <select
              name="status"
              defaultValue={defaultValues?.status ?? "draft"}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s} className="capitalize">
                  {s}
                </option>
              ))}
            </select>
          </label>
        )}
        <label className="block">
          <span className="mb-1 block text-sm font-medium">
            Start Date <span className="text-danger">*</span>
          </span>
          <input
            name="start_date"
            type="date"
            required
            defaultValue={defaultValues?.start_date}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium">
            End Date <span className="text-danger">*</span>
          </span>
          <input
            name="end_date"
            type="date"
            required
            defaultValue={defaultValues?.end_date}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
          />
        </label>
      </div>

      <div className="flex justify-end border-t border-border pt-4">
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-primary px-5 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60"
        >
          {pending ? "Saving…" : submitLabel}
        </button>
      </div>
    </form>
  );
}
