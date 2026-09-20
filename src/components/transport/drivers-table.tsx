"use client";

import Link from "next/link";
import { DataTable, type Column } from "@/components/data-table";
import type { Driver, Vehicle } from "@/types/database";

const statusStyles: Record<string, string> = { active: "bg-success/10 text-success", inactive: "bg-muted/10 text-muted" };

export function DriversTable({ drivers, vehicles, canManage }: { drivers: Driver[]; vehicles: Vehicle[]; canManage: boolean }) {
  const columns: Column<Driver>[] = [
    {
      key: "name",
      header: "Driver",
      render: (d) => (
        <div>
          {canManage ? <Link href={`/transport/drivers/${d.id}/edit`} className="font-medium text-foreground hover:text-primary">{d.full_name}</Link> : <span className="font-medium">{d.full_name}</span>}
          <p className="text-xs text-muted">{d.employee_id ?? "—"}</p>
        </div>
      ),
      sortValue: (d) => d.full_name,
    },
    { key: "mobile", header: "Mobile", render: (d) => d.mobile ?? "—", hideOnMobile: true },
    { key: "license", header: "License #", render: (d) => d.license_number ?? "—", hideOnMobile: true },
    { key: "vehicle", header: "Vehicle", render: (d) => vehicles.find((v) => v.driver_id === d.id)?.vehicle_number ?? "Unassigned" },
    { key: "status", header: "Status", render: (d) => <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${statusStyles[d.status]}`}>{d.status}</span> },
  ];

  return (
    <DataTable
      columns={columns}
      rows={drivers}
      rowKey={(d) => d.id}
      searchKeys={(d) => `${d.full_name} ${d.employee_id ?? ""} ${d.license_number ?? ""}`}
      emptyLabel="No drivers yet."
    />
  );
}
