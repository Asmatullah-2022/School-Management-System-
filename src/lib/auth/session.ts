import "server-only";
import { cookies } from "next/headers";
import { isDemoMode } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import { demoUsers, findDemoUser } from "@/lib/demo/data";
import { demoStore } from "@/lib/demo/store";
import type { Profile, School } from "@/types/database";

export const DEMO_SESSION_COOKIE = "sms_demo_session";

export interface Session {
  profile: Profile;
  school: School;
}

/** Reads the current signed-in user (demo cookie or real Supabase session). */
export async function getSession(): Promise<Session | null> {
  if (isDemoMode()) {
    const cookieStore = await cookies();
    const profileId = cookieStore.get(DEMO_SESSION_COOKIE)?.value;
    if (!profileId) return null;
    const demoUser = findDemoUser(profileId);
    if (!demoUser) return null;
    return { profile: demoUser.profile, school: demoStore.getSchool() };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();
  if (!profile) return null;

  const { data: school } = await supabase
    .from("schools")
    .select("*")
    .eq("id", profile.school_id)
    .single();
  if (!school) return null;

  return { profile, school };
}

export function listDemoUsers() {
  return demoUsers;
}

export function isSchoolAdmin(role: Profile["role"]): boolean {
  return role === "super_admin" || role === "school_admin";
}
