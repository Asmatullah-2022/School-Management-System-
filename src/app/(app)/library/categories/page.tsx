import { redirect } from "next/navigation";
import { getSession, isSchoolAdmin } from "@/lib/auth/session";
import { listLibraryCategories, listBooks } from "@/lib/data/library";
import { Card, CardHeader, EmptyState } from "@/components/ui/card";
import { NewCategoryForm } from "@/components/library/new-category-form";
import { createLibraryCategoryAction } from "../actions";

export default async function LibraryCategoriesPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!isSchoolAdmin(session.profile.role)) redirect("/library");

  const [categories, books] = await Promise.all([listLibraryCategories(), listBooks()]);

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div>
        <h1 className="text-xl font-semibold">Book Categories</h1>
        <p className="text-sm text-muted">{categories.length} categories</p>
      </div>

      <Card className="p-5">
        <NewCategoryForm action={createLibraryCategoryAction} />
      </Card>

      <Card>
        <CardHeader title="All Categories" />
        {categories.length === 0 ? (
          <EmptyState label="No categories yet." />
        ) : (
          <ul className="divide-y divide-border">
            {categories.map((c) => (
              <li key={c.id} className="flex items-center justify-between px-5 py-3 text-sm">
                <span>{c.name}</span>
                <span className="text-xs text-muted">{books.filter((b) => b.category_id === c.id).length} books</span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
