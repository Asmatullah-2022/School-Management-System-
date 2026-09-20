import { redirect } from "next/navigation";
import { getSession, isSchoolAdmin } from "@/lib/auth/session";
import { listRoutes, listRouteStops, listVehicles, listRouteStudents } from "@/lib/data/transport";
import { listStudents } from "@/lib/data/students";
import { Card, CardHeader, EmptyState } from "@/components/ui/card";
import { AssignStudentForm } from "@/components/transport/assign-student-form";
import { EndAssignmentButton } from "@/components/transport/end-assignment-button";
import { assignStudentToRouteAction, endRouteAssignmentAction } from "../actions";

export default async function TransportAssignmentsPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!isSchoolAdmin(session.profile.role)) redirect("/transport");

  const [routes, stops, vehicles, assignments, students] = await Promise.all([
    listRoutes(),
    listRouteStops(),
    listVehicles(),
    listRouteStudents(),
    listStudents(),
  ]);

  const activeCounts: Record<string, number> = {};
  for (const a of assignments) {
    if (a.status === "active") activeCounts[a.route_id] = (activeCounts[a.route_id] ?? 0) + 1;
  }

  const activeAssignments = assignments.filter((a) => a.status === "active").sort((a, b) => (a.start_date < b.start_date ? 1 : -1));

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold">Student Transport Assignments</h1>
        <p className="text-sm text-muted">{activeAssignments.length} students currently assigned to a route</p>
      </div>

      <Card className="p-5 sm:p-6">
        <AssignStudentForm routes={routes} stops={stops} vehicles={vehicles} students={students} currentAssignmentCounts={activeCounts} action={assignStudentToRouteAction} />
      </Card>

      <Card>
        <CardHeader title="Active Assignments" />
        {activeAssignments.length === 0 ? (
          <EmptyState label="No students are currently assigned to transport." />
        ) : (
          <ul className="divide-y divide-border">
            {activeAssignments.map((a) => {
              const student = students.find((s) => s.id === a.student_id);
              const route = routes.find((r) => r.id === a.route_id);
              return (
                <li key={a.id} className="flex items-center justify-between px-5 py-3 text-sm">
                  <div>
                    <p className="font-medium">{student?.full_name ?? "Unknown student"}</p>
                    <p className="text-xs text-muted">{route?.name ?? "Unknown route"} · {a.stop_name ?? "No stop"} · Since {new Date(a.start_date).toLocaleDateString()}</p>
                  </div>
                  <EndAssignmentButton id={a.id} action={endRouteAssignmentAction} />
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </div>
  );
}
