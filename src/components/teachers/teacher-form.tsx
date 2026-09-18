"use client";

import { useActionForm } from "@/lib/hooks/use-action-form";

function Field({
  label,
  name,
  type = "text",
  required,
  placeholder,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
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
        placeholder={placeholder}
        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
      />
    </label>
  );
}

export function TeacherForm({ action }: { action: (formData: FormData) => Promise<{ error?: string } | void> }) {
  const { error, pending, handleSubmit } = useActionForm(action);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <p className="rounded-lg border border-danger/30 bg-danger/10 px-4 py-2 text-sm text-danger">{error}</p>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Full Name" name="full_name" required />
        <Field label="Employee ID" name="employee_id" required />
        <Field label="Father's Name" name="father_name" />
        <Field label="CNIC" name="cnic" placeholder="XXXXX-XXXXXXX-X" />
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Gender</span>
          <select
            name="gender"
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
          >
            <option value="">Select</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </label>
        <Field label="Mobile" name="mobile" />
        <Field label="Email" name="email" type="email" />
        <Field label="Designation" name="designation" placeholder="e.g. Senior Teacher" />
        <Field label="Qualification" name="qualification" />
        <Field label="Joining Date" name="joining_date" type="date" />
        <Field label="Address" name="address" />
      </div>

      <div className="flex justify-end border-t border-border pt-4">
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-primary px-5 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60"
        >
          {pending ? "Saving…" : "Save Teacher"}
        </button>
      </div>
    </form>
  );
}
