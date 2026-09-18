"use client";

import Link from "next/link";
import { Download, FileSpreadsheet, Printer } from "lucide-react";
import { downloadCsv } from "@/lib/csv";
import { downloadXlsx } from "@/lib/xlsx-export";

/** CSV, Excel (.xlsx), and Print/PDF for a report — all three are real,
 * working exports built from the same rows shown on screen: CSV/Excel are
 * generated client-side from `headers`/`rows`, and Print/PDF opens the
 * matching /print/finance-report route (browser print-to-PDF), the same
 * mechanism already used for result cards and receipts elsewhere in the app. */
export function ExportBar({
  filenameBase,
  sheetName,
  headers,
  rows,
  printHref,
}: {
  filenameBase: string;
  sheetName: string;
  headers: string[];
  rows: (string | number)[][];
  printHref: string;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        onClick={() => downloadCsv(`${filenameBase}.csv`, headers, rows)}
        className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:bg-background"
      >
        <Download size={13} /> CSV
      </button>
      <button
        onClick={() => downloadXlsx(`${filenameBase}.xlsx`, sheetName, headers, rows)}
        className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:bg-background"
      >
        <FileSpreadsheet size={13} /> Excel
      </button>
      <Link
        href={printHref}
        target="_blank"
        className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:bg-background"
      >
        <Printer size={13} /> Print / PDF
      </Link>
    </div>
  );
}
