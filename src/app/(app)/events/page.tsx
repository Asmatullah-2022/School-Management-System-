import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus } from "lucide-react";
import { getSession, isSchoolAdmin } from "@/lib/auth/session";
import { listEvents } from "@/lib/data/records";
import { listStudents } from "@/lib/data/students";
import { getStudentIdForProfile, getChildStudentIdsForProfile } from "@/lib/data/people";
import { visibleEvents } from "@/lib/events/visibility";
import { classIdsForStudents } from "@/lib/notices/visibility";
import { EventCalendar } from "@/components/events/event-calendar";

export default async function EventsPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const allEvents = await listEvents();

  let classIds: string[] = [];
  if (session.profile.role === "student") {
    const id = await getStudentIdForProfile(session.profile.id);
    const student = id ? (await listStudents()).find((s) => s.id === id) : undefined;
    classIds = student?.class_id ? [student.class_id] : [];
  } else if (session.profile.role === "parent") {
    const childIds = await getChildStudentIdsForProfile(session.profile.id);
    const children = (await listStudents()).filter((s) => childIds.includes(s.id));
    classIds = classIdsForStudents(children);
  }

  const events = visibleEvents(allEvents, session.profile.role, classIds);
  const todayISO = new Date().toISOString().slice(0, 10);
  const upcoming = events.filter((e) => e.start_date >= todayISO).sort((a, b) => (a.start_date < b.start_date ? -1 : 1));
  const past = events.filter((e) => e.start_date < todayISO).sort((a, b) => (a.start_date < b.start_date ? 1 : -1));
  const isAdmin = isSchoolAdmin(session.profile.role);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Events & Calendar</h1>
          <p className="text-sm text-muted">{upcoming.length} upcoming, {past.length} past</p>
        </div>
        {isAdmin && (
          <Link
            href="/events/new"
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            <Plus size={15} /> Create Event
          </Link>
        )}
      </div>

      <EventCalendar upcoming={upcoming} past={past} />
    </div>
  );
}
