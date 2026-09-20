import { redirect } from "next/navigation";
import { getSession, isSchoolStaff } from "@/lib/auth/session";
import { listVehicles, listDrivers, listRoutes, listRouteStops, listRouteStudents } from "@/lib/data/transport";
import { listStudents } from "@/lib/data/students";
import { listFees } from "@/lib/data/finance";
import { TransportReportsCenter } from "@/components/transport/transport-reports-center";
import type { TransportDataset } from "@/lib/reports/transport-reports";

export default async function TransportReportsPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!isSchoolStaff(session.profile.role)) redirect("/transport");

  const [vehicles, drivers, routes, stops, assignments, students, fees] = await Promise.all([
    listVehicles(), listDrivers(), listRoutes(), listRouteStops(), listRouteStudents(), listStudents(), listFees(),
  ]);
  const data: TransportDataset = { vehicles, drivers, routes, stops, assignments, students, fees };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold">Transport Reports</h1>
        <p className="text-sm text-muted">Real-time reports generated from vehicles, routes, and assignments.</p>
      </div>
      <TransportReportsCenter data={data} />
    </div>
  );
}
