import { GraduationCap } from "lucide-react";
import { isDemoMode } from "@/lib/supabase/env";
import { listDemoUsers } from "@/lib/auth/session";
import { loginAsDemoUser } from "@/lib/auth/actions";
import { roleLabels } from "@/lib/demo/data";
import { LoginForm } from "@/components/login-form";

export default function LoginPage() {
  const demoMode = isDemoMode();
  const demoUsers = demoMode ? listDemoUsers() : [];

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-3xl">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
            <GraduationCap size={26} />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">School Management System</h1>
          <p className="mt-1 text-sm text-muted">
            Government Model Primary School &middot; Academic Session 2025-2026
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm sm:p-8">
          {demoMode ? (
            <>
              <div className="mb-5 rounded-lg border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-warning">
                Demo mode: no Supabase project is configured, so the app runs on
                bundled sample data. Pick a role below to explore its dashboard.
                Configure <code>NEXT_PUBLIC_SUPABASE_URL</code> to switch to real accounts.
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {demoUsers.map((u) => (
                  <form key={u.profile.id} action={loginAsDemoUser.bind(null, u.profile.id)}>
                    <button
                      type="submit"
                      className="w-full rounded-xl border border-border bg-background px-4 py-3 text-left transition hover:border-primary hover:shadow-sm"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{u.label}</span>
                        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                          {roleLabels[u.profile.role]}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-muted">{u.description}</p>
                      <p className="mt-1 text-xs text-muted">{u.profile.full_name}</p>
                    </button>
                  </form>
                ))}
              </div>
            </>
          ) : (
            <LoginForm />
          )}
        </div>

        <p className="mt-6 text-center text-xs text-muted">
          Built for schools in Pakistan &middot; PKR &middot; English / اردو
        </p>
      </div>
    </div>
  );
}
