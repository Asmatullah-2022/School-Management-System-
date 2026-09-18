import { redirect } from "next/navigation";
import { getSession, isFinanceStaff, isSchoolAdmin } from "@/lib/auth/session";
import { listDiscounts, listScholarships } from "@/lib/data/finance";
import { listClasses, listSections } from "@/lib/data/academics";
import { listStudents } from "@/lib/data/students";
import { Card, CardHeader } from "@/components/ui/card";
import { DiscountsPanel, ScholarshipsPanel } from "@/components/finance/discounts-panel";
import { createDiscountAction, toggleDiscountAction, createScholarshipAction, decideScholarshipAction } from "./actions";

export default async function DiscountsPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!isFinanceStaff(session.profile.role)) redirect("/fees");

  const [discounts, scholarships, classes, sections, students] = await Promise.all([
    listDiscounts(),
    listScholarships(),
    listClasses(),
    listSections(),
    listStudents(),
  ]);

  const canApprove = isSchoolAdmin(session.profile.role);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold">Discounts & Scholarships</h1>
        <p className="text-sm text-muted">
          Discounts apply automatically at fee generation time. Scholarships require School Admin approval before they take effect.
        </p>
      </div>

      <Card>
        <CardHeader title="Discounts" />
        <div className="p-4">
          <DiscountsPanel discounts={discounts} classes={classes} sections={sections} canManage createAction={createDiscountAction} toggleAction={toggleDiscountAction} />
        </div>
      </Card>

      <Card>
        <CardHeader title="Scholarships / Concessions" />
        <div className="p-4">
          <ScholarshipsPanel
            scholarships={scholarships}
            students={students}
            canPropose
            canApprove={canApprove}
            createAction={createScholarshipAction}
            decideAction={decideScholarshipAction}
          />
        </div>
      </Card>
    </div>
  );
}
