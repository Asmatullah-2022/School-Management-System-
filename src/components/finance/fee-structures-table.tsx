"use client";

import Link from "next/link";
import { useTransition } from "react";
import { Pencil, Copy, Ban, CheckCircle2 } from "lucide-react";
import { DataTable, type Column } from "@/components/data-table";
import type { FeeStructure, SchoolClass } from "@/types/database";

export function FeeStructuresTable({
  structures,
  classes,
  canManage,
  duplicateAction,
  toggleAction,
}: {
  structures: FeeStructure[];
  classes: SchoolClass[];
  canManage: boolean;
  duplicateAction: (id: string) => Promise<void>;
  toggleAction: (id: string, isActive: boolean) => Promise<void>;
}) {
  const [pending, startTransition] = useTransition();

  const columns: Column<FeeStructure>[] = [
    { key: "name", header: "Fee Name", render: (f) => <span className="font-medium">{f.name}</span> },
    { key: "type", header: "Type", render: (f) => <span className="capitalize">{f.fee_type}</span>, hideOnMobile: true },
    { key: "class", header: "Class", render: (f) => classes.find((c) => c.id === f.class_id)?.name ?? "All classes" },
    { key: "frequency", header: "Frequency", render: (f) => <span className="capitalize">{f.frequency.replace("_", " ")}</span>, hideOnMobile: true },
    { key: "amount", header: "Amount", render: (f) => `PKR ${f.amount.toLocaleString()}` },
    {
      key: "status",
      header: "Status",
      render: (f) => (
        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${f.is_active ? "bg-success/10 text-success" : "bg-muted/10 text-muted"}`}>
          {f.is_active ? "Active" : "Inactive"}
        </span>
      ),
    },
    ...(canManage
      ? [
          {
            key: "actions",
            header: "",
            render: (f: FeeStructure) => (
              <div className="flex items-center justify-end gap-1">
                <Link href={`/fees/structures/${f.id}/edit`} className="rounded-md p-1.5 text-muted hover:bg-background hover:text-primary" aria-label="Edit">
                  <Pencil size={14} />
                </Link>
                <button
                  disabled={pending}
                  onClick={() => startTransition(() => duplicateAction(f.id))}
                  className="rounded-md p-1.5 text-muted hover:bg-background hover:text-primary"
                  aria-label="Duplicate"
                >
                  <Copy size={14} />
                </button>
                <button
                  disabled={pending}
                  onClick={() => startTransition(() => toggleAction(f.id, !f.is_active))}
                  className="rounded-md p-1.5 text-muted hover:bg-background hover:text-danger"
                  aria-label={f.is_active ? "Deactivate" : "Activate"}
                >
                  {f.is_active ? <Ban size={14} /> : <CheckCircle2 size={14} />}
                </button>
              </div>
            ),
          },
        ]
      : []),
  ];

  return (
    <DataTable
      columns={columns}
      rows={structures}
      rowKey={(f) => f.id}
      searchKeys={(f) => `${f.name} ${f.fee_type}`}
      emptyLabel="No fee structures yet."
    />
  );
}
