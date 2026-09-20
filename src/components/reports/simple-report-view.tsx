"use client";

import { Card, CardHeader, EmptyState } from "@/components/ui/card";
import { ExportBar } from "@/components/finance/export-bar";

export interface SimpleReportColumn {
  key: string;
  label: string;
  format?: (value: unknown) => string;
}

/** A generic "listing" report view: a title, an export bar (CSV/Excel/
 * Print, all built from the same rows), and a plain table. Used for the
 * library/transport/inventory reports, which — unlike the finance
 * reports — are simple filtered listings over already-loaded data with
 * no per-report filter UI of their own. */
export function SimpleReportView({
  title,
  columns,
  rows,
  filenameBase,
  printHref,
  emptyLabel = "No records for this report.",
}: {
  title: string;
  columns: SimpleReportColumn[];
  rows: Record<string, unknown>[];
  filenameBase: string;
  printHref: string;
  emptyLabel?: string;
}) {
  const format = (col: SimpleReportColumn, value: unknown) => (col.format ? col.format(value) : String(value ?? "—"));
  const exportRows = rows.map((r) => columns.map((c) => format(c, r[c.key])));

  return (
    <Card>
      <CardHeader
        title={title}
        action={
          <ExportBar
            filenameBase={filenameBase}
            sheetName={title.slice(0, 31)}
            headers={columns.map((c) => c.label)}
            rows={exportRows}
            printHref={printHref}
          />
        }
      />
      {rows.length === 0 ? (
        <EmptyState label={emptyLabel} />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border text-xs uppercase tracking-wide text-muted">
                {columns.map((c) => (
                  <th key={c.key} className="px-4 py-2.5 font-medium">{c.label}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((r, i) => (
                <tr key={i} className="hover:bg-background/60">
                  {columns.map((c) => (
                    <td key={c.key} className="px-4 py-3">{format(c, r[c.key])}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
