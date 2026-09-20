"use client";

import { useState } from "react";
import { useActionForm } from "@/lib/hooks/use-action-form";
import type { InventoryTransactionType } from "@/types/database";

const TYPES: { value: InventoryTransactionType; label: string }[] = [
  { value: "stock_in", label: "Stock In" },
  { value: "stock_out", label: "Stock Out" },
  { value: "assignment", label: "Assignment" },
  { value: "return", label: "Return" },
  { value: "transfer", label: "Transfer" },
  { value: "adjustment", label: "Adjustment" },
  { value: "repair", label: "Repair" },
  { value: "dispose", label: "Dispose" },
];

export function TransactionForm({ action }: { action: (formData: FormData) => Promise<{ error?: string } | void> }) {
  const { error, pending, handleSubmit } = useActionForm(action);
  const [type, setType] = useState<InventoryTransactionType>("stock_in");

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>}
      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Transaction Type</span>
          <select name="transaction_type" value={type} onChange={(e) => setType(e.target.value as InventoryTransactionType)} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary">
            {TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Quantity</span>
          <input name="quantity" type="number" min={1} required defaultValue={1} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
        </label>
      </div>

      {type === "assignment" && (
        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="mb-1 block text-sm font-medium">Assigned To</span>
            <select name="assigned_to_type" className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary">
              <option value="teacher">Teacher</option>
              <option value="staff">Staff Member</option>
              <option value="department">Department</option>
              <option value="room">Room</option>
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium">Name / Label</span>
            <input name="assigned_to_label" required placeholder="e.g. Ayesha Siddiqui, or Room 5" className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
          </label>
        </div>
      )}

      {type === "transfer" && (
        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="mb-1 block text-sm font-medium">From Location</span>
            <input name="from_location" className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium">To Location</span>
            <input name="to_location" required className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
          </label>
        </div>
      )}

      <label className="block">
        <span className="mb-1 block text-sm font-medium">Reason / Notes</span>
        <input name="reason" className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
      </label>

      <button type="submit" disabled={pending} className="rounded-lg bg-primary px-5 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60">
        {pending ? "Recording…" : "Record Transaction"}
      </button>
    </form>
  );
}
