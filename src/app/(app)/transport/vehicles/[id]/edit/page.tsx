import { notFound, redirect } from "next/navigation";
import { getSession, isSchoolAdmin } from "@/lib/auth/session";
import { listVehicles, listDrivers } from "@/lib/data/transport";
import { Card } from "@/components/ui/card";
import { VehicleForm } from "@/components/transport/vehicle-form";
import { updateVehicleAction } from "../../../actions";

export default async function EditVehiclePage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!isSchoolAdmin(session.profile.role)) redirect("/transport/vehicles");

  const { id } = await params;
  const [vehicles, drivers] = await Promise.all([listVehicles(), listDrivers()]);
  const vehicle = vehicles.find((v) => v.id === id);
  if (!vehicle) notFound();

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div>
        <h1 className="text-xl font-semibold">Edit Vehicle</h1>
        <p className="text-sm text-muted">{vehicle.vehicle_number}</p>
      </div>
      <Card className="p-5 sm:p-6">
        <VehicleForm drivers={drivers} defaultValues={vehicle} submitLabel="Save Changes" showStatus action={updateVehicleAction.bind(null, id)} />
      </Card>
    </div>
  );
}
