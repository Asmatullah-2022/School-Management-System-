import { redirect } from "next/navigation";
import { getSession, isSchoolStaff } from "@/lib/auth/session";
import { listVehicles, listDrivers, listRoutes, listRouteStops, listRouteStudents } from "@/lib/data/transport";
import { listStudents, getStudent } from "@/lib/data/students";
import { listFees } from "@/lib/data/finance";
import { getStudentIdForProfile, getChildStudentIdsForProfile } from "@/lib/data/people";
import { TransportDashboard } from "@/components/transport/transport-dashboard";
import { MyTransportChildSwitcher } from "@/components/transport/my-transport-child-switcher";
import type { TransportDataset } from "@/lib/reports/transport-reports";

export default async function TransportPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const [vehicles, drivers, routes, stops, assignments] = await Promise.all([
    listVehicles(),
    listDrivers(),
    listRoutes(),
    listRouteStops(),
    listRouteStudents(),
  ]);

  if (isSchoolStaff(session.profile.role)) {
    const [students, fees] = await Promise.all([listStudents(), listFees()]);
    const data: TransportDataset = { vehicles, drivers, routes, stops, assignments, students, fees };
    return (
      <div className="space-y-4">
        <div>
          <h1 className="text-xl font-semibold">Transport Dashboard</h1>
          <p className="text-sm text-muted">Real-time overview of vehicles, routes, and assignments.</p>
        </div>
        <TransportDashboard data={data} />
      </div>
    );
  }

  const studentIds =
    session.profile.role === "student"
      ? [await getStudentIdForProfile(session.profile.id)].filter((id): id is string => !!id)
      : await getChildStudentIdsForProfile(session.profile.id);

  const children = (await Promise.all(studentIds.map((id) => getStudent(id)))).filter((s): s is NonNullable<typeof s> => !!s);
  const entries = children.map((student) => ({
    student,
    assignment: assignments.find((a) => a.student_id === student.id && a.status === "active"),
  }));

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold">My Transport</h1>
        <p className="text-sm text-muted">
          {session.profile.role === "parent" ? "Your children's school transport details." : "Your school transport details."}
        </p>
      </div>
      <MyTransportChildSwitcher entries={entries} routes={routes} vehicles={vehicles} drivers={drivers} stops={stops} showChildHeader={session.profile.role === "parent"} />
    </div>
  );
}
