import "server-only";
import { isDemoMode } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import { demoStore } from "@/lib/demo/store";
import type {
  AttendanceRecord,
  EventRecord,
  HomeworkRecord,
  NoticeRecord,
} from "@/types/database";

export async function listAttendance(): Promise<AttendanceRecord[]> {
  if (isDemoMode()) return demoStore.listAttendance();
  const supabase = await createClient();
  const { data, error } = await supabase.from("attendance").select("*").order("date", { ascending: false });
  if (error) throw error;
  return data as AttendanceRecord[];
}

export async function markAttendance(records: AttendanceRecord[]): Promise<void> {
  if (isDemoMode()) return demoStore.markAttendance(records);
  const supabase = await createClient();
  const { error } = await supabase.from("attendance").upsert(records, { onConflict: "student_id,date" });
  if (error) throw error;
}

export async function listHomework(): Promise<HomeworkRecord[]> {
  if (isDemoMode()) return demoStore.listHomework();
  const supabase = await createClient();
  const { data, error } = await supabase.from("homework").select("*").order("due_date");
  if (error) throw error;
  return data as HomeworkRecord[];
}

export async function listNotices(): Promise<NoticeRecord[]> {
  if (isDemoMode()) return demoStore.listNotices();
  const supabase = await createClient();
  const { data, error } = await supabase.from("notices").select("*").order("publish_date", { ascending: false });
  if (error) throw error;
  return data as NoticeRecord[];
}

export async function listEvents(): Promise<EventRecord[]> {
  if (isDemoMode()) return demoStore.listEvents();
  const supabase = await createClient();
  const { data, error } = await supabase.from("events").select("*").order("start_date");
  if (error) throw error;
  return data as EventRecord[];
}
