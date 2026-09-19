import { redirect } from "next/navigation";
import { getSession, isSchoolAdmin } from "@/lib/auth/session";
import { listClasses, listSections } from "@/lib/data/academics";
import { Card } from "@/components/ui/card";
import { EventForm } from "@/components/events/event-form";
import { createEventAction } from "../actions";

export default async function NewEventPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!isSchoolAdmin(session.profile.role)) redirect("/events");

  const [classes, sections] = await Promise.all([listClasses(), listSections()]);

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div>
        <h1 className="text-xl font-semibold">Create Event</h1>
        <p className="text-sm text-muted">Targeted users will be notified once the event is created.</p>
      </div>
      <Card className="p-5 sm:p-6">
        <EventForm classes={classes} sections={sections} action={createEventAction} />
      </Card>
    </div>
  );
}
