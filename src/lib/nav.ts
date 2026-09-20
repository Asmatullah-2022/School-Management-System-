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
  Bell,
  UserCircle,
  CalendarOff,
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
      { label: "Student Promotion", href: "/modules/promotion", icon: Users, roles: ADMIN, status: "planned", phase: "Phase 9" },
      { label: "My Children", href: "/children", icon: Users, roles: ["parent"], status: "ready" },
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
      { label: "Attendance", href: "/attendance", icon: ClipboardCheck, roles: ["parent", "student"], status: "ready" },
      { label: "Attendance Analytics", href: "/modules/attendance-analytics", icon: ClipboardCheck, roles: ADMIN, status: "planned", phase: "Phase 3" },
    ],
  },
  {
    title: "Examinations",
    items: [
      { label: "Exams & Marks", href: "/exams", icon: NotebookPen, roles: [...ADMIN, "teacher"], status: "ready" },
      { label: "Exams", href: "/exams", icon: NotebookPen, roles: ["parent", "student"], status: "ready" },
      { label: "Results", href: "/results", icon: FileText, roles: ALL, status: "ready" },
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
      { label: "Finance Dashboard", href: "/fees", icon: Wallet, roles: [...ADMIN, "accountant"], status: "ready" },
      { label: "My Fees", href: "/fees", icon: Wallet, roles: ["parent", "student"], status: "ready" },
      { label: "Fee Structure", href: "/fees/structures", icon: Wallet, roles: [...ADMIN, "accountant"], status: "ready" },
      { label: "Generate Fees", href: "/fees/generate", icon: Wallet, roles: [...ADMIN, "accountant"], status: "ready" },
      { label: "Collect Payment", href: "/fees/collect", icon: Wallet, roles: [...ADMIN, "accountant"], status: "ready" },
      { label: "Payment History", href: "/fees/payments", icon: Wallet, roles: [...ADMIN, "accountant"], status: "ready" },
      { label: "Outstanding Fees", href: "/fees/outstanding", icon: Wallet, roles: [...ADMIN, "accountant"], status: "ready" },
      { label: "Discounts & Scholarships", href: "/fees/discounts", icon: Wallet, roles: [...ADMIN, "accountant"], status: "ready" },
      { label: "Refunds", href: "/fees/refunds", icon: Wallet, roles: [...ADMIN, "accountant"], status: "ready" },
      { label: "Finance Reports", href: "/fees/reports", icon: BarChart3, roles: [...ADMIN, "accountant"], status: "ready" },
    ],
  },
  {
    title: "",
    items: [
      { label: "Parents", href: "/modules/parents", icon: UserRound, roles: ADMIN, status: "planned", phase: "Phase 6" },
      { label: "Certificates", href: "/modules/certificates", icon: Award, roles: ADMIN, status: "planned", phase: "Phase 9" },
      { label: "Notices", href: "/notices", icon: Megaphone, roles: ALL, status: "ready" },
      { label: "Events", href: "/events", icon: CalendarDays, roles: ALL, status: "ready" },
      { label: "Reports", href: "/modules/reports", icon: BarChart3, roles: ADMIN, status: "planned", phase: "Phase 9" },
    ],
  },
  {
    title: "Library",
    items: [
      { label: "Library Dashboard", href: "/library", icon: Library, roles: STAFF, status: "ready" },
      { label: "My Library", href: "/library", icon: Library, roles: ["parent", "student"], status: "ready" },
      { label: "Books", href: "/library/books", icon: Library, roles: STAFF, status: "ready" },
      { label: "Categories", href: "/library/categories", icon: Library, roles: ADMIN, status: "ready" },
      { label: "Circulation", href: "/library/circulation", icon: Library, roles: STAFF, status: "ready" },
      { label: "Library Reports", href: "/library/reports", icon: BarChart3, roles: STAFF, status: "ready" },
      { label: "Library Settings", href: "/library/settings", icon: Settings, roles: ADMIN, status: "ready" },
    ],
  },
  {
    title: "Transport",
    items: [
      { label: "Transport Dashboard", href: "/transport", icon: Bus, roles: STAFF, status: "ready" },
      { label: "My Transport", href: "/transport", icon: Bus, roles: ["parent", "student"], status: "ready" },
      { label: "Vehicles", href: "/transport/vehicles", icon: Bus, roles: STAFF, status: "ready" },
      { label: "Drivers", href: "/transport/drivers", icon: Bus, roles: STAFF, status: "ready" },
      { label: "Routes", href: "/transport/routes", icon: Bus, roles: STAFF, status: "ready" },
      { label: "Student Assignments", href: "/transport/assignments", icon: Bus, roles: ADMIN, status: "ready" },
      { label: "Transport Reports", href: "/transport/reports", icon: BarChart3, roles: STAFF, status: "ready" },
    ],
  },
  {
    title: "Inventory",
    items: [
      { label: "Inventory Dashboard", href: "/inventory", icon: Boxes, roles: STAFF, status: "ready" },
      { label: "Items", href: "/inventory/items", icon: Boxes, roles: STAFF, status: "ready" },
      { label: "Categories", href: "/inventory/categories", icon: Boxes, roles: STAFF, status: "ready" },
      { label: "Locations", href: "/inventory/locations", icon: Boxes, roles: STAFF, status: "ready" },
      { label: "Inventory Reports", href: "/inventory/reports", icon: BarChart3, roles: STAFF, status: "ready" },
    ],
  },
  {
    title: "Administration",
    items: [
      { label: "Users & Roles", href: "/modules/users", icon: ShieldCheck, roles: ADMIN, status: "planned", phase: "Phase 9" },
      { label: "Leave Requests", href: "/leave", icon: CalendarOff, roles: ADMIN, status: "ready" },
      { label: "Settings", href: "/settings", icon: Settings, roles: ADMIN, status: "ready" },
    ],
  },
  {
    title: "My Account",
    items: [
      { label: "Leave", href: "/leave", icon: CalendarOff, roles: ["parent", "student"], status: "ready" },
      { label: "Notifications", href: "/notifications", icon: Bell, roles: ["parent", "student"], status: "ready" },
      { label: "Profile", href: "/profile", icon: UserCircle, roles: ["parent", "student"], status: "ready" },
      { label: "Settings", href: "/profile", icon: Settings, roles: ["parent", "student"], status: "ready" },
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
