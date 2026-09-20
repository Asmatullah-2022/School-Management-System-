"use client";

import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { SimpleReportView } from "@/components/reports/simple-report-view";
import {
  buildCapacityReport,
  buildDriverReport,
  buildRouteReport,
  buildStudentTransportReport,
  buildTransportFeeReport,
  buildVehicleReport,
  type TransportDataset,
} from "@/lib/reports/transport-reports";

const REPORTS = [
  { key: "vehicle", label: "Vehicle Report" },
  { key: "driver", label: "Driver Report" },
  { key: "route", label: "Route Report" },
  { key: "student", label: "Student Transport" },
  { key: "capacity", label: "Capacity Report" },
  { key: "fee", label: "Transport Fee Report" },
] as const;

const money = (n: unknown) => `PKR ${Number(n).toLocaleString()}`;

export function TransportReportsCenter({ data }: { data: TransportDataset }) {
  const [report, setReport] = useState<(typeof REPORTS)[number]["key"]>("vehicle");

  const view = useMemo(() => {
    if (report === "vehicle") {
      return { title: "Vehicle Report", rows: buildVehicleReport(data), columns: [
        { key: "vehicleNumber", label: "Vehicle" }, { key: "type", label: "Type" }, { key: "capacity", label: "Capacity" },
        { key: "assigned", label: "Assigned" }, { key: "driver", label: "Driver" }, { key: "status", label: "Status" },
      ] };
    }
    if (report === "driver") {
      return { title: "Driver Report", rows: buildDriverReport(data), columns: [
        { key: "name", label: "Driver" }, { key: "employeeId", label: "Employee ID" }, { key: "mobile", label: "Mobile" },
        { key: "licenseNumber", label: "License #" }, { key: "licenseExpiry", label: "License Expiry" }, { key: "vehicle", label: "Vehicle" }, { key: "status", label: "Status" },
      ] };
    }
    if (report === "route") {
      return { title: "Route Report", rows: buildRouteReport(data), columns: [
        { key: "name", label: "Route" }, { key: "code", label: "Code" }, { key: "startingPoint", label: "Starting Point" }, { key: "destination", label: "Destination" },
        { key: "vehicle", label: "Vehicle" }, { key: "stops", label: "Stops" }, { key: "assignedStudents", label: "Assigned" }, { key: "fare", label: "Fare", format: money }, { key: "status", label: "Status" },
      ] };
    }
    if (report === "student") {
      return { title: "Student Transport Report", rows: buildStudentTransportReport(data), columns: [
        { key: "student", label: "Student" }, { key: "admissionNumber", label: "Admission #" }, { key: "route", label: "Route" }, { key: "stop", label: "Stop" }, { key: "startDate", label: "Since" },
      ] };
    }
    if (report === "capacity") {
      return { title: "Capacity Report", rows: buildCapacityReport(data), columns: [
        { key: "route", label: "Route" }, { key: "vehicle", label: "Vehicle" }, { key: "capacity", label: "Capacity" },
        { key: "assigned", label: "Assigned" }, { key: "availableSeats", label: "Available Seats" }, { key: "utilization", label: "Utilization %" },
      ] };
    }
    return { title: "Transport Fee Report", rows: buildTransportFeeReport(data), columns: [
      { key: "student", label: "Student" }, { key: "title", label: "Fee" }, { key: "amount", label: "Amount", format: money },
      { key: "discount", label: "Discount", format: money }, { key: "dueDate", label: "Due Date" }, { key: "status", label: "Status" },
    ] };
  }, [report, data]);

  return (
    <div className="space-y-4">
      <Card className="flex flex-wrap gap-2 p-3">
        {REPORTS.map((r) => (
          <button key={r.key} onClick={() => setReport(r.key)} className={`rounded-lg px-3 py-1.5 text-sm font-medium ${report === r.key ? "bg-primary text-primary-foreground" : "hover:bg-background"}`}>
            {r.label}
          </button>
        ))}
      </Card>
      <SimpleReportView title={view.title} columns={view.columns} rows={view.rows as unknown as Record<string, unknown>[]} filenameBase={`transport-${report}`} printHref={`/print/transport-report?key=${report}`} />
    </div>
  );
}
