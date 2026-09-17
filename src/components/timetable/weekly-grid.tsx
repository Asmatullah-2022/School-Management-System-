"use client";

import type { Period, TimetableEntry } from "@/types/database";

const DAY_LABELS: Record<number, string> = {
  0: "Sun",
  1: "Mon",
  2: "Tue",
  3: "Wed",
  4: "Thu",
  5: "Fri",
  6: "Sat",
};

export function WeeklyGrid({
  days,
  periods,
  entries,
  renderCell,
  onCellClick,
  todayColumn,
}: {
  days: number[];
  periods: Period[];
  entries: TimetableEntry[];
  renderCell: (entry: TimetableEntry | undefined, day: number, periodId: string) => React.ReactNode;
  onCellClick?: (day: number, periodId: string, entry: TimetableEntry | undefined) => void;
  /** Highlights this day-of-week column, e.g. today. */
  todayColumn?: number;
}) {
  const getEntry = (day: number, periodId: string) =>
    entries.find((e) => e.day_of_week === day && e.period_id === periodId);

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] border-separate border-spacing-1.5 text-sm">
        <thead>
          <tr>
            <th className="w-28 px-2 py-2 text-left text-xs font-medium uppercase tracking-wide text-muted">Period</th>
            {days.map((d) => (
              <th
                key={d}
                className={`px-2 py-2 text-center text-xs font-medium uppercase tracking-wide ${
                  d === todayColumn ? "text-primary" : "text-muted"
                }`}
              >
                {DAY_LABELS[d]}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {periods.map((p) => (
            <tr key={p.id}>
              <td className="rounded-lg bg-background px-2 py-2 align-top text-xs">
                <p className="font-medium">{p.name}</p>
                <p className="text-muted">
                  {p.start_time.slice(0, 5)}–{p.end_time.slice(0, 5)}
                </p>
              </td>
              {p.is_break ? (
                <td
                  colSpan={days.length}
                  className="rounded-lg bg-warning/5 px-2 py-2 text-center text-xs font-medium text-warning"
                >
                  Break
                </td>
              ) : (
                days.map((d) => {
                  const entry = getEntry(d, p.id);
                  return (
                    <td
                      key={d}
                      onClick={onCellClick ? () => onCellClick(d, p.id, entry) : undefined}
                      className={`min-w-[110px] rounded-lg border border-border px-2 py-2 align-top ${
                        onCellClick ? "cursor-pointer hover:border-primary hover:bg-primary/5" : ""
                      } ${d === todayColumn ? "bg-primary/5" : "bg-surface"}`}
                    >
                      {renderCell(entry, d, p.id)}
                    </td>
                  );
                })
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
