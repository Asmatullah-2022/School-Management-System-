import type { Driver, FeeRecord, Route, Student, StudentTransportAssignment, Vehicle } from "@/types/database";

export interface TransportDataset {
  vehicles: Vehicle[];
  drivers: Driver[];
  routes: Route[];
  stops: { route_id: string }[];
  assignments: StudentTransportAssignment[];
  students: Student[];
  fees: FeeRecord[];
}

export function buildVehicleReport(data: TransportDataset) {
  return data.vehicles.map((v) => {
    const driver = data.drivers.find((d) => d.id === v.driver_id);
    const activeCount = data.assignments.filter((a) => a.status === "active" && data.routes.find((r) => r.id === a.route_id)?.vehicle_id === v.id).length;
    return {
      vehicleNumber: v.vehicle_number,
      type: v.vehicle_type ?? "—",
      capacity: v.capacity ?? 0,
      assigned: activeCount,
      driver: driver?.full_name ?? "Unassigned",
      status: v.status,
    };
  });
}

export function buildDriverReport(data: TransportDataset) {
  return data.drivers.map((d) => ({
    name: d.full_name,
    employeeId: d.employee_id ?? "—",
    mobile: d.mobile ?? "—",
    licenseNumber: d.license_number ?? "—",
    licenseExpiry: d.license_expiry ?? "—",
    vehicle: data.vehicles.find((v) => v.driver_id === d.id)?.vehicle_number ?? "Unassigned",
    status: d.status,
  }));
}

export function buildRouteReport(data: TransportDataset) {
  return data.routes.map((r) => ({
    name: r.name,
    code: r.route_code ?? "—",
    startingPoint: r.starting_point ?? "—",
    destination: r.destination ?? "—",
    vehicle: data.vehicles.find((v) => v.id === r.vehicle_id)?.vehicle_number ?? "—",
    stops: data.stops.filter((s) => s.route_id === r.id).length,
    assignedStudents: data.assignments.filter((a) => a.route_id === r.id && a.status === "active").length,
    fare: r.fare,
    status: r.status,
  }));
}

export function buildStudentTransportReport(data: TransportDataset) {
  return data.assignments
    .filter((a) => a.status === "active")
    .map((a) => {
      const student = data.students.find((s) => s.id === a.student_id);
      const route = data.routes.find((r) => r.id === a.route_id);
      return {
        student: student?.full_name ?? "Unknown student",
        admissionNumber: student?.admission_number ?? "—",
        route: route?.name ?? "Unknown route",
        stop: a.stop_name ?? "—",
        startDate: a.start_date,
      };
    });
}

export function buildCapacityReport(data: TransportDataset) {
  return data.routes.map((r) => {
    const vehicle = data.vehicles.find((v) => v.id === r.vehicle_id);
    const assigned = data.assignments.filter((a) => a.route_id === r.id && a.status === "active").length;
    const capacity = vehicle?.capacity ?? 0;
    return {
      route: r.name,
      vehicle: vehicle?.vehicle_number ?? "—",
      capacity,
      assigned,
      availableSeats: Math.max(capacity - assigned, 0),
      utilization: capacity > 0 ? Math.round((assigned / capacity) * 100) : 0,
    };
  });
}

export function buildTransportFeeReport(data: TransportDataset) {
  const routeFeeStructureIds = new Set(data.routes.map((r) => r.fee_structure_id).filter((id): id is string => !!id));
  return data.fees
    .filter((f) => f.fee_structure_id && routeFeeStructureIds.has(f.fee_structure_id))
    .map((f) => {
      const student = data.students.find((s) => s.id === f.student_id);
      return {
        student: student?.full_name ?? "Unknown student",
        title: f.title,
        amount: f.amount,
        discount: f.discount,
        dueDate: f.due_date,
        status: f.status,
      };
    });
}
