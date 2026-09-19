"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import type { EventAttendanceRecord } from "@/types/database";

const STYLES: Record<string, string> = {
  expected: "bg-muted/10 text-muted",
  present: "bg-success/10 text-success",
  absent: "bg-danger/10 text-danger",
};

export function AttendanceRecorder({
  eventId,
  students,
  attendance,
  action,
}: {
  eventId: string;
  students: { id: string; name: string; profileId: string | null }[];
  attendance: EventAttendanceRecord[];
  action: (eventId: string, profileId: string, status: "present" | "absent") => Promise<{ error?: string } | void>;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const present = students.filter((s) => attendance.find((a) => a.profile_id === s.profileId)?.status === "present").length;
  const absent = students.filter((s) => attendance.find((a) => a.profile_id === s.profileId)?.status === "absent").length;

  const mark = (profileId: string, status: "present" | "absent") =>
    startTransition(async () => {
      await action(eventId, profileId, status);
      router.refresh();
    });

  return (
    <div>
      <p className="px-5 pt-3 text-xs text-muted">Expected: {students.length} · Present: {present} · Absent: {absent}</p>
      <ul className="divide-y divide-border">
        {students.map((s) => {
          const status = attendance.find((a) => a.profile_id === s.profileId)?.status ?? "expected";
          return (
            <li key={s.id} className="flex items-center justify-between px-5 py-2.5 text-sm">
              <span>{s.name}</span>
              <div className="flex items-center gap-2">
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${STYLES[status]}`}>{status}</span>
                {s.profileId && (
                  <>
                    <button disabled={pending} onClick={() => mark(s.profileId!, "present")} className="rounded-md border border-border px-2 py-1 text-xs hover:bg-background">Present</button>
                    <button disabled={pending} onClick={() => mark(s.profileId!, "absent")} className="rounded-md border border-border px-2 py-1 text-xs hover:bg-background">Absent</button>
                  </>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
