"use client";

// Real .xlsx generation via SheetJS, used only to WRITE files from our own
// trusted in-memory report data — never to parse untrusted spreadsheets —
// so the package's known parsing-side advisories (prototype pollution /
// ReDoS in XLSX.read on hostile input) do not apply to this usage.
import * as XLSX from "xlsx";

export function downloadXlsx(filename: string, sheetName: string, headers: string[], rows: (string | number)[][]) {
  const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName.slice(0, 31));
  XLSX.writeFile(workbook, filename);
}
