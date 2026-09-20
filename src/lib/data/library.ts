import "server-only";
import { isDemoMode } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import { demoStore } from "@/lib/demo/store";
import type { Book, BookIssue, LibraryCategory, LibrarySettings } from "@/types/database";

export async function listBooks(): Promise<Book[]> {
  if (isDemoMode()) return demoStore.listBooks();
  const supabase = await createClient();
  const { data, error } = await supabase.from("books").select("*").order("title");
  if (error) throw error;
  return data as Book[];
}

export async function getBook(id: string): Promise<Book | undefined> {
  if (isDemoMode()) return demoStore.getBook(id);
  const supabase = await createClient();
  const { data, error } = await supabase.from("books").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return (data as Book) ?? undefined;
}

export async function createBook(input: Omit<Book, "id" | "school_id"> & { schoolId: string }): Promise<Book> {
  const { schoolId, ...rest } = input;
  if (isDemoMode()) return demoStore.createBook(rest);
  const supabase = await createClient();
  const { data, error } = await supabase.from("books").insert({ school_id: schoolId, ...rest }).select().single();
  if (error) throw new Error(error.message);
  return data as Book;
}

export async function updateBook(id: string, data: Partial<Book>): Promise<Book | undefined> {
  if (isDemoMode()) return demoStore.updateBook(id, data);
  const supabase = await createClient();
  const { data: updated, error } = await supabase.from("books").update(data).eq("id", id).select().maybeSingle();
  if (error) throw new Error(error.message);
  return (updated as Book) ?? undefined;
}

export async function listLibraryCategories(): Promise<LibraryCategory[]> {
  if (isDemoMode()) return demoStore.listLibraryCategories();
  const supabase = await createClient();
  const { data, error } = await supabase.from("library_categories").select("*").order("name");
  if (error) throw error;
  return data as LibraryCategory[];
}

export async function createLibraryCategory(schoolId: string, name: string): Promise<LibraryCategory> {
  if (isDemoMode()) return demoStore.createLibraryCategory(name);
  const supabase = await createClient();
  const { data, error } = await supabase.from("library_categories").insert({ school_id: schoolId, name }).select().single();
  if (error) throw new Error(error.message);
  return data as LibraryCategory;
}

export async function getLibrarySettings(schoolId: string): Promise<LibrarySettings> {
  if (isDemoMode()) return demoStore.getLibrarySettings();
  const supabase = await createClient();
  const { data, error } = await supabase.from("library_settings").select("*").eq("school_id", schoolId).maybeSingle();
  if (error) throw error;
  if (data) return data as LibrarySettings;
  const { data: created, error: createErr } = await supabase.from("library_settings").insert({ school_id: schoolId }).select().single();
  if (createErr) throw new Error(createErr.message);
  return created as LibrarySettings;
}

export async function updateLibrarySettings(schoolId: string, data: Partial<Omit<LibrarySettings, "id" | "school_id">>): Promise<LibrarySettings> {
  if (isDemoMode()) return demoStore.updateLibrarySettings(data);
  const supabase = await createClient();
  await getLibrarySettings(schoolId); // ensures the singleton row exists
  const { data: updated, error } = await supabase.from("library_settings").update(data).eq("school_id", schoolId).select().single();
  if (error) throw new Error(error.message);
  return updated as LibrarySettings;
}

export async function listBookIssues(): Promise<BookIssue[]> {
  if (isDemoMode()) return demoStore.listBookIssues();
  const supabase = await createClient();
  const { data, error } = await supabase.from("book_issues").select("*").order("issue_date", { ascending: false });
  if (error) throw error;
  return data as BookIssue[];
}

export async function getBookIssue(id: string): Promise<BookIssue | undefined> {
  if (isDemoMode()) return demoStore.getBookIssue(id);
  const supabase = await createClient();
  const { data, error } = await supabase.from("book_issues").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return (data as BookIssue) ?? undefined;
}

/** Issues a book to a student or teacher. Throws if no copies are
 * available — the caller (a server action) turns that into a friendly
 * form error. */
export async function issueBook(input: {
  schoolId: string;
  bookId: string;
  studentId?: string | null;
  teacherId?: string | null;
  dueDate: string;
  issuedBy: string;
}): Promise<BookIssue> {
  if (isDemoMode()) {
    return demoStore.issueBook({
      bookId: input.bookId,
      studentId: input.studentId,
      teacherId: input.teacherId,
      dueDate: input.dueDate,
      issuedBy: input.issuedBy,
    });
  }
  const supabase = await createClient();
  const { data: book, error: bookErr } = await supabase.from("books").select("available_copies").eq("id", input.bookId).single();
  if (bookErr) throw new Error(bookErr.message);
  if (!book || book.available_copies <= 0) throw new Error("No copies of this book are currently available.");

  const { error: decErr } = await supabase.from("books").update({ available_copies: book.available_copies - 1 }).eq("id", input.bookId);
  if (decErr) throw new Error(decErr.message);

  const { data, error } = await supabase
    .from("book_issues")
    .insert({
      school_id: input.schoolId,
      book_id: input.bookId,
      student_id: input.studentId ?? null,
      teacher_id: input.teacherId ?? null,
      due_date: input.dueDate,
      issued_by: input.issuedBy,
    })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as BookIssue;
}

export async function returnBook(
  issueId: string,
  input: { returnedBy: string; condition?: string; remarks?: string; fineAmount: number }
): Promise<BookIssue> {
  if (isDemoMode()) return demoStore.returnBook(issueId, input);
  const supabase = await createClient();
  const { data: issue, error: issueErr } = await supabase.from("book_issues").select("*").eq("id", issueId).single();
  if (issueErr) throw new Error(issueErr.message);
  if (!issue || issue.status === "returned") throw new Error("This book has already been returned.");

  const { data: book, error: bookErr } = await supabase.from("books").select("available_copies, total_copies").eq("id", issue.book_id).single();
  if (bookErr) throw new Error(bookErr.message);
  const nextAvailable = Math.min((book?.available_copies ?? 0) + 1, book?.total_copies ?? Infinity);
  await supabase.from("books").update({ available_copies: nextAvailable }).eq("id", issue.book_id);

  const { data, error } = await supabase
    .from("book_issues")
    .update({
      return_date: new Date().toISOString().slice(0, 10),
      returned_by: input.returnedBy,
      condition_at_return: input.condition ?? null,
      remarks: input.remarks ?? null,
      fine_amount: input.fineAmount,
      status: "returned",
    })
    .eq("id", issueId)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as BookIssue;
}
