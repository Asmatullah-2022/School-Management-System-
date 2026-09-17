"use client";

import { useState, useTransition } from "react";
import type { SchoolClass, Section, Student } from "@/types/database";

const STEPS = ["Basic Info", "Guardian & Contact", "Academic Info"] as const;

function Field({
  label,
  name,
  type = "text",
  required,
  defaultValue,
  placeholder,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  defaultValue?: string | null;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium">
        {label}
        {required && <span className="text-danger"> *</span>}
      </span>
      <input
        name={name}
        type={type}
        required={required}
        defaultValue={defaultValue ?? ""}
        placeholder={placeholder}
        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
      />
    </label>
  );
}

export function StudentForm({
  action,
  classes,
  sections,
  defaultValues,
  submitLabel = "Save Student",
}: {
  action: (formData: FormData) => Promise<{ error?: string } | void>;
  classes: SchoolClass[];
  sections: Section[];
  defaultValues?: Partial<Student>;
  submitLabel?: string;
}) {
  const [step, setStep] = useState(0);
  const [selectedClass, setSelectedClass] = useState(defaultValues?.class_id ?? "");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const filteredSections = sections.filter((s) => s.class_id === selectedClass);

  return (
    <form
      action={(formData) => {
        startTransition(async () => {
          const res = await action(formData);
          if (res?.error) setError(res.error);
        });
      }}
      onKeyDown={(e) => {
        // Prevent Enter (e.g. confirming a <select> option) from submitting
        // the form before the final step is reached.
        if (e.key === "Enter" && step < STEPS.length - 1) {
          e.preventDefault();
        }
      }}
      className="space-y-6"
    >
      <div className="flex flex-wrap gap-2">
        {STEPS.map((label, idx) => (
          <button
            type="button"
            key={label}
            onClick={() => setStep(idx)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
              step === idx ? "bg-primary text-primary-foreground" : "bg-background text-muted"
            }`}
          >
            {idx + 1}. {label}
          </button>
        ))}
      </div>

      {error && (
        <p className="rounded-lg border border-danger/30 bg-danger/10 px-4 py-2 text-sm text-danger">{error}</p>
      )}

      <div className={step === 0 ? "grid grid-cols-1 gap-4 sm:grid-cols-2" : "hidden"}>
        <Field label="Full Name" name="full_name" required defaultValue={defaultValues?.full_name} />
        <Field label="Admission Number" name="admission_number" required defaultValue={defaultValues?.admission_number} />
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Gender</span>
          <select
            name="gender"
            defaultValue={defaultValues?.gender ?? ""}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
          >
            <option value="">Select</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </label>
        <Field label="Date of Birth" name="date_of_birth" type="date" defaultValue={defaultValues?.date_of_birth} />
        <Field label="B-Form / Registration Number" name="b_form_number" defaultValue={defaultValues?.b_form_number} />
        <Field label="Blood Group" name="blood_group" placeholder="e.g. O+" defaultValue={defaultValues?.blood_group} />
      </div>

      <div className={step === 1 ? "grid grid-cols-1 gap-4 sm:grid-cols-2" : "hidden"}>
        <Field label="Father's Name" name="father_name" defaultValue={defaultValues?.father_name} />
        <Field label="Mother's Name" name="mother_name" defaultValue={defaultValues?.mother_name} />
        <Field label="Contact Number" name="contact_number" defaultValue={defaultValues?.contact_number} />
        <Field label="Emergency Contact" name="emergency_contact" defaultValue={defaultValues?.emergency_contact} />
        <Field label="Address" name="address" defaultValue={defaultValues?.address} />
        <Field label="District" name="district" defaultValue={defaultValues?.district} />
        <Field label="Province" name="province" defaultValue={defaultValues?.province} />
        <Field label="Medical Information" name="medical_info" defaultValue={defaultValues?.medical_info} />
      </div>

      <div className={step === 2 ? "grid grid-cols-1 gap-4 sm:grid-cols-2" : "hidden"}>
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Class</span>
          <select
            name="class_id"
            defaultValue={defaultValues?.class_id ?? ""}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
          >
            <option value="">Select class</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Section</span>
          <select
            name="section_id"
            defaultValue={defaultValues?.section_id ?? ""}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
          >
            <option value="">Select section</option>
            {filteredSections.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </label>
        <Field label="Roll Number" name="roll_number" defaultValue={defaultValues?.roll_number} />
        <Field label="Admission Date" name="admission_date" type="date" defaultValue={defaultValues?.admission_date ?? new Date().toISOString().slice(0, 10)} />
        <Field label="Previous School" name="previous_school" defaultValue={defaultValues?.previous_school} />
      </div>

      <div className="flex items-center justify-between border-t border-border pt-4">
        <button
          type="button"
          disabled={step === 0}
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          className="rounded-lg border border-border px-4 py-2 text-sm disabled:opacity-40"
        >
          Back
        </button>
        {step < STEPS.length - 1 ? (
          <button
            type="button"
            onClick={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))}
            className="rounded-lg bg-primary px-5 py-2 text-sm font-medium text-primary-foreground"
          >
            Next
          </button>
        ) : (
          <button
            type="submit"
            disabled={pending}
            className="rounded-lg bg-primary px-5 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60"
          >
            {pending ? "Saving…" : submitLabel}
          </button>
        )}
      </div>
    </form>
  );
}
