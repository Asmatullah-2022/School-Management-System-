"use client";

import { useState } from "react";
import { useActionForm } from "@/lib/hooks/use-action-form";
import type { SchoolClass, Section } from "@/types/database";

const EVENT_TYPES = ["academic", "sports", "parent_meeting", "holiday", "training", "competition", "school_function", "meeting", "other"];

export function EventForm({
  classes,
  sections,
  action,
}: {
  classes: SchoolClass[];
  sections: Section[];
  action: (formData: FormData) => Promise<{ error?: string } | void>;
}) {
  const { error, pending, handleSubmit } = useActionForm(action);
  const [audience, setAudience] = useState("all");
  const [classId, setClassId] = useState("");

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>}

      <label className="block">
        <span className="mb-1 block text-sm font-medium">Title</span>
        <input name="title" required className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
      </label>

      <label className="block">
        <span className="mb-1 block text-sm font-medium">Description</span>
        <textarea name="description" rows={2} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
      </label>

      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Event Type</span>
          <select name="event_type" defaultValue="school_function" className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary">
            {EVENT_TYPES.map((t) => (
              <option key={t} value={t}>{t.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase())}</option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Location</span>
          <input name="location" className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
        </label>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Date</span>
          <input name="start_date" type="date" required className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Organizer</span>
          <input name="organizer" className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
        </label>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Start Time</span>
          <input name="start_time" type="time" className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium">End Time</span>
          <input name="end_time" type="time" className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
        </label>
      </div>

      <label className="block">
        <span className="mb-1 block text-sm font-medium">Attachment Link (optional)</span>
        <input name="attachment_url" placeholder="https://…" className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
      </label>

      <div>
        <label className="mb-1 block text-sm font-medium">Target Audience</label>
        <select name="audience" value={audience} onChange={(e) => setAudience(e.target.value)} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary">
          <option value="all">All users</option>
          <option value="teachers">Teachers only</option>
          <option value="students">Students only</option>
          <option value="parents">Parents only</option>
          <option value="class">Specific class/section</option>
        </select>
      </div>

      {audience === "class" && (
        <div className="grid grid-cols-2 gap-3">
          <select name="class_id" required value={classId} onChange={(e) => setClassId(e.target.value)} className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary">
            <option value="">Select class</option>
            {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <select name="section_id" className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary">
            <option value="">All sections</option>
            {sections.filter((s) => s.class_id === classId).map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
      )}

      <div>
        <label className="mb-1 block text-sm font-medium">Response Type</label>
        <select name="response_mode" defaultValue="none" className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary">
          <option value="none">None</option>
          <option value="rsvp">RSVP (Going / Not Going / Maybe)</option>
          <option value="acknowledge">Acknowledge only</option>
        </select>
      </div>

      <label className="flex items-center gap-2">
        <input type="checkbox" name="track_attendance" className="h-4 w-4 rounded border-border" />
        <span className="text-sm font-medium">Track attendance for this event</span>
      </label>

      <button type="submit" disabled={pending} className="rounded-lg bg-primary px-5 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60">
        {pending ? "Creating…" : "Create Event"}
      </button>
    </form>
  );
}
