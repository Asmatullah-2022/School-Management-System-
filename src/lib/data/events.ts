import "server-only";
import { isDemoMode } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import { demoStore } from "@/lib/demo/store";
import type { EventAttendanceRecord, EventRecord, EventResponse } from "@/types/database";

export async function getEvent(id: string): Promise<EventRecord | undefined> {
  if (isDemoMode()) return demoStore.getEvent(id);
  const supabase = await createClient();
  const { data, error } = await supabase.from("events").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return (data as EventRecord) ?? undefined;
}

export async function createEvent(input: Omit<EventRecord, "id" | "school_id"> & { schoolId: string }): Promise<EventRecord> {
  const { schoolId, ...rest } = input;
  if (isDemoMode()) return demoStore.createEvent(rest);
  const supabase = await createClient();
  const { data, error } = await supabase.from("events").insert({ school_id: schoolId, ...rest }).select().single();
  if (error) throw new Error(error.message);
  return data as EventRecord;
}

export async function updateEvent(id: string, data: Partial<EventRecord>): Promise<EventRecord | undefined> {
  if (isDemoMode()) return demoStore.updateEvent(id, data);
  const supabase = await createClient();
  const { data: row, error } = await supabase.from("events").update(data).eq("id", id).select().single();
  if (error) throw new Error(error.message);
  return row as EventRecord;
}

export async function listEventResponses(eventId?: string): Promise<EventResponse[]> {
  if (isDemoMode()) return demoStore.listEventResponses(eventId);
  const supabase = await createClient();
  let query = supabase.from("event_responses").select("*");
  if (eventId) query = query.eq("event_id", eventId);
  const { data, error } = await query;
  if (error) throw error;
  return data as EventResponse[];
}

/** The only sanctioned way to RSVP/acknowledge — always the caller's own
 * profile_id; RLS additionally rejects any attempt to record it against
 * someone else. */
export async function respondToEvent(eventId: string, profileId: string, schoolId: string, response: EventResponse["response"]): Promise<EventResponse> {
  if (isDemoMode()) return demoStore.respondToEvent(eventId, profileId, response);
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("event_responses")
    .upsert({ school_id: schoolId, event_id: eventId, profile_id: profileId, response, responded_at: new Date().toISOString() }, { onConflict: "event_id,profile_id" })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as EventResponse;
}

export async function listEventAttendance(eventId?: string): Promise<EventAttendanceRecord[]> {
  if (isDemoMode()) return demoStore.listEventAttendance(eventId);
  const supabase = await createClient();
  let query = supabase.from("event_attendance").select("*");
  if (eventId) query = query.eq("event_id", eventId);
  const { data, error } = await query;
  if (error) throw error;
  return data as EventAttendanceRecord[];
}

export async function recordEventAttendance(
  eventId: string,
  profileId: string,
  schoolId: string,
  status: EventAttendanceRecord["status"],
  recordedBy: string
): Promise<EventAttendanceRecord> {
  if (isDemoMode()) return demoStore.recordEventAttendance(eventId, profileId, status, recordedBy);
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("event_attendance")
    .upsert({ school_id: schoolId, event_id: eventId, profile_id: profileId, status, recorded_by: recordedBy, recorded_at: new Date().toISOString() }, { onConflict: "event_id,profile_id" })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as EventAttendanceRecord;
}
