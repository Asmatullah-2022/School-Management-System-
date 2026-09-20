// Student 360 — a single cross-module snapshot of one student, built by
// composing the calculation modules each phase already shipped (child
// dashboard summary, finance report builder, library fine calculator)
// rather than recomputing attendance %, fee balances, or fines a second
// time. Never used to decide access — the caller must already have
// verified the viewer is authorized to see this student (staff, the
// student themself, or their guardian) before calling this.
import { buildChildSummary, type ChildSummaryContext } from "@/lib/dashboard/child-summary";
import { buildStudentFeeReport, type FinanceDataset } from "@/lib/reports/finance-reports";
import { daysOverdue, computeFine } from "@/lib/library/fines";
import type {
  AttendanceRecord,
  Book,
  BookIssue,
  Driver,
  LibrarySettings,
  NoticeRecord,
  EventRecord,
  Route,
  RouteStop,
  Student,
  StudentTransportAssignment,
  UserRole,
  Vehicle,
} from "@/types/database";
import { visibleNotices, classIdsForStudents } from "@/lib/notices/visibility";
import { visibleEvents } from "@/lib/events/visibility";

export interface Student360Context extends ChildSummaryContext {
  bookIssues: BookIssue[];
  books: Book[];
  librarySettings: LibrarySettings;
  transportAssignments: StudentTransportAssignment[];
  routes: Route[];
  routeStops: RouteStop[];
  vehicles: Vehicle[];
  drivers: Driver[];
  notices: NoticeRecord[];
  events: EventRecord[];
}

export interface Student360Report {
  student: Student;
  className: string;
  sectionName: string;
  academic: {
    latestResult: ReturnType<typeof buildChildSummary>["latestResult"];
    upcomingExams: ReturnType<typeof buildChildSummary>["upcomingExams"];
  };
  attendance: {
    present: number;
    absent: number;
    late: number;
    leave: number;
    total: number;
    percentage: number;
  };
  homework: {
    pendingCount: number;
    pending: ReturnType<typeof buildChildSummary>["pendingHomework"];
  };
  finance: ReturnType<typeof buildStudentFeeReport>["totals"] & { rows: ReturnType<typeof buildStudentFeeReport>["rows"] };
  library: {
    issued: number;
    returned: number;
    currentlyIssued: { book: Book | undefined; dueDate: string; daysOverdue: number; fine: number }[];
    totalFines: number;
  };
  transport: {
    route: Route | undefined;
    vehicle: Vehicle | undefined;
    driver: Driver | undefined;
    stop: RouteStop | undefined;
  } | null;
  notices: NoticeRecord[];
  events: EventRecord[];
}

export function buildStudent360(
  student: Student,
  ctx: Student360Context,
  financeData: FinanceDataset,
  viewerRole: UserRole
): Student360Report {
  const childSummary = buildChildSummary(student, ctx);

  const studentAttendance = ctx.attendance.filter((a: AttendanceRecord) => a.student_id === student.id);
  const attendance = {
    present: studentAttendance.filter((a) => a.status === "present").length,
    absent: studentAttendance.filter((a) => a.status === "absent").length,
    late: studentAttendance.filter((a) => a.status === "late").length,
    leave: studentAttendance.filter((a) => a.status === "leave").length,
    total: studentAttendance.length,
    percentage: childSummary.attendancePercentage,
  };

  const feeReport = buildStudentFeeReport(financeData, student.id);

  const studentIssues = ctx.bookIssues.filter((i) => i.student_id === student.id);
  const currentlyIssued = studentIssues
    .filter((i) => i.status === "issued")
    .map((i) => ({
      book: ctx.books.find((b) => b.id === i.book_id),
      dueDate: i.due_date,
      daysOverdue: daysOverdue(i),
      fine: computeFine(i, ctx.librarySettings),
    }));
  const library = {
    issued: studentIssues.length,
    returned: studentIssues.filter((i) => i.status === "returned").length,
    currentlyIssued,
    totalFines:
      studentIssues.filter((i) => i.status === "returned").reduce((s, i) => s + i.fine_amount, 0) +
      currentlyIssued.reduce((s, i) => s + i.fine, 0),
  };

  const activeAssignment = ctx.transportAssignments.find((a) => a.student_id === student.id && a.status === "active");
  const transport = activeAssignment
    ? {
        route: ctx.routes.find((r) => r.id === activeAssignment.route_id),
        vehicle: ctx.vehicles.find((v) => v.id === ctx.routes.find((r) => r.id === activeAssignment.route_id)?.vehicle_id),
        driver: ctx.drivers.find((d) => d.id === ctx.routes.find((r) => r.id === activeAssignment.route_id)?.driver_id),
        stop: ctx.routeStops.find((s) => s.id === activeAssignment.stop_id),
      }
    : null;

  const classIds = classIdsForStudents([student]);
  const notices = visibleNotices(ctx.notices, viewerRole, classIds).slice(0, 5);
  const events = visibleEvents(ctx.events, viewerRole, classIds)
    .filter((e) => e.start_date >= new Date().toISOString().slice(0, 10))
    .slice(0, 5);

  return {
    student,
    className: childSummary.className,
    sectionName: childSummary.sectionName,
    academic: { latestResult: childSummary.latestResult, upcomingExams: childSummary.upcomingExams },
    attendance,
    homework: { pendingCount: childSummary.pendingHomeworkCount, pending: childSummary.pendingHomework },
    finance: { ...feeReport.totals, rows: feeReport.rows },
    library,
    transport,
    notices,
    events,
  };
}
