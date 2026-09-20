import "server-only";
import { getStudent, listStudents } from "@/lib/data/students";
import { listClasses, listSections } from "@/lib/data/academics";
import { listSubjects } from "@/lib/data/subjects";
import { listTeachers } from "@/lib/data/teachers";
import { listPeriods } from "@/lib/data/periods";
import { listTimetableEntries } from "@/lib/data/timetable";
import { listAttendance, listHomework } from "@/lib/data/records";
import { listHomeworkAssignments } from "@/lib/data/homework-submissions";
import { listExams } from "@/lib/data/exams";
import { listExamSubjects } from "@/lib/data/exam-schedule";
import { listResults } from "@/lib/data/results";
import { listFees, listPayments, listDiscounts, listScholarships, listFeeDiscounts, listFeeStructures, listFeePeriods, listRefunds } from "@/lib/data/finance";
import { listProfiles } from "@/lib/data/profiles";
import { listBooks, listBookIssues, getLibrarySettings } from "@/lib/data/library";
import { listRouteStudents, listRoutes, listRouteStops, listVehicles, listDrivers } from "@/lib/data/transport";
import { listNotices, listEvents } from "@/lib/data/records";
import { buildStudent360, type Student360Report } from "@/lib/reports/student-360";
import type { UserRole } from "@/types/database";

/** Fetches every dataset a Student 360 report needs and composes it. Used
 * identically by the on-screen report and the print/PDF route so they can
 * never disagree. */
export async function loadStudent360(studentId: string, schoolId: string, viewerRole: UserRole): Promise<Student360Report | undefined> {
  const student = await getStudent(studentId);
  if (!student) return undefined;

  const [
    classes, sections, subjects, teachers, periods, timetableEntries, attendance, homework, homeworkAssignments,
    exams, examSubjects, results, fees, payments, discounts, scholarships, feeDiscounts, feeStructures, feePeriods, refunds,
    students, profiles, books, bookIssues, librarySettings, routeStudents, routes, routeStops, vehicles, drivers,
    notices, events,
  ] = await Promise.all([
    listClasses(), listSections(), listSubjects(), listTeachers(), listPeriods(), listTimetableEntries(),
    listAttendance(), listHomework(), listHomeworkAssignments(),
    listExams(), listExamSubjects(), listResults(), listFees(), listPayments(), listDiscounts(), listScholarships(),
    listFeeDiscounts(), listFeeStructures(), listFeePeriods(), listRefunds(),
    listStudents(), listProfiles(), listBooks(), listBookIssues(), getLibrarySettings(schoolId),
    listRouteStudents(), listRoutes(), listRouteStops(), listVehicles(), listDrivers(),
    listNotices(), listEvents(),
  ]);

  return buildStudent360(
    student,
    {
      classes, sections, subjects, teachers, periods, timetableEntries, attendance, homework, homeworkAssignments,
      exams, examSubjects, results, fees,
      bookIssues, books, librarySettings,
      transportAssignments: routeStudents, routes, routeStops, vehicles, drivers,
      notices, events,
    },
    { fees, payments, refunds, discounts, scholarships, feeDiscounts, feeStructures, feePeriods, students, classes, sections, profiles },
    viewerRole
  );
}
