import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus } from "lucide-react";
import { getSession, isSchoolAdmin } from "@/lib/auth/session";
import { listBooks } from "@/lib/data/library";
import { Card } from "@/components/ui/card";
import { BooksTable } from "@/components/library/books-table";

export default async function BooksPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const books = await listBooks();
  const isAdmin = isSchoolAdmin(session.profile.role);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold">Book Management</h1>
          <p className="text-sm text-muted">{books.length} titles in the catalog</p>
        </div>
        {isAdmin && (
          <Link
            href="/library/books/new"
            className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            <Plus size={16} /> Add Book
          </Link>
        )}
      </div>

      <Card>
        <BooksTable books={books} canManage={isAdmin} />
      </Card>
    </div>
  );
}
