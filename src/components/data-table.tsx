"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";

export interface Column<T> {
  key: string;
  header: string;
  render: (row: T) => React.ReactNode;
  hideOnMobile?: boolean;
}

export function DataTable<T>({
  columns,
  rows,
  searchKeys,
  emptyLabel = "No records found.",
  pageSize = 8,
  rowKey,
}: {
  columns: Column<T>[];
  rows: T[];
  searchKeys: (row: T) => string;
  emptyLabel?: string;
  pageSize?: number;
  rowKey: (row: T) => string;
}) {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    if (!query.trim()) return rows;
    const q = query.toLowerCase();
    return rows.filter((r) => searchKeys(r).toLowerCase().includes(q));
  }, [rows, query, searchKeys]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paged = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div>
      <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
            placeholder="Search…"
            className="w-full rounded-lg border border-border bg-background py-2 pl-9 pr-3 text-sm outline-none focus:border-primary"
          />
        </div>
        <p className="text-xs text-muted">{filtered.length} record{filtered.length === 1 ? "" : "s"}</p>
      </div>

      {paged.length === 0 ? (
        <p className="px-5 py-10 text-center text-sm text-muted">{emptyLabel}</p>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border text-xs uppercase tracking-wide text-muted">
                  {columns.map((c) => (
                    <th key={c.key} className={`px-4 py-2.5 font-medium ${c.hideOnMobile ? "hidden sm:table-cell" : ""}`}>
                      {c.header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {paged.map((row) => (
                  <tr key={rowKey(row)} className="hover:bg-background/60">
                    {columns.map((c) => (
                      <td key={c.key} className={`px-4 py-3 ${c.hideOnMobile ? "hidden sm:table-cell" : ""}`}>
                        {c.render(row)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-border px-4 py-3 text-sm">
              <button
                disabled={currentPage === 1}
                onClick={() => setPage((p) => p - 1)}
                className="rounded-md border border-border px-2.5 py-1 disabled:opacity-40"
              >
                Prev
              </button>
              <span className="text-xs text-muted">
                Page {currentPage} of {totalPages}
              </span>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="rounded-md border border-border px-2.5 py-1 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
