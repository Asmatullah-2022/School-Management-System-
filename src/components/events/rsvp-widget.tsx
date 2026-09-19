"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import type { EventResponse, EventResponseKind } from "@/types/database";

export function RsvpWidget({
  eventId,
  mode,
  myResponse,
  action,
}: {
  eventId: string;
  mode: "rsvp" | "acknowledge";
  myResponse: EventResponse | undefined;
  action: (eventId: string, response: EventResponseKind) => Promise<void>;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const respond = (r: EventResponseKind) =>
    startTransition(async () => {
      await action(eventId, r);
      router.refresh();
    });

  if (mode === "acknowledge") {
    if (myResponse?.response === "acknowledged") {
      return (
        <p className="inline-flex items-center gap-1.5 rounded-lg bg-success/10 px-3 py-2 text-sm font-medium text-success">
          <CheckCircle2 size={15} /> Acknowledged
        </p>
      );
    }
    return (
      <button disabled={pending} onClick={() => respond("acknowledged")} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60">
        {pending ? "Saving…" : "Acknowledge"}
      </button>
    );
  }

  const options: { key: EventResponseKind; label: string }[] = [
    { key: "going", label: "Going" },
    { key: "maybe", label: "Maybe" },
    { key: "not_going", label: "Not Going" },
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => (
        <button
          key={o.key}
          disabled={pending}
          onClick={() => respond(o.key)}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition disabled:opacity-60 ${
            myResponse?.response === o.key ? "bg-primary text-primary-foreground" : "border border-border hover:bg-background"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
