"use client";

import { useActionForm } from "@/lib/hooks/use-action-form";
import type { Book, LibraryCategory } from "@/types/database";

const CONDITIONS = ["new", "good", "fair", "damaged"];
const LANGUAGES = ["English", "Urdu", "Bilingual"];

export function BookForm({
  categories,
  defaultValues,
  submitLabel = "Add Book",
  showStatus = false,
  action,
}: {
  categories: LibraryCategory[];
  defaultValues?: Book;
  submitLabel?: string;
  showStatus?: boolean;
  action: (formData: FormData) => Promise<{ error?: string } | void>;
}) {
  const { error, pending, handleSubmit } = useActionForm(action);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>}

      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Title</span>
          <input name="title" required defaultValue={defaultValues?.title} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Urdu Title (optional)</span>
          <input name="title_urdu" dir="rtl" defaultValue={defaultValues?.title_urdu ?? ""} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
        </label>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Author</span>
          <input name="author" defaultValue={defaultValues?.author ?? ""} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Publisher</span>
          <input name="publisher" defaultValue={defaultValues?.publisher ?? ""} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
        </label>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <label className="block">
          <span className="mb-1 block text-sm font-medium">ISBN</span>
          <input name="isbn" defaultValue={defaultValues?.isbn ?? ""} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Accession Number</span>
          <input name="accession_number" defaultValue={defaultValues?.accession_number ?? ""} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Edition</span>
          <input name="edition" defaultValue={defaultValues?.edition ?? ""} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
        </label>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Category</span>
          <select name="category_id" defaultValue={defaultValues?.category_id ?? ""} onChange={(e) => {
            const form = e.currentTarget.form!;
            const hidden = form.elements.namedItem("category") as HTMLInputElement;
            const label = e.currentTarget.selectedOptions[0]?.text ?? "";
            if (hidden) hidden.value = e.target.value ? label : "";
          }} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary">
            <option value="">Uncategorized</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <input type="hidden" name="category" defaultValue={defaultValues?.category ?? ""} />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Language</span>
          <select name="language" defaultValue={defaultValues?.language ?? "English"} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary">
            {LANGUAGES.map((l) => <option key={l} value={l}>{l}</option>)}
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Publication Year</span>
          <input name="publication_year" type="number" defaultValue={defaultValues?.publication_year ?? ""} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
        </label>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {!defaultValues && (
          <label className="block">
            <span className="mb-1 block text-sm font-medium">Quantity</span>
            <input name="total_copies" type="number" min={1} defaultValue={1} required className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
          </label>
        )}
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Shelf / Rack</span>
          <input name="shelf_location" defaultValue={defaultValues?.shelf_location ?? ""} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Price (PKR)</span>
          <input name="price" type="number" step="0.01" defaultValue={defaultValues?.price ?? ""} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
        </label>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Condition</span>
          <select name="condition" defaultValue={defaultValues?.condition ?? "good"} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary">
            {CONDITIONS.map((c) => <option key={c} value={c}>{c[0].toUpperCase() + c.slice(1)}</option>)}
          </select>
        </label>
        {showStatus && (
          <label className="block">
            <span className="mb-1 block text-sm font-medium">Status</span>
            <select name="status" defaultValue={defaultValues?.status ?? "active"} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary">
              <option value="active">Active</option>
              <option value="archived">Archived</option>
            </select>
          </label>
        )}
      </div>

      <label className="block">
        <span className="mb-1 block text-sm font-medium">Cover Image URL (optional)</span>
        <input name="cover_image_url" placeholder="https://…" defaultValue={defaultValues?.cover_image_url ?? ""} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
      </label>

      <label className="block">
        <span className="mb-1 block text-sm font-medium">Description</span>
        <textarea name="description" rows={2} defaultValue={defaultValues?.description ?? ""} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
      </label>

      <button type="submit" disabled={pending} className="rounded-lg bg-primary px-5 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60">
        {pending ? "Saving…" : submitLabel}
      </button>
    </form>
  );
}
