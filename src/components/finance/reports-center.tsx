"use client";

import { Download } from "lucide-react";
import { downloadCsv } from "@/lib/csv";

export function ExportButton({ filename, headers, rows }: { filename: string; headers: string[]; rows: (string | number)[][] }) {
  return (
    <button
      onClick={() => downloadCsv(filename, headers, rows)}
      className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:bg-background"
    >
      <Download size={13} /> Export CSV
    </button>
  );
}
