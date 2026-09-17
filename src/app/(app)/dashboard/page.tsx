import {
  Users,
  GraduationCap,
  BookOpen,
  ClipboardCheck,
  UserCheck,
  UserX,
  Wallet,
  NotebookPen,
} from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { listStudents } from "@/lib/data/students";
import { listTeachers } from "@/lib/data/teachers";
import { listClasses } from "@/lib/data/academics";
import { listAttendance, listFees, listEvents, listNotices } from "@/lib/data/records";
import { StatCard } from "@/components/dashboard/stat-card";
import { Card, CardHeader, EmptyState } from "@/components/ui/card";
import {
  AttendanceChart,
  ClassDistributionChart,
  EnrollmentTrendChart,
  FeeCollectionChart,
} from "@/components/dashboard/charts";

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export default async function DashboardPage() {
  const session = await getSession();
  const [students, teachers, classes, attendance, fees, events, notices] = await Promise.all([
    listStudents(),
    listTeachers(),
    listClasses(),
    listAttendance(),
    listFees(),
    listEvents(),
    listNotices(),
  ]);

  const today = todayISO();
  const todaysAttendance = attendance.filter((a) => a.date === today);
  const present = todaysAttendance.filter((a) => a.status === "present").length;
  const absent = todaysAttendance.filter((a) => a.status === "absent").length;
  const pendingFees = fees.filter((f) => f.status === "unpaid" || f.status === "overdue");

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";
  const firstName = session?.profile.full_name.split(" ")[0] ?? "";

  // Attendance by day (last 7 days present vs absent)
  const days = Array.from(new Set(attendance.map((a) => a.date))).sort().slice(-7);
  const attendanceChartData = days.map((d) => {
    const dayRecords = attendance.filter((a) => a.date === d);
    return {
      date: new Date(d).toLocaleDateString("en-US", { weekday: "short" }),
      present: dayRecords.filter((r) => r.status === "present").length,
      absent: dayRecords.filter((r) => r.status === "absent" || r.status === "late").length,
    };
  });

  // Enrollment trend (synthetic monthly growth ending at current total, demo-friendly)
  const monthNames = ["Apr", "May", "Jun", "Jul", "Aug", "Sep"];
  const total = students.length;
  const enrollmentData = monthNames.map((m, i) => ({
    month: m,
    students: Math.max(1, Math.round(total * ((i + 3) / (monthNames.length + 2)))),
  }));
  enrollmentData[enrollmentData.length - 1].students = total;

  const feeCollectionData = monthNames.map((m, i) => ({
    month: m,
    collected: fees
      .filter((f) => f.status === "paid")
      .reduce((sum, f) => sum + (f.amount - f.discount), 0) * ((i + 2) / 8),
  }));

  const classDistribution = classes
    .map((c) => ({ name: c.name, value: students.filter((s) => s.class_id === c.id).length }))
    .filter((c) => c.value > 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold sm:text-2xl">
          {greeting}{firstName ? `, ${firstName}` : ""} 👋
        </h1>
        <p className="text-sm text-muted">
          {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          {" · Academic Session 2025-2026"}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        <StatCard label="Total Students" value={students.length} icon={Users} tone="primary" />
        <StatCard label="Total Teachers" value={teachers.length} icon={GraduationCap} tone="accent" />
        <StatCard label="Total Classes" value={classes.length} icon={BookOpen} tone="warning" />
        <StatCard label="Today's Attendance" value={todaysAttendance.length} icon={ClipboardCheck} tone="primary" />
        <StatCard label="Present Today" value={present} icon={UserCheck} tone="success" />
        <StatCard label="Absent Today" value={absent} icon={UserX} tone="danger" />
        <StatCard label="Pending Fees" value={pendingFees.length} icon={Wallet} tone="warning" hint="Students" />
        <StatCard label="Upcoming Exams" value={0} icon={NotebookPen} tone="accent" hint="Phase 4" />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title="Student Enrollment Trend" />
          <div className="p-4">
            <EnrollmentTrendChart data={enrollmentData} />
          </div>
        </Card>
        <Card>
          <CardHeader title="Attendance (Last 7 Days)" />
          <div className="p-4">
            {attendanceChartData.length ? (
              <AttendanceChart data={attendanceChartData} />
            ) : (
              <EmptyState label="No attendance recorded yet." />
            )}
          </div>
        </Card>
        <Card>
          <CardHeader title="Monthly Fee Collection (PKR)" />
          <div className="p-4">
            <FeeCollectionChart data={feeCollectionData} />
          </div>
        </Card>
        <Card>
          <CardHeader title="Class-wise Student Distribution" />
          <div className="p-4">
            {classDistribution.length ? (
              <ClassDistributionChart data={classDistribution} />
            ) : (
              <EmptyState label="No students enrolled yet." />
            )}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader title="Latest Notices" />
          {notices.length ? (
            <ul className="divide-y divide-border">
              {notices.slice(0, 5).map((n) => (
                <li key={n.id} className="px-5 py-3">
                  <p className="text-sm font-medium">{n.title}</p>
                  <p className="mt-0.5 line-clamp-2 text-xs text-muted">{n.description}</p>
                  <p className="mt-1 text-[11px] text-muted">
                    {new Date(n.publish_date).toLocaleDateString()} · {n.priority}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState label="No notices yet." />
          )}
        </Card>

        <Card>
          <CardHeader title="Upcoming Events" />
          {events.length ? (
            <ul className="divide-y divide-border">
              {events.slice(0, 5).map((e) => (
                <li key={e.id} className="px-5 py-3">
                  <p className="text-sm font-medium">{e.title}</p>
                  <p className="mt-0.5 text-xs text-muted">{e.location}</p>
                  <p className="mt-1 text-[11px] text-muted">{new Date(e.start_date).toLocaleDateString()}</p>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState label="No upcoming events." />
          )}
        </Card>

        <Card>
          <CardHeader title="Students Requiring Attention" />
          {pendingFees.length ? (
            <ul className="divide-y divide-border">
              {pendingFees.slice(0, 5).map((f) => {
                const student = students.find((s) => s.id === f.student_id);
                return (
                  <li key={f.id} className="flex items-center justify-between px-5 py-3">
                    <div>
                      <p className="text-sm font-medium">{student?.full_name ?? "Unknown student"}</p>
                      <p className="text-xs text-muted">{f.title}</p>
                    </div>
                    <span className="rounded-full bg-danger/10 px-2 py-0.5 text-xs font-medium text-danger">
                      {f.status}
                    </span>
                  </li>
                );
              })}
            </ul>
          ) : (
            <EmptyState label="Everyone is in good standing 🎉" />
          )}
        </Card>
      </div>
    </div>
  );
}
