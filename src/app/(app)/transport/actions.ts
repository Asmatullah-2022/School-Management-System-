"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSession, isSchoolAdmin } from "@/lib/auth/session";
import {
  createDriver,
  updateDriver,
  createVehicle,
  updateVehicle,
  createRoute,
  updateRoute,
  createRouteStop,
  assignStudentToRoute,
  endRouteAssignment,
  listRoutes,
} from "@/lib/data/transport";
import { listFeeStructures, ensureFeePeriod, generateFeeCharges } from "@/lib/data/finance";
import { recordAuditLog } from "@/lib/audit/log";
import type { Driver, Route, Vehicle } from "@/types/database";

export async function createDriverAction(formData: FormData): Promise<{ error?: string } | void> {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!isSchoolAdmin(session.profile.role)) return { error: "Only administrators can manage drivers." };

  const fullName = String(formData.get("full_name") ?? "").trim();
  if (!fullName) return { error: "Driver name is required." };

  let driver: Driver;
  try {
    driver = await createDriver({
      schoolId: session.school.id,
      full_name: fullName,
      employee_id: String(formData.get("employee_id") ?? "").trim() || null,
      cnic: String(formData.get("cnic") ?? "").trim() || null,
      mobile: String(formData.get("mobile") ?? "").trim() || null,
      license_number: String(formData.get("license_number") ?? "").trim() || null,
      license_expiry: String(formData.get("license_expiry") ?? "") || null,
      status: "active",
      created_by: session.profile.id,
    });
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Could not add driver." };
  }
  await recordAuditLog({ schoolId: session.school.id, profileId: session.profile.id, action: "driver.added", targetTable: "drivers", targetId: driver.id });
  revalidatePath("/transport/drivers");
  redirect("/transport/drivers");
}

export async function updateDriverAction(id: string, formData: FormData): Promise<{ error?: string } | void> {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!isSchoolAdmin(session.profile.role)) return { error: "Only administrators can manage drivers." };

  try {
    await updateDriver(id, {
      full_name: String(formData.get("full_name") ?? "").trim(),
      employee_id: String(formData.get("employee_id") ?? "").trim() || null,
      cnic: String(formData.get("cnic") ?? "").trim() || null,
      mobile: String(formData.get("mobile") ?? "").trim() || null,
      license_number: String(formData.get("license_number") ?? "").trim() || null,
      license_expiry: String(formData.get("license_expiry") ?? "") || null,
      status: (String(formData.get("status") ?? "active")) as Driver["status"],
    });
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Could not update driver." };
  }
  revalidatePath("/transport/drivers");
  redirect("/transport/drivers");
}

export async function createVehicleAction(formData: FormData): Promise<{ error?: string } | void> {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!isSchoolAdmin(session.profile.role)) return { error: "Only administrators can manage vehicles." };

  const vehicleNumber = String(formData.get("vehicle_number") ?? "").trim();
  if (!vehicleNumber) return { error: "Registration number is required." };

  let vehicle: Vehicle;
  try {
    vehicle = await createVehicle({
      schoolId: session.school.id,
      vehicle_number: vehicleNumber,
      vehicle_type: String(formData.get("vehicle_type") ?? "").trim() || null,
      make_model: String(formData.get("make_model") ?? "").trim() || null,
      capacity: formData.get("capacity") ? Number(formData.get("capacity")) : null,
      driver_id: String(formData.get("driver_id") ?? "") || null,
      status: "active",
      start_date: String(formData.get("start_date") ?? "") || null,
      insurance_expiry: String(formData.get("insurance_expiry") ?? "") || null,
      fitness_expiry: String(formData.get("fitness_expiry") ?? "") || null,
      notes: String(formData.get("notes") ?? "").trim() || null,
      created_by: session.profile.id,
    });
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Could not add vehicle." };
  }
  await recordAuditLog({ schoolId: session.school.id, profileId: session.profile.id, action: "vehicle.added", targetTable: "vehicles", targetId: vehicle.id });
  revalidatePath("/transport/vehicles");
  redirect("/transport/vehicles");
}

export async function updateVehicleAction(id: string, formData: FormData): Promise<{ error?: string } | void> {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!isSchoolAdmin(session.profile.role)) return { error: "Only administrators can manage vehicles." };

  try {
    await updateVehicle(id, {
      vehicle_number: String(formData.get("vehicle_number") ?? "").trim(),
      vehicle_type: String(formData.get("vehicle_type") ?? "").trim() || null,
      make_model: String(formData.get("make_model") ?? "").trim() || null,
      capacity: formData.get("capacity") ? Number(formData.get("capacity")) : null,
      driver_id: String(formData.get("driver_id") ?? "") || null,
      status: (String(formData.get("status") ?? "active")) as Vehicle["status"],
      insurance_expiry: String(formData.get("insurance_expiry") ?? "") || null,
      fitness_expiry: String(formData.get("fitness_expiry") ?? "") || null,
      notes: String(formData.get("notes") ?? "").trim() || null,
    });
    await recordAuditLog({ schoolId: session.school.id, profileId: session.profile.id, action: "vehicle.updated", targetTable: "vehicles", targetId: id });
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Could not update vehicle." };
  }
  revalidatePath("/transport/vehicles");
  redirect("/transport/vehicles");
}

export async function createRouteAction(formData: FormData): Promise<{ error?: string } | void> {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!isSchoolAdmin(session.profile.role)) return { error: "Only administrators can manage routes." };

  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { error: "Route name is required." };

  let route: Route;
  try {
    route = await createRoute({
      schoolId: session.school.id,
      name,
      route_code: String(formData.get("route_code") ?? "").trim() || null,
      starting_point: String(formData.get("starting_point") ?? "").trim() || null,
      destination: String(formData.get("destination") ?? "").trim() || null,
      distance_km: formData.get("distance_km") ? Number(formData.get("distance_km")) : null,
      estimated_minutes: formData.get("estimated_minutes") ? Number(formData.get("estimated_minutes")) : null,
      vehicle_id: String(formData.get("vehicle_id") ?? "") || null,
      driver_id: String(formData.get("driver_id") ?? "") || null,
      fare: Number(formData.get("fare") ?? 0),
      fee_structure_id: String(formData.get("fee_structure_id") ?? "") || null,
      status: "active",
      created_by: session.profile.id,
    });
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Could not create route." };
  }
  await recordAuditLog({ schoolId: session.school.id, profileId: session.profile.id, action: "route.created", targetTable: "routes", targetId: route.id });
  revalidatePath("/transport/routes");
  redirect(`/transport/routes/${route.id}`);
}

export async function updateRouteAction(id: string, formData: FormData): Promise<{ error?: string } | void> {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!isSchoolAdmin(session.profile.role)) return { error: "Only administrators can manage routes." };

  try {
    await updateRoute(id, {
      name: String(formData.get("name") ?? "").trim(),
      route_code: String(formData.get("route_code") ?? "").trim() || null,
      starting_point: String(formData.get("starting_point") ?? "").trim() || null,
      destination: String(formData.get("destination") ?? "").trim() || null,
      distance_km: formData.get("distance_km") ? Number(formData.get("distance_km")) : null,
      estimated_minutes: formData.get("estimated_minutes") ? Number(formData.get("estimated_minutes")) : null,
      vehicle_id: String(formData.get("vehicle_id") ?? "") || null,
      driver_id: String(formData.get("driver_id") ?? "") || null,
      fare: Number(formData.get("fare") ?? 0),
      fee_structure_id: String(formData.get("fee_structure_id") ?? "") || null,
      status: (String(formData.get("status") ?? "active")) as Route["status"],
    });
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Could not update route." };
  }
  revalidatePath(`/transport/routes/${id}`);
  revalidatePath("/transport/routes");
}

export async function createRouteStopAction(routeId: string, formData: FormData): Promise<{ error?: string } | void> {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!isSchoolAdmin(session.profile.role)) return { error: "Only administrators can manage stops." };

  const stopName = String(formData.get("stop_name") ?? "").trim();
  if (!stopName) return { error: "Stop name is required." };

  try {
    await createRouteStop({
      schoolId: session.school.id,
      route_id: routeId,
      stop_name: stopName,
      stop_order: Number(formData.get("stop_order") ?? 0),
      pickup_time: String(formData.get("pickup_time") ?? "") || null,
      dropoff_time: String(formData.get("dropoff_time") ?? "") || null,
      location_description: String(formData.get("location_description") ?? "").trim() || null,
    });
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Could not add stop." };
  }
  revalidatePath(`/transport/routes/${routeId}`);
}

export async function assignStudentToRouteAction(formData: FormData): Promise<{ error?: string } | void> {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!isSchoolAdmin(session.profile.role)) return { error: "Only administrators can assign transport." };

  const routeId = String(formData.get("route_id") ?? "");
  const studentId = String(formData.get("student_id") ?? "");
  if (!routeId || !studentId) return { error: "Route and student are required." };

  try {
    const assignment = await assignStudentToRoute({
      schoolId: session.school.id,
      routeId,
      studentId,
      stopId: String(formData.get("stop_id") ?? "") || null,
      createdBy: session.profile.id,
    });
    await recordAuditLog({ schoolId: session.school.id, profileId: session.profile.id, action: "transport.student_assigned", targetTable: "route_students", targetId: assignment.id, metadata: { routeId, studentId } });

    // Reuse the existing Phase 5 finance system — never a second payment
    // path: if this route is linked to a "Transport" fee structure,
    // generate the same charge a staff member would create manually from
    // Fees → Generate Fees, scoped to just this one student.
    const route = (await listRoutes()).find((r) => r.id === routeId);
    if (route?.fee_structure_id) {
      const structure = (await listFeeStructures()).find((fs) => fs.id === route.fee_structure_id);
      if (structure) {
        const today = new Date();
        let feePeriodId: string | null = null;
        if (structure.frequency === "monthly" || structure.frequency === "quarterly") {
          const period = await ensureFeePeriod(session.school.id, today.getMonth() + 1, today.getFullYear(), today.toLocaleString("en", { month: "long", year: "numeric" }));
          feePeriodId = period.id;
        }
        const dueDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7).toISOString().slice(0, 10);
        await generateFeeCharges({ schoolId: session.school.id, studentIds: [studentId], feeStructureId: structure.id, feePeriodId, dueDate, createdBy: session.profile.id });
      }
    }
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Could not assign this student to the route." };
  }
  revalidatePath("/transport/assignments");
  revalidatePath(`/transport/routes/${routeId}`);
  revalidatePath("/fees");
}

export async function endRouteAssignmentAction(id: string): Promise<void> {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!isSchoolAdmin(session.profile.role)) return;
  await endRouteAssignment(id);
  await recordAuditLog({ schoolId: session.school.id, profileId: session.profile.id, action: "transport.assignment_ended", targetTable: "route_students", targetId: id });
  revalidatePath("/transport/assignments");
}
