import { redirect } from "next/navigation";
import { getSession, isSchoolAdmin } from "@/lib/auth/session";
import { listDrivers } from "@/lib/data/transport";
import { Card } from "@/components/ui/card";
import { VehicleForm } from "@/components/transport/vehicle-form";
import { createVehicleAction } from "../../actions";

export default async function NewVehiclePage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!isSchoolAdmin(session.profile.role)) redirect("/transport/vehicles");

  const drivers = await listDrivers();

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div>
        <h1 className="text-xl font-semibold">Add Vehicle</h1>
      </div>
      <Card className="p-5 sm:p-6">
        <VehicleForm drivers={drivers} action={createVehicleAction} />
      </Card>
    </div>
  );
}
