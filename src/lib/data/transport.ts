import "server-only";
import { isDemoMode } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import { demoStore } from "@/lib/demo/store";
import type { Driver, Route, RouteStop, StudentTransportAssignment, Vehicle } from "@/types/database";

export async function listDrivers(): Promise<Driver[]> {
  if (isDemoMode()) return demoStore.listDrivers();
  const supabase = await createClient();
  const { data, error } = await supabase.from("drivers").select("*").order("full_name");
  if (error) throw error;
  return data as Driver[];
}

export async function createDriver(input: Omit<Driver, "id" | "school_id"> & { schoolId: string }): Promise<Driver> {
  const { schoolId, ...rest } = input;
  if (isDemoMode()) return demoStore.createDriver(rest);
  const supabase = await createClient();
  const { data, error } = await supabase.from("drivers").insert({ school_id: schoolId, ...rest }).select().single();
  if (error) throw new Error(error.message);
  return data as Driver;
}

export async function updateDriver(id: string, data: Partial<Driver>): Promise<Driver | undefined> {
  if (isDemoMode()) return demoStore.updateDriver(id, data);
  const supabase = await createClient();
  const { data: updated, error } = await supabase.from("drivers").update(data).eq("id", id).select().maybeSingle();
  if (error) throw new Error(error.message);
  return (updated as Driver) ?? undefined;
}

export async function listVehicles(): Promise<Vehicle[]> {
  if (isDemoMode()) return demoStore.listVehicles();
  const supabase = await createClient();
  const { data, error } = await supabase.from("vehicles").select("*").order("vehicle_number");
  if (error) throw error;
  return data as Vehicle[];
}

export async function createVehicle(input: Omit<Vehicle, "id" | "school_id"> & { schoolId: string }): Promise<Vehicle> {
  const { schoolId, ...rest } = input;
  if (isDemoMode()) return demoStore.createVehicle(rest);
  const supabase = await createClient();
  const { data, error } = await supabase.from("vehicles").insert({ school_id: schoolId, ...rest }).select().single();
  if (error) throw new Error(error.message);
  return data as Vehicle;
}

export async function updateVehicle(id: string, data: Partial<Vehicle>): Promise<Vehicle | undefined> {
  if (isDemoMode()) return demoStore.updateVehicle(id, data);
  const supabase = await createClient();
  const { data: updated, error } = await supabase.from("vehicles").update(data).eq("id", id).select().maybeSingle();
  if (error) throw new Error(error.message);
  return (updated as Vehicle) ?? undefined;
}

export async function listRoutes(): Promise<Route[]> {
  if (isDemoMode()) return demoStore.listRoutes();
  const supabase = await createClient();
  const { data, error } = await supabase.from("routes").select("*").order("name");
  if (error) throw error;
  return data as Route[];
}

export async function createRoute(input: Omit<Route, "id" | "school_id"> & { schoolId: string }): Promise<Route> {
  const { schoolId, ...rest } = input;
  if (isDemoMode()) return demoStore.createRoute(rest);
  const supabase = await createClient();
  const { data, error } = await supabase.from("routes").insert({ school_id: schoolId, ...rest }).select().single();
  if (error) throw new Error(error.message);
  return data as Route;
}

export async function updateRoute(id: string, data: Partial<Route>): Promise<Route | undefined> {
  if (isDemoMode()) return demoStore.updateRoute(id, data);
  const supabase = await createClient();
  const { data: updated, error } = await supabase.from("routes").update(data).eq("id", id).select().maybeSingle();
  if (error) throw new Error(error.message);
  return (updated as Route) ?? undefined;
}

export async function listRouteStops(routeId?: string): Promise<RouteStop[]> {
  if (isDemoMode()) return demoStore.listRouteStops(routeId);
  const supabase = await createClient();
  let query = supabase.from("route_stops").select("*").order("stop_order");
  if (routeId) query = query.eq("route_id", routeId);
  const { data, error } = await query;
  if (error) throw error;
  return data as RouteStop[];
}

export async function createRouteStop(input: Omit<RouteStop, "id" | "school_id"> & { schoolId: string }): Promise<RouteStop> {
  const { schoolId, ...rest } = input;
  if (isDemoMode()) return demoStore.createRouteStop(rest);
  const supabase = await createClient();
  const { data, error } = await supabase.from("route_stops").insert({ school_id: schoolId, ...rest }).select().single();
  if (error) throw new Error(error.message);
  return data as RouteStop;
}

export async function listRouteStudents(): Promise<StudentTransportAssignment[]> {
  if (isDemoMode()) return demoStore.listRouteStudents();
  const supabase = await createClient();
  const { data, error } = await supabase.from("route_students").select("*").order("start_date", { ascending: false });
  if (error) throw error;
  return data as StudentTransportAssignment[];
}

/** Assigns a student to a route (and optionally a stop). The DB trigger
 * `guard_route_capacity` rejects this if the route's vehicle is already
 * full; the unique partial index on (student_id) where status='active'
 * means a student can only ever have one active assignment; this
 * function ends any prior active assignment first so re-assigning a
 * student to a new route is a normal update, not a conflict. */
export async function assignStudentToRoute(input: {
  schoolId: string;
  routeId: string;
  studentId: string;
  stopId?: string | null;
  createdBy: string;
}): Promise<StudentTransportAssignment> {
  if (isDemoMode()) {
    return demoStore.assignStudentToRoute({ routeId: input.routeId, studentId: input.studentId, stopId: input.stopId, createdBy: input.createdBy });
  }
  const supabase = await createClient();
  await supabase
    .from("route_students")
    .update({ status: "ended", end_date: new Date().toISOString().slice(0, 10) })
    .eq("student_id", input.studentId)
    .eq("status", "active");

  const stop = input.stopId ? await supabase.from("route_stops").select("stop_name").eq("id", input.stopId).maybeSingle() : null;

  const { data, error } = await supabase
    .from("route_students")
    .insert({
      school_id: input.schoolId,
      route_id: input.routeId,
      student_id: input.studentId,
      stop_id: input.stopId ?? null,
      stop_name: stop?.data?.stop_name ?? null,
      created_by: input.createdBy,
    })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as StudentTransportAssignment;
}

export async function endRouteAssignment(id: string): Promise<StudentTransportAssignment | undefined> {
  if (isDemoMode()) return demoStore.endRouteAssignment(id);
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("route_students")
    .update({ status: "ended", end_date: new Date().toISOString().slice(0, 10) })
    .eq("id", id)
    .select()
    .maybeSingle();
  if (error) throw new Error(error.message);
  return (data as StudentTransportAssignment) ?? undefined;
}
