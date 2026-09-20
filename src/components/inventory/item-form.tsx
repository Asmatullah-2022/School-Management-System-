"use client";

import { useActionForm } from "@/lib/hooks/use-action-form";
import type { InventoryCategory, InventoryItem, InventoryLocation } from "@/types/database";

const CONDITIONS = ["new", "good", "fair", "damaged", "under_repair"];

export function ItemForm({
  categories,
  locations,
  defaultValues,
  submitLabel = "Add Item",
  action,
}: {
  categories: InventoryCategory[];
  locations: InventoryLocation[];
  defaultValues?: InventoryItem;
  submitLabel?: string;
  action: (formData: FormData) => Promise<{ error?: string } | void>;
}) {
  const { error, pending, handleSubmit } = useActionForm(action);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>}
      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Asset Code</span>
          <input name="asset_id" required defaultValue={defaultValues?.asset_id} disabled={!!defaultValues} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary disabled:opacity-60" />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Item Name</span>
          <input name="name" required defaultValue={defaultValues?.name} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
        </label>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Category</span>
          <select name="category_id" defaultValue={defaultValues?.category_id ?? ""} onChange={(e) => {
            const form = e.currentTarget.form!;
            const hidden = form.elements.namedItem("category") as HTMLInputElement;
            if (hidden) hidden.value = e.target.selectedOptions[0]?.text ?? "";
          }} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary">
            <option value="">Uncategorized</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <input type="hidden" name="category" defaultValue={defaultValues?.category ?? ""} />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Location</span>
          <select name="location_id" defaultValue={defaultValues?.location_id ?? ""} onChange={(e) => {
            const form = e.currentTarget.form!;
            const hidden = form.elements.namedItem("location") as HTMLInputElement;
            if (hidden) hidden.value = e.target.selectedOptions[0]?.text ?? "";
          }} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary">
            <option value="">Unspecified</option>
            {locations.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
          </select>
          <input type="hidden" name="location" defaultValue={defaultValues?.location ?? ""} />
        </label>
      </div>

      {!defaultValues && (
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Initial Quantity</span>
          <input name="quantity" type="number" min={0} defaultValue={1} required className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
        </label>
      )}

      <div className="grid grid-cols-3 gap-3">
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Unit Cost (PKR)</span>
          <input name="cost" type="number" step="0.01" min={0} defaultValue={defaultValues?.cost ?? ""} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Purchase Date</span>
          <input name="purchase_date" type="date" defaultValue={defaultValues?.purchase_date ?? ""} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Minimum Stock</span>
          <input name="minimum_stock" type="number" min={0} defaultValue={defaultValues?.minimum_stock ?? ""} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
        </label>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Supplier</span>
          <input name="supplier" defaultValue={defaultValues?.supplier ?? ""} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Warranty Expiry</span>
          <input name="warranty_expiry" type="date" defaultValue={defaultValues?.warranty_expiry ?? ""} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
        </label>
      </div>

      <label className="block">
        <span className="mb-1 block text-sm font-medium">Condition</span>
        <select name="condition" defaultValue={defaultValues?.condition ?? "new"} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary">
          {CONDITIONS.map((c) => <option key={c} value={c}>{c.replace("_", " ").replace(/\b\w/g, (ch) => ch.toUpperCase())}</option>)}
        </select>
      </label>

      <label className="block">
        <span className="mb-1 block text-sm font-medium">Description</span>
        <textarea name="description" rows={2} defaultValue={defaultValues?.description ?? ""} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
      </label>
      <label className="block">
        <span className="mb-1 block text-sm font-medium">Notes</span>
        <textarea name="notes" rows={2} defaultValue={defaultValues?.notes ?? ""} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
      </label>

      <button type="submit" disabled={pending} className="rounded-lg bg-primary px-5 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60">
        {pending ? "Saving…" : submitLabel}
      </button>
    </form>
  );
}
