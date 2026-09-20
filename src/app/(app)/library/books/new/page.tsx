import { redirect } from "next/navigation";
import { getSession, isSchoolAdmin } from "@/lib/auth/session";
import { listLibraryCategories } from "@/lib/data/library";
import { Card } from "@/components/ui/card";
import { BookForm } from "@/components/library/book-form";
import { createBookAction } from "../../actions";

export default async function NewBookPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!isSchoolAdmin(session.profile.role)) redirect("/library/books");

  const categories = await listLibraryCategories();

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div>
        <h1 className="text-xl font-semibold">Add Book</h1>
        <p className="text-sm text-muted">Add a new title to the library catalog.</p>
      </div>
      <Card className="p-5 sm:p-6">
        <BookForm categories={categories} action={createBookAction} />
      </Card>
    </div>
  );
}
