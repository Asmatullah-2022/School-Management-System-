import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Users, GraduationCap, ClipboardCheck, NotebookPen, Wallet, BookOpen, Library, Bus, Boxes, LayoutGrid,
} from "lucide-react";
import { getSession, isSchoolStaff, isSchoolAdmin, isFinanceStaff } from "@/lib/auth/session";
import { Card, CardHeader } from "@/components/ui/card";

interface ReportLink {
  label: string;
  href: string;
  visible: boolean;
}

interface ReportCategory {
  title: string;
  icon: typeof Users;
  links: ReportLink[];
}

export default async function ReportsCenterPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!isSchoolStaff(session.profile.role)) redirect("/dashboard");

  const admin = isSchoolAdmin(session.profile.role);
  const finance = isFinanceStaff(session.profile.role);

  const categories: ReportCategory[] = [
    { title: "Students", icon: Users, links: [{ label: "Student Reports", href: "/reports/students", visible: true }, { label: "Student 360", href: "/reports/student-360", visible: true }, { label: "Class 360", href: "/reports/class-360", visible: true }] },
    { title: "Attendance", icon: ClipboardCheck, links: [{ label: "Attendance Reports", href: "/reports/attendance", visible: true }] },
    { title: "Academic / Examinations", icon: NotebookPen, links: [{ label: "Academic Reports", href: "/reports/academic", visible: true }] },
    { title: "Teachers", icon: GraduationCap, links: [{ label: "Teacher Reports", href: "/reports/teachers", visible: admin }] },
    { title: "Finance", icon: Wallet, links: [{ label: "Finance Reports", href: "/fees/reports", visible: finance }] },
    { title: "Library", icon: Library, links: [{ label: "Library Reports", href: "/library/reports", visible: true }] },
    { title: "Transport", icon: Bus, links: [{ label: "Transport Reports", href: "/transport/reports", visible: true }] },
    { title: "Inventory", icon: Boxes, links: [{ label: "Inventory Reports", href: "/inventory/reports", visible: true }] },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold">Reports Center</h1>
        <p className="text-sm text-muted">Every report in the system, organized by module — all built from real, live data.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((cat) => {
          const links = cat.links.filter((l) => l.visible);
          if (links.length === 0) return null;
          const Icon = cat.icon;
          return (
            <Card key={cat.title}>
              <CardHeader title={cat.title} action={<Icon size={16} className="text-muted" />} />
              <ul className="divide-y divide-border">
                {links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="flex items-center justify-between px-5 py-3 text-sm hover:bg-background">
                      <span>{l.label}</span>
                      <LayoutGrid size={14} className="text-muted" />
                    </Link>
                  </li>
                ))}
              </ul>
            </Card>
          );
        })}
      </div>

      {admin && (
        <Card className="p-4">
          <p className="flex items-center gap-2 text-sm text-muted">
            <BookOpen size={15} /> Need a document instead of a report? See <Link href="/certificates" className="ml-1 text-primary hover:underline">Certificate Management</Link>.
          </p>
        </Card>
      )}
    </div>
  );
}
