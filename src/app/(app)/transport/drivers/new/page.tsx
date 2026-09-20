import { redirect } from "next/navigation";
import { getSession, isSchoolAdmin } from "@/lib/auth/session";
import { Card } from "@/components/ui/card";
import { DriverForm } from "@/components/transport/driver-form";
import { createDriverAction } from "../../actions";

export default async function NewDriverPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!isSchoolAdmin(session.profile.role)) redirect("/transport/drivers");

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div>
        <h1 className="text-xl font-semibold">Add Driver</h1>
      </div>
      <Card className="p-5 sm:p-6">
        <DriverForm action={createDriverAction} />
      </Card>
    </div>
  );
}
