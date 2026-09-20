import { notFound, redirect } from "next/navigation";
import { getSession, isSchoolAdmin } from "@/lib/auth/session";
import { getBook, listLibraryCategories } from "@/lib/data/library";
import { Card } from "@/components/ui/card";
import { BookForm } from "@/components/library/book-form";
import { updateBookAction } from "../../../actions";

export default async function EditBookPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!isSchoolAdmin(session.profile.role)) redirect("/library/books");

  const { id } = await params;
  const [book, categories] = await Promise.all([getBook(id), listLibraryCategories()]);
  if (!book) notFound();

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div>
        <h1 className="text-xl font-semibold">Edit Book</h1>
        <p className="text-sm text-muted">{book.title}</p>
      </div>
      <Card className="p-5 sm:p-6">
        <BookForm categories={categories} defaultValues={book} submitLabel="Save Changes" showStatus action={updateBookAction.bind(null, id)} />
      </Card>
    </div>
  );
}
