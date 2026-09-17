"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { isDemoMode } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import { findDemoUser } from "@/lib/demo/data";
import { DEMO_SESSION_COOKIE } from "./session";

export async function loginAsDemoUser(profileId: string) {
  if (!isDemoMode()) throw new Error("Demo login is disabled when Supabase is configured.");
  if (!findDemoUser(profileId)) throw new Error("Unknown demo user.");

  const cookieStore = await cookies();
  cookieStore.set(DEMO_SESSION_COOKIE, profileId, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  redirect("/dashboard");
}

export async function loginWithPassword(formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  if (!email || !password) return { error: "Email and password are required." };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: error.message };

  redirect("/dashboard");
}

export async function logout() {
  if (isDemoMode()) {
    const cookieStore = await cookies();
    cookieStore.delete(DEMO_SESSION_COOKIE);
  } else {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }
  redirect("/login");
}
