import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  CalendarDays,
  ClipboardCheck,
  FileText,
  NotebookPen,
  Wallet,
  UserRound,
  Library,
  Bus,
  Boxes,
  Award,
  Megaphone,
  CalendarClock,
  BarChart3,
  ShieldCheck,
  Settings,
} from "lucide-react";
import type { UserRole } from "@/types/database";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  roles: UserRole[];
  status: "ready" | "planned";
  phase?: string;
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

const ALL: UserRole[] = ["super_admin", "school_admin", "teacher", "accountant", "parent", "student"];
const STAFF: UserRole[] = ["super_admin", "school_admin", "teacher", "accountant"];
const ADMIN: UserRole[] = ["super_admin", "school_admin"];

export const navSections: NavSection[] = [
  {
    title: "",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, roles: ALL, status: "ready" },
    ],
  },
  {
    title: "Students",
    items: [
      { label: "All Students", href: "/students", icon: Users, roles: [...ADMIN, "teacher", "accountant"], status: "ready" },
      { label: "Add Student", href: "/students/new", icon: Users, roles: ADMIN, status: "ready" },
      { label: "Student Promotion", href: "/modules/promotion", icon: Users, roles: ADMIN, status: "planned", phase: "Phase 5" },
    ],
  },
  {
    title: "Teachers & Staff",
    items: [
      { label: "Teachers", href: "/teachers", icon: GraduationCap, roles: ADMIN, status: "ready" },
      { label: "Staff", href: "/modules/staff", icon: GraduationCap, roles: ADMIN, status: "planned", phase: "Phase 2" },
    ],
  },
  {
    title: "Academics",
    items: [
      { label: "Classes & Sections", href: "/classes", icon: BookOpen, roles: ADMIN, status: "ready" },
      { label: "Subjects", href: "/academics/subjects", icon: BookOpen, roles: [...ADMIN, "teacher"], status: "ready" },
      { label: "Subject Assignments", href: "/academics/assignments", icon: BookOpen, roles: ADMIN, status: "ready" },
      { label: "Periods", href: "/academics/periods", icon: CalendarClock, roles: ADMIN, status: "ready" },
      { label: "Timetable", href: "/timetable", icon: CalendarClock, roles: ALL, status: "ready" },
    ],
  },
  {
    title: "Attendance",
    items: [
      { label: "Daily Attendance", href: "/attendance", icon: ClipboardCheck, roles: [...ADMIN, "teacher"], status: "ready" },
      { label: "Attendance Analytics", href: "/modules/attendance-analytics", icon: ClipboardCheck, roles: ADMIN, status: "planned", phase: "Phase 3" },
    ],
  },
  {
    title: "Examinations",
    items: [
      { label: "Exams & Marks", href: "/modules/exams", icon: NotebookPen, roles: [...ADMIN, "teacher"], status: "planned", phase: "Phase 4" },
      { label: "Results", href: "/modules/results", icon: FileText, roles: ALL, status: "planned", phase: "Phase 4" },
    ],
  },
  {
    title: "",
    items: [
      { label: "Homework", href: "/homework", icon: NotebookPen, roles: ALL, status: "ready" },
    ],
  },
  {
    title: "Fees & Finance",
    items: [
      { label: "Fees & Payments", href: "/fees", icon: Wallet, roles: [...ADMIN, "accountant", "parent", "student"], status: "ready" },
    ],
  },
  {
    title: "",
    items: [
      { label: "Parents", href: "/modules/parents", icon: UserRound, roles: ADMIN, status: "planned", phase: "Phase 5" },
      { label: "Library", href: "/modules/library", icon: Library, roles: STAFF, status: "planned", phase: "Phase 7" },
      { label: "Transport", href: "/modules/transport", icon: Bus, roles: STAFF, status: "planned", phase: "Phase 7" },
      { label: "Inventory", href: "/modules/inventory", icon: Boxes, roles: ADMIN, status: "planned", phase: "Phase 7" },
      { label: "Certificates", href: "/modules/certificates", icon: Award, roles: ADMIN, status: "planned", phase: "Phase 8" },
      { label: "Notices", href: "/notices", icon: Megaphone, roles: ALL, status: "ready" },
      { label: "Events", href: "/events", icon: CalendarDays, roles: ALL, status: "ready" },
      { label: "Reports", href: "/modules/reports", icon: BarChart3, roles: ADMIN, status: "planned", phase: "Phase 8" },
    ],
  },
  {
    title: "Administration",
    items: [
      { label: "Users & Roles", href: "/modules/users", icon: ShieldCheck, roles: ADMIN, status: "planned", phase: "Phase 9" },
      { label: "Settings", href: "/settings", icon: Settings, roles: ADMIN, status: "ready" },
    ],
  },
];

export function navForRole(role: UserRole): NavSection[] {
  return navSections
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => item.roles.includes(role)),
    }))
    .filter((section) => section.items.length > 0);
}
