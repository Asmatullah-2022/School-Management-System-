import { redirect } from "next/navigation";
import { getSession, isSchoolAdmin } from "@/lib/auth/session";
import { listClasses } from "@/lib/data/academics";
import { Card } from "@/components/ui/card";
import { NoticeForm } from "@/components/notices/notice-form";
import { createNoticeAction } from "../actions";

export default async function NewNoticePage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!isSchoolAdmin(session.profile.role)) redirect("/notices");

  const classes = await listClasses();

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div>
        <h1 className="text-xl font-semibold">Publish Notice</h1>
        <p className="text-sm text-muted">Targeted users will be notified once the notice is published.</p>
      </div>
      <Card className="p-5 sm:p-6">
        <NoticeForm classes={classes} action={createNoticeAction} />
      </Card>
    </div>
  );
}
