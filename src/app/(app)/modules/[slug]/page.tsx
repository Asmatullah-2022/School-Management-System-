import { Construction } from "lucide-react";
import { navSections } from "@/lib/nav";
import { Card } from "@/components/ui/card";

export default async function ModuleStubPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const href = `/modules/${slug}`;
  const item = navSections.flatMap((s) => s.items).find((i) => i.href === href);

  return (
    <div className="mx-auto flex max-w-lg flex-col items-center py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <Construction size={26} />
      </div>
      <h1 className="mt-4 text-lg font-semibold">{item?.label ?? "This module"} is coming soon</h1>
      <p className="mt-2 text-sm text-muted">
        Scheduled for <span className="font-medium">{item?.phase ?? "a future phase"}</span> of the build plan.
        The database schema for this module already exists in <code>supabase/migrations</code>; the UI will be
        wired up in that phase.
      </p>
      <Card className="mt-6 w-full p-4 text-left text-xs text-muted">
        Building in phases keeps every shipped module fully functional (real data, working CRUD, tested UI)
        instead of a half-finished mockup.
      </Card>
    </div>
  );
}
