"use client";

import { useActionForm } from "@/lib/hooks/use-action-form";
import type { Student } from "@/types/database";

export function StudentProfileForm({
  student,
  action,
}: {
  student: Student;
  action: (formData: FormData) => Promise<{ error?: string } | void>;
}) {
  const { error, pending, handleSubmit } = useActionForm(action);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Contact Number</span>
          <input
            name="contact_number"
            defaultValue={student.contact_number ?? ""}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Emergency Contact</span>
          <input
            name="emergency_contact"
            defaultValue={student.emergency_contact ?? ""}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
          />
        </label>
        <label className="block sm:col-span-2">
          <span className="mb-1 block text-sm font-medium">Address</span>
          <input
            name="address"
            defaultValue={student.address ?? ""}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Blood Group</span>
          <input
            name="blood_group"
            defaultValue={student.blood_group ?? ""}
            placeholder="e.g. O+"
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
          />
        </label>
        <label className="block sm:col-span-2">
          <span className="mb-1 block text-sm font-medium">Medical Information</span>
          <textarea
            name="medical_info"
            defaultValue={student.medical_info ?? ""}
            rows={2}
            placeholder="Allergies, conditions, or medication the school should know about"
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
          />
        </label>
      </div>
      <p className="text-xs text-muted">
        Class, section, roll number, and admission details are managed by the school office and can&apos;t be changed here.
      </p>
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-60"
      >
        {pending ? "Saving…" : "Save Changes"}
      </button>
    </form>
  );
}
