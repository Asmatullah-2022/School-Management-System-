import { Bus, Route as RouteIcon, Users, Wallet, Armchair } from "lucide-react";
import { StatCard } from "@/components/dashboard/stat-card";
import { Card, CardHeader, EmptyState } from "@/components/ui/card";
import { SimpleBarChart } from "@/components/dashboard/charts";
import { buildCapacityReport, type TransportDataset } from "@/lib/reports/transport-reports";

export function TransportDashboard({ data }: { data: TransportDataset }) {
  const activeVehicles = data.vehicles.filter((v) => v.status === "active").length;
  const activeAssignments = data.assignments.filter((a) => a.status === "active").length;
  const totalCapacity = data.vehicles.reduce((sum, v) => sum + (v.capacity ?? 0), 0);
  const availableSeats = Math.max(totalCapacity - activeAssignments, 0);
  const feeCollection = data.fees
    .filter((f) => f.fee_structure_id && data.routes.some((r) => r.fee_structure_id === f.fee_structure_id) && f.status === "paid")
    .reduce((sum, f) => sum + (f.amount - f.discount), 0);

  const capacityRows = buildCapacityReport(data);
  const utilizationData = capacityRows.map((r) => ({ label: r.route, value: r.utilization }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <StatCard label="Total Vehicles" value={data.vehicles.length} icon={Bus} tone="primary" />
        <StatCard label="Active Vehicles" value={activeVehicles} icon={Bus} tone="success" />
        <StatCard label="Total Routes" value={data.routes.length} icon={RouteIcon} tone="accent" />
        <StatCard label="Assigned Students" value={activeAssignments} icon={Users} tone="primary" />
        <StatCard label="Available Seats" value={availableSeats} icon={Armchair} tone={availableSeats > 0 ? "success" : "warning"} />
        <StatCard label="Transport Fee Collected" value={`PKR ${feeCollection.toLocaleString()}`} icon={Wallet} tone="success" />
      </div>

      <Card>
        <CardHeader title="Route Capacity Utilization (%)" />
        <div className="p-4">
          {utilizationData.length ? <SimpleBarChart data={utilizationData} color="var(--color-accent)" valueLabel="Utilization %" /> : <EmptyState label="No routes yet." />}
        </div>
      </Card>
    </div>
  );
}
