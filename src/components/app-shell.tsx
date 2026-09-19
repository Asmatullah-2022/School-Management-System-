"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { GraduationCap, Menu, X } from "lucide-react";
import { navForRole } from "@/lib/nav";
import type { Profile, School } from "@/types/database";
import { roleLabels } from "@/lib/demo/data";
import { Topbar } from "@/components/topbar";

export function AppShell({
  profile,
  school,
  unreadCount = 0,
  children,
}: {
  profile: Profile;
  school: School;
  unreadCount?: number;
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const navSections = navForRole(profile.role);

  const sidebarContent = (
    <div className="flex h-full flex-col bg-sidebar-bg text-sidebar-foreground">
      <div className="flex items-center gap-2 px-5 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <GraduationCap size={20} />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-white">{school.name}</p>
          <p className="text-xs text-sidebar-foreground/70">{school.school_code}</p>
        </div>
      </div>

      <nav className="flex-1 space-y-5 overflow-y-auto px-3 pb-6">
        {navSections.map((section, idx) => (
          <div key={section.title || idx}>
            {section.title && (
              <p className="mb-1.5 px-2 text-[11px] font-semibold uppercase tracking-wider text-sidebar-foreground/50">
                {section.title}
              </p>
            )}
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const active = pathname === item.href || pathname.startsWith(item.href + "/");
                const Icon = item.icon;
                return (
                  <li key={`${item.href}-${item.label}`}>
                    <Link
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-sm transition ${
                        active
                          ? "bg-primary text-primary-foreground"
                          : "text-sidebar-foreground hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      <span className="flex min-w-0 items-center gap-2.5">
                        <Icon size={16} className="shrink-0" />
                        <span className="truncate">{item.label}</span>
                      </span>
                      {item.status === "planned" && (
                        <span className="shrink-0 rounded-full bg-white/10 px-1.5 py-0.5 text-[10px] text-sidebar-foreground/70">
                          {item.phase ?? "Soon"}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
    </div>
  );

  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-64 shrink-0 lg:block">{sidebarContent}</aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-72">
            <div className="relative h-full">
              <button
                className="absolute right-3 top-3 rounded-md p-1.5 text-white/80 hover:bg-white/10"
                onClick={() => setMobileOpen(false)}
                aria-label="Close menu"
              >
                <X size={18} />
              </button>
              {sidebarContent}
            </div>
          </div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar profile={profile} roleLabel={roleLabels[profile.role]} unreadCount={unreadCount} onMenuClick={() => setMobileOpen(true)} />
        <main className="flex-1 overflow-x-hidden px-4 py-5 sm:px-6 lg:px-8">{children}</main>
      </div>

      <button
        className="fixed bottom-4 right-4 z-30 flex h-11 w-11 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg lg:hidden"
        onClick={() => setMobileOpen(true)}
        aria-label="Open menu"
      >
        <Menu size={20} />
      </button>
    </div>
  );
}
