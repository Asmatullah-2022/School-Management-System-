import { redirect } from "next/navigation";
import { getSession, isSchoolAdmin } from "@/lib/auth/session";
import { listVehicles, listDrivers } from "@/lib/data/transport";
import { listFeeStructures } from "@/lib/data/finance";
import { Card } from "@/components/ui/card";
import { RouteForm } from "@/components/transport/route-form";
import { createRouteAction } from "../../actions";

export default async function NewRoutePage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!isSchoolAdmin(session.profile.role)) redirect("/transport/routes");

  const [vehicles, drivers, feeStructures] = await Promise.all([listVehicles(), listDrivers(), listFeeStructures()]);
  const transportFeeStructures = feeStructures.filter((fs) => fs.fee_type === "transport" && fs.is_active);

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div>
        <h1 className="text-xl font-semibold">Create Route</h1>
      </div>
      <Card className="p-5 sm:p-6">
        <RouteForm vehicles={vehicles} drivers={drivers} transportFeeStructures={transportFeeStructures} action={createRouteAction} />
      </Card>
    </div>
  );
}
