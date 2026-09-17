"use client";

import { Bell, LogOut, Menu, Search, Sun, Moon } from "lucide-react";
import { useTheme } from "@/lib/use-theme";
import { logout } from "@/lib/auth/actions";
import type { Profile } from "@/types/database";

export function Topbar({
  profile,
  roleLabel,
  onMenuClick,
}: {
  profile: Profile;
  roleLabel: string;
  onMenuClick: () => void;
}) {
  const { isDark, toggle } = useTheme();

  return (
    <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-border bg-surface/95 px-4 py-3 backdrop-blur sm:px-6">
      <button
        className="rounded-md p-1.5 hover:bg-background lg:hidden"
        onClick={onMenuClick}
        aria-label="Open menu"
      >
        <Menu size={20} />
      </button>

      <div className="relative hidden max-w-sm flex-1 sm:block">
        <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
        <input
          type="search"
          placeholder="Search students, teachers, classes…"
          className="w-full rounded-lg border border-border bg-background py-2 pl-9 pr-3 text-sm outline-none focus:border-primary"
        />
      </div>

      <div className="ml-auto flex items-center gap-1.5 sm:gap-3">
        <button
          aria-label="Toggle dark mode"
          className="rounded-lg p-2 hover:bg-background"
          onClick={toggle}
        >
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <button aria-label="Notifications" className="relative rounded-lg p-2 hover:bg-background">
          <Bell size={18} />
          <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-danger" />
        </button>

        <div className="hidden items-center gap-2 border-l border-border pl-3 sm:flex">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
            {profile.full_name.charAt(0)}
          </div>
          <div className="leading-tight">
            <p className="text-sm font-medium">{profile.full_name}</p>
            <p className="text-xs text-muted">{roleLabel}</p>
          </div>
        </div>

        <form action={logout}>
          <button
            type="submit"
            aria-label="Log out"
            className="rounded-lg p-2 text-muted hover:bg-background hover:text-danger"
          >
            <LogOut size={18} />
          </button>
        </form>
      </div>
    </header>
  );
}
