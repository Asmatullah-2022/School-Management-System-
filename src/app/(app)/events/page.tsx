import { CalendarDays, MapPin } from "lucide-react";
import { listEvents } from "@/lib/data/records";
import { Card } from "@/components/ui/card";

export default async function EventsPage() {
  const events = await listEvents();

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold">Events & Calendar</h1>
        <p className="text-sm text-muted">{events.length} upcoming events</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {events.map((e) => (
          <Card key={e.id} className="p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-accent">
              <CalendarDays size={18} />
            </div>
            <h3 className="mt-3 text-sm font-semibold">{e.title}</h3>
            <p className="mt-1 text-sm text-muted">{e.description}</p>
            <div className="mt-3 space-y-1 text-xs text-muted">
              <p>{new Date(e.start_date).toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}</p>
              {e.location && (
                <p className="flex items-center gap-1">
                  <MapPin size={12} /> {e.location}
                </p>
              )}
            </div>
          </Card>
        ))}
        {events.length === 0 && <p className="text-sm text-muted">No events scheduled.</p>}
      </div>
    </div>
  );
}
