"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSession, isSchoolAdmin, isSchoolStaff } from "@/lib/auth/session";
import { createEvent, updateEvent, respondToEvent, recordEventAttendance } from "@/lib/data/events";
import { listStudents } from "@/lib/data/students";
import { listTeachers } from "@/lib/data/teachers";
import { getGuardianProfileIdsForStudent } from "@/lib/data/people";
import { createNotificationForUser } from "@/lib/notifications/create";
import type { EventRecord, EventResponse } from "@/types/database";

export async function createEventAction(formData: FormData): Promise<{ error?: string } | void> {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!isSchoolAdmin(session.profile.role)) return { error: "Only administrators can create events." };

  const title = String(formData.get("title") ?? "").trim();
  const startDate = String(formData.get("start_date") ?? "");
  if (!title) return { error: "Title is required." };
  if (!startDate) return { error: "Start date is required." };

  const audience = String(formData.get("audience") ?? "all") as EventRecord["audience"];
  const classId = String(formData.get("class_id") ?? "") || null;
  const sectionId = String(formData.get("section_id") ?? "") || null;

  let event;
  try {
    event = await createEvent({
      schoolId: session.school.id,
      title,
      description: String(formData.get("description") ?? "").trim() || null,
      event_type: (String(formData.get("event_type") ?? "other")) as EventRecord["event_type"],
      start_date: startDate,
      end_date: String(formData.get("end_date") ?? "") || null,
      start_time: String(formData.get("start_time") ?? "") || null,
      end_time: String(formData.get("end_time") ?? "") || null,
      location: String(formData.get("location") ?? "").trim() || null,
      organizer: String(formData.get("organizer") ?? "").trim() || null,
      attachment_url: String(formData.get("attachment_url") ?? "").trim() || null,
      audience,
      class_id: audience === "class" ? classId : null,
      section_id: audience === "class" ? sectionId : null,
      status: "scheduled",
      response_mode: (String(formData.get("response_mode") ?? "none")) as EventRecord["response_mode"],
      track_attendance: formData.get("track_attendance") === "on",
      created_by: session.profile.id,
    });
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Could not create event." };
  }

  await notifyEventCreated(event, session.school.id);

  revalidatePath("/events");
  redirect(`/events/${event.id}`);
}

export async function updateEventStatusAction(id: string, status: EventRecord["status"]): Promise<void> {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!isSchoolAdmin(session.profile.role)) return;
  await updateEvent(id, { status });
  revalidatePath("/events");
  revalidatePath(`/events/${id}`);
}

export async function respondToEventAction(eventId: string, response: EventResponse["response"]): Promise<void> {
  const session = await getSession();
  if (!session) redirect("/login");
  await respondToEvent(eventId, session.profile.id, session.school.id, response);
  revalidatePath(`/events/${eventId}`);
}

export async function recordEventAttendanceAction(eventId: string, profileId: string, status: "present" | "absent"): Promise<void> {
  const session = await getSession();
  if (!session || !isSchoolStaff(session.profile.role)) return;
  await recordEventAttendance(eventId, profileId, session.school.id, status, session.profile.id);
  revalidatePath(`/events/${eventId}`);
}

async function notifyEventCreated(event: EventRecord, schoolId: string) {
  const recipients = new Set<string>();

  if (event.audience === "class" && event.class_id) {
    const students = (await listStudents()).filter((s) => s.class_id === event.class_id && (!event.section_id || s.section_id === event.section_id));
    for (const student of students) {
      for (const profileId of await getGuardianProfileIdsForStudent(student.id)) recipients.add(profileId);
    }
  } else if (event.audience === "students" || event.audience === "all") {
    for (const student of await listStudents()) {
      const own = student.profile_id;
      if (own) recipients.add(own);
    }
  }
  if (event.audience === "teachers" || event.audience === "all") {
    for (const teacher of await listTeachers()) {
      if (teacher.profile_id) recipients.add(teacher.profile_id);
    }
  }
  if (event.audience === "parents" || event.audience === "all") {
    for (const student of await listStudents()) {
      for (const profileId of await getGuardianProfileIdsForStudent(student.id)) recipients.add(profileId);
    }
  }

  for (const profileId of recipients) {
    await createNotificationForUser(profileId, schoolId, {
      title: "New School Event",
      message: `"${event.title}" — ${new Date(event.start_date).toLocaleDateString()}${event.location ? ` at ${event.location}` : ""}.`,
      link: `/events/${event.id}`,
      category: "events",
    });
  }
}
