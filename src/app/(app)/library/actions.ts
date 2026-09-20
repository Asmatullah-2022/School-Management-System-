"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSession, isSchoolAdmin } from "@/lib/auth/session";
import { createBook, updateBook, createLibraryCategory, updateLibrarySettings, issueBook, returnBook, getBookIssue, getLibrarySettings } from "@/lib/data/library";
import { computeFine } from "@/lib/library/fines";
import { recordAuditLog } from "@/lib/audit/log";
import type { Book } from "@/types/database";

export async function createBookAction(formData: FormData): Promise<{ error?: string } | void> {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!isSchoolAdmin(session.profile.role)) return { error: "Only administrators can manage the library catalog." };

  const title = String(formData.get("title") ?? "").trim();
  if (!title) return { error: "Title is required." };
  const totalCopies = Math.max(1, Number(formData.get("total_copies") ?? 1));

  let book: Book;
  try {
    book = await createBook({
      schoolId: session.school.id,
      title,
      title_urdu: String(formData.get("title_urdu") ?? "").trim() || null,
      author: String(formData.get("author") ?? "").trim() || null,
      isbn: String(formData.get("isbn") ?? "").trim() || null,
      accession_number: String(formData.get("accession_number") ?? "").trim() || null,
      publisher: String(formData.get("publisher") ?? "").trim() || null,
      edition: String(formData.get("edition") ?? "").trim() || null,
      category: String(formData.get("category") ?? "").trim() || null,
      category_id: String(formData.get("category_id") ?? "") || null,
      language: String(formData.get("language") ?? "English"),
      publication_year: formData.get("publication_year") ? Number(formData.get("publication_year")) : null,
      total_copies: totalCopies,
      available_copies: totalCopies,
      shelf_location: String(formData.get("shelf_location") ?? "").trim() || null,
      price: formData.get("price") ? Number(formData.get("price")) : null,
      condition: (String(formData.get("condition") ?? "good")) as Book["condition"],
      description: String(formData.get("description") ?? "").trim() || null,
      cover_image_url: String(formData.get("cover_image_url") ?? "").trim() || null,
      status: "active",
      created_by: session.profile.id,
    });
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Could not add book." };
  }

  await recordAuditLog({ schoolId: session.school.id, profileId: session.profile.id, action: "book.added", targetTable: "books", targetId: book.id, metadata: { title: book.title } });
  revalidatePath("/library/books");
  redirect("/library/books");
}

export async function updateBookAction(id: string, formData: FormData): Promise<{ error?: string } | void> {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!isSchoolAdmin(session.profile.role)) return { error: "Only administrators can manage the library catalog." };

  const title = String(formData.get("title") ?? "").trim();
  if (!title) return { error: "Title is required." };

  try {
    await updateBook(id, {
      title,
      title_urdu: String(formData.get("title_urdu") ?? "").trim() || null,
      author: String(formData.get("author") ?? "").trim() || null,
      isbn: String(formData.get("isbn") ?? "").trim() || null,
      accession_number: String(formData.get("accession_number") ?? "").trim() || null,
      publisher: String(formData.get("publisher") ?? "").trim() || null,
      edition: String(formData.get("edition") ?? "").trim() || null,
      category: String(formData.get("category") ?? "").trim() || null,
      category_id: String(formData.get("category_id") ?? "") || null,
      language: String(formData.get("language") ?? "English"),
      publication_year: formData.get("publication_year") ? Number(formData.get("publication_year")) : null,
      shelf_location: String(formData.get("shelf_location") ?? "").trim() || null,
      price: formData.get("price") ? Number(formData.get("price")) : null,
      condition: (String(formData.get("condition") ?? "good")) as Book["condition"],
      description: String(formData.get("description") ?? "").trim() || null,
      cover_image_url: String(formData.get("cover_image_url") ?? "").trim() || null,
      status: (String(formData.get("status") ?? "active")) as Book["status"],
    });
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Could not update book." };
  }

  revalidatePath("/library/books");
  redirect("/library/books");
}

export async function createLibraryCategoryAction(formData: FormData): Promise<{ error?: string } | void> {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!isSchoolAdmin(session.profile.role)) return { error: "Only administrators can manage categories." };
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { error: "Category name is required." };
  try {
    await createLibraryCategory(session.school.id, name);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Could not create category." };
  }
  revalidatePath("/library/categories");
}

export async function updateLibrarySettingsAction(formData: FormData): Promise<{ error?: string } | void> {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!isSchoolAdmin(session.profile.role)) return { error: "Only administrators can update library settings." };

  try {
    await updateLibrarySettings(session.school.id, {
      fine_per_day: Number(formData.get("fine_per_day") ?? 10),
      grace_period_days: Number(formData.get("grace_period_days") ?? 0),
      max_fine: formData.get("max_fine") ? Number(formData.get("max_fine")) : null,
      default_loan_days: Number(formData.get("default_loan_days") ?? 14),
    });
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Could not update settings." };
  }
  revalidatePath("/library/settings");
}

export async function issueBookAction(formData: FormData): Promise<{ error?: string } | void> {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!isSchoolAdmin(session.profile.role) && session.profile.role !== "teacher") {
    return { error: "Only staff may issue library books." };
  }

  const bookId = String(formData.get("book_id") ?? "");
  const borrowerType = String(formData.get("borrower_type") ?? "student");
  const borrowerId = String(formData.get("borrower_id") ?? "");
  if (!bookId || !borrowerId) return { error: "Book and borrower are required." };

  const settings = await getLibrarySettings(session.school.id);
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + settings.default_loan_days);

  try {
    const issue = await issueBook({
      schoolId: session.school.id,
      bookId,
      studentId: borrowerType === "student" ? borrowerId : null,
      teacherId: borrowerType === "teacher" ? borrowerId : null,
      dueDate: dueDate.toISOString().slice(0, 10),
      issuedBy: session.profile.id,
    });
    await recordAuditLog({ schoolId: session.school.id, profileId: session.profile.id, action: "book.issued", targetTable: "book_issues", targetId: issue.id, metadata: { bookId, borrowerId, borrowerType } });
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Could not issue this book." };
  }

  revalidatePath("/library/circulation");
  revalidatePath("/library/books");
}

export async function returnBookAction(issueId: string, formData: FormData): Promise<{ error?: string } | void> {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!isSchoolAdmin(session.profile.role) && session.profile.role !== "teacher") {
    return { error: "Only staff may process a book return." };
  }

  const issue = await getBookIssue(issueId);
  if (!issue) return { error: "Issue record not found." };
  const settings = await getLibrarySettings(session.school.id);
  const fine = computeFine(issue, settings, new Date().toISOString().slice(0, 10));

  try {
    await returnBook(issueId, {
      returnedBy: session.profile.id,
      condition: String(formData.get("condition") ?? "").trim() || undefined,
      remarks: String(formData.get("remarks") ?? "").trim() || undefined,
      fineAmount: fine,
    });
    await recordAuditLog({ schoolId: session.school.id, profileId: session.profile.id, action: "book.returned", targetTable: "book_issues", targetId: issueId, metadata: { fine } });
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Could not process this return." };
  }

  revalidatePath("/library/circulation");
  revalidatePath("/library/books");
}
