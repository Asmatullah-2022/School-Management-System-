import { notFound, redirect } from "next/navigation";
import { getSession, isSchoolAdmin } from "@/lib/auth/session";
import { listRoutes, listVehicles, listDrivers } from "@/lib/data/transport";
import { listFeeStructures } from "@/lib/data/finance";
import { Card } from "@/components/ui/card";
import { RouteForm } from "@/components/transport/route-form";
import { updateRouteAction } from "../../../actions";

export default async function EditRoutePage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!isSchoolAdmin(session.profile.role)) redirect("/transport/routes");

  const { id } = await params;
  const [routes, vehicles, drivers, feeStructures] = await Promise.all([listRoutes(), listVehicles(), listDrivers(), listFeeStructures()]);
  const route = routes.find((r) => r.id === id);
  if (!route) notFound();
  const transportFeeStructures = feeStructures.filter((fs) => fs.fee_type === "transport" && fs.is_active);

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div>
        <h1 className="text-xl font-semibold">Edit Route</h1>
        <p className="text-sm text-muted">{route.name}</p>
      </div>
      <Card className="p-5 sm:p-6">
        <RouteForm vehicles={vehicles} drivers={drivers} transportFeeStructures={transportFeeStructures} defaultValues={route} submitLabel="Save Changes" showStatus action={updateRouteAction.bind(null, id)} />
      </Card>
    </div>
  );
}
