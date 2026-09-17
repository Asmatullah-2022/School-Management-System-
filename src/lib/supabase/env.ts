export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/**
 * Demo mode runs the whole app off bundled sample data instead of a real
 * Supabase project, so the product can be explored/tested without any
 * database setup. It activates automatically when Supabase credentials are
 * absent, unless NEXT_PUBLIC_DEMO_MODE=false forces real Supabase usage.
 */
export function isDemoMode(): boolean {
  const forced = process.env.NEXT_PUBLIC_DEMO_MODE;
  if (forced === "false") return false;
  if (forced === "true") return true;
  return !SUPABASE_URL || !SUPABASE_ANON_KEY;
}
