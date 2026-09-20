import { notFound, redirect } from "next/navigation";
import { getSession, isSchoolAdmin } from "@/lib/auth/session";
import { listDrivers } from "@/lib/data/transport";
import { Card } from "@/components/ui/card";
import { DriverForm } from "@/components/transport/driver-form";
import { updateDriverAction } from "../../../actions";

export default async function EditDriverPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!isSchoolAdmin(session.profile.role)) redirect("/transport/drivers");

  const { id } = await params;
  const driver = (await listDrivers()).find((d) => d.id === id);
  if (!driver) notFound();

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div>
        <h1 className="text-xl font-semibold">Edit Driver</h1>
        <p className="text-sm text-muted">{driver.full_name}</p>
      </div>
      <Card className="p-5 sm:p-6">
        <DriverForm defaultValues={driver} submitLabel="Save Changes" showStatus action={updateDriverAction.bind(null, id)} />
      </Card>
    </div>
  );
}
