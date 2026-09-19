import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, CalendarClock, MapPin, User, Paperclip, Users } from "lucide-react";
import { getSession, isSchoolAdmin, isSchoolStaff } from "@/lib/auth/session";
import { getEvent, listEventResponses, listEventAttendance } from "@/lib/data/events";
import { listStudents } from "@/lib/data/students";
import { getStudentIdForProfile, getChildStudentIdsForProfile } from "@/lib/data/people";
import { listClasses, listSections } from "@/lib/data/academics";
import { visibleEvents } from "@/lib/events/visibility";
import { classIdsForStudents } from "@/lib/notices/visibility";
import { Card, CardHeader, EmptyState } from "@/components/ui/card";
import { RsvpWidget } from "@/components/events/rsvp-widget";
import { AttendanceRecorder } from "@/components/events/attendance-recorder";
import { respondToEventAction, updateEventStatusAction, recordEventAttendanceAction } from "../actions";

const TYPE_LABELS: Record<string, string> = {
  academic: "Academic", sports: "Sports", parent_meeting: "Parent Meeting", holiday: "Holiday",
  training: "Training", competition: "Competition", school_function: "School Function", meeting: "Meeting", other: "Other",
};

export default async function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) redirect("/login");

  const { id } = await params;
  const event = await getEvent(id);
  if (!event) notFound();

  let classIds: string[] = [];
  if (session.profile.role === "student") {
    const sid = await getStudentIdForProfile(session.profile.id);
    const student = sid ? (await listStudents()).find((s) => s.id === sid) : undefined;
    classIds = student?.class_id ? [student.class_id] : [];
  } else if (session.profile.role === "parent") {
    const childIds = await getChildStudentIdsForProfile(session.profile.id);
    const children = (await listStudents()).filter((s) => childIds.includes(s.id));
    classIds = classIdsForStudents(children);
  }
  if (visibleEvents([event], session.profile.role, classIds).length === 0) notFound();

  const [responses, classes, sections] = await Promise.all([listEventResponses(id), listClasses(), listSections()]);
  const myResponse = responses.find((r) => r.profile_id === session.profile.id);
  const isAdmin = isSchoolAdmin(session.profile.role);
  const responseMode = event.response_mode ?? "none";

  const responseCounts = responses.reduce<Record<string, number>>((acc, r) => {
    acc[r.response] = (acc[r.response] ?? 0) + 1;
    return acc;
  }, {});

  let attendanceSection = null;
  if (isSchoolStaff(session.profile.role) && event.track_attendance && event.class_id) {
    const [students, attendance] = await Promise.all([listStudents(), listEventAttendance(id)]);
    const enrolled = students.filter((s) => s.class_id === event.class_id && (!event.section_id || s.section_id === event.section_id));
    attendanceSection = (
      <Card>
        <CardHeader title="Attendance" />
        {enrolled.length === 0 ? (
          <EmptyState label="No students enrolled in this class/section." />
        ) : (
          <AttendanceRecorder
            eventId={id}
            students={enrolled.map((s) => ({ id: s.id, name: s.full_name, profileId: s.profile_id ?? null }))}
            attendance={attendance}
            action={recordEventAttendanceAction}
          />
        )}
      </Card>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <Link href="/events" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-primary">
        <ArrowLeft size={15} /> Back to Events
      </Link>

      <Card>
        <div className="p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <span className="rounded-full bg-accent/10 px-2 py-0.5 text-xs font-medium text-accent">{TYPE_LABELS[event.event_type ?? "other"]}</span>
              <h1 className="mt-2 text-lg font-semibold">{event.title}</h1>
            </div>
            {event.status && event.status !== "scheduled" && (
              <span className="rounded-full bg-muted/10 px-2 py-0.5 text-xs font-medium capitalize text-muted">{event.status}</span>
            )}
          </div>
          {event.description && <p className="mt-2 text-sm text-muted">{event.description}</p>}

          <div className="mt-4 space-y-2 text-sm">
            <p className="flex items-center gap-2"><CalendarClock size={15} className="text-muted" /> {new Date(event.start_date).toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}{event.start_time ? ` · ${event.start_time}${event.end_time ? ` – ${event.end_time}` : ""}` : ""}</p>
            {event.location && <p className="flex items-center gap-2"><MapPin size={15} className="text-muted" /> {event.location}</p>}
            {event.organizer && <p className="flex items-center gap-2"><User size={15} className="text-muted" /> {event.organizer}</p>}
            {event.attachment_url && (
              <a href={event.attachment_url} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-primary hover:underline">
                <Paperclip size={15} /> View attachment
              </a>
            )}
            <p className="flex items-center gap-2 text-muted"><Users size={15} /> Audience: {event.audience === "class" ? `${classes.find((c) => c.id === event.class_id)?.name ?? ""}${event.section_id ? " - " + sections.find((s) => s.id === event.section_id)?.name : ""}` : event.audience}</p>
          </div>

          {isAdmin && (
            <div className="mt-4 flex gap-2 border-t border-border pt-4">
              {event.status !== "cancelled" && event.status !== "completed" && (
                <form action={updateEventStatusAction.bind(null, id, "cancelled")}>
                  <button type="submit" className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-danger hover:bg-background">Cancel Event</button>
                </form>
              )}
              {event.status === "scheduled" && new Date(event.start_date) < new Date() && (
                <form action={updateEventStatusAction.bind(null, id, "completed")}>
                  <button type="submit" className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:bg-background">Mark Completed</button>
                </form>
              )}
            </div>
          )}
        </div>
      </Card>

      {responseMode !== "none" && (
        <Card>
          <CardHeader title={responseMode === "rsvp" ? "RSVP" : "Acknowledge"} />
          <div className="p-5">
            <RsvpWidget eventId={id} mode={responseMode} myResponse={myResponse} action={respondToEventAction} />
          </div>
        </Card>
      )}

      {isAdmin && responseMode !== "none" && (
        <Card>
          <CardHeader title="Responses" />
          <div className="flex flex-wrap gap-3 p-5 text-sm">
            {Object.entries(responseCounts).length === 0 ? (
              <EmptyState label="No responses yet." />
            ) : (
              Object.entries(responseCounts).map(([key, count]) => (
                <div key={key} className="rounded-lg border border-border px-3 py-2 capitalize">
                  {key.replace("_", " ")}: <span className="font-semibold">{count}</span>
                </div>
              ))
            )}
          </div>
        </Card>
      )}

      {attendanceSection}
    </div>
  );
}
