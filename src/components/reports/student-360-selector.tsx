"use client";

import { useRouter } from "next/navigation";
import { Card, EmptyState } from "@/components/ui/card";
import { Student360View } from "@/components/reports/student-360-view";
import type { Student360Report } from "@/lib/reports/student-360";
import type { Student } from "@/types/database";

export function Student360Selector({
  students,
  selectedId,
  searchable,
  report,
}: {
  students: Student[];
  selectedId: string;
  searchable: boolean;
  report: Student360Report | undefined;
}) {
  const router = useRouter();

  return (
    <div className="space-y-4">
      {students.length > 1 && (
        <Card className="p-4">
          <label className="block">
            <span className="mb-1 block text-sm font-medium">{searchable ? "Select Student" : "Select Child"}</span>
            <select
              value={selectedId}
              onChange={(e) => router.push(`/reports/student-360?studentId=${e.target.value}`)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary sm:max-w-sm"
            >
              {students.map((s) => (
                <option key={s.id} value={s.id}>{s.full_name} ({s.admission_number})</option>
              ))}
            </select>
          </label>
        </Card>
      )}

      {report ? <Student360View report={report} /> : <Card><EmptyState label="Student not found." /></Card>}
    </div>
  );
}
