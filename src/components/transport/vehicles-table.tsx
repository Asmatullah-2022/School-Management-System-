"use client";

import Link from "next/link";
import { DataTable, type Column } from "@/components/data-table";
import type { Driver, Vehicle } from "@/types/database";

const statusStyles: Record<string, string> = {
  active: "bg-success/10 text-success",
  inactive: "bg-muted/10 text-muted",
  maintenance: "bg-warning/10 text-warning",
};

export function VehiclesTable({ vehicles, drivers, canManage }: { vehicles: Vehicle[]; drivers: Driver[]; canManage: boolean }) {
  const columns: Column<Vehicle>[] = [
    {
      key: "number",
      header: "Vehicle",
      render: (v) => (
        <div>
          {canManage ? <Link href={`/transport/vehicles/${v.id}/edit`} className="font-medium text-foreground hover:text-primary">{v.vehicle_number}</Link> : <span className="font-medium">{v.vehicle_number}</span>}
          <p className="text-xs text-muted">{v.make_model ?? v.vehicle_type ?? "—"}</p>
        </div>
      ),
      sortValue: (v) => v.vehicle_number,
    },
    { key: "capacity", header: "Capacity", render: (v) => v.capacity ?? "—" },
    { key: "driver", header: "Driver", render: (v) => drivers.find((d) => d.id === v.driver_id)?.full_name ?? "Unassigned", hideOnMobile: true },
    { key: "insurance", header: "Insurance Expiry", render: (v) => (v.insurance_expiry ? new Date(v.insurance_expiry).toLocaleDateString() : "—"), hideOnMobile: true },
    { key: "status", header: "Status", render: (v) => <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${statusStyles[v.status]}`}>{v.status}</span> },
  ];

  return (
    <DataTable
      columns={columns}
      rows={vehicles}
      rowKey={(v) => v.id}
      searchKeys={(v) => `${v.vehicle_number} ${v.vehicle_type ?? ""} ${v.make_model ?? ""}`}
      emptyLabel="No vehicles yet."
    />
  );
}
