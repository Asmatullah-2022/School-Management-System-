import Link from "next/link";
import type { Exam, Result } from "@/types/database";

export function StudentResultsList({ results, exams }: { results: Result[]; exams: Exam[] }) {
  return (
    <ul className="divide-y divide-border">
      {results.map((r) => {
        const exam = exams.find((e) => e.id === r.exam_id);
        return (
          <li key={r.id} className="flex items-center justify-between gap-3 px-5 py-3">
            <div>
              <p className="text-sm font-medium">{exam?.name ?? "Exam"}</p>
              <p className="text-xs text-muted">
                {r.total_obtained}/{r.total_marks} ({r.percentage}%) · Grade {r.grade}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${r.is_pass ? "bg-success/10 text-success" : "bg-danger/10 text-danger"}`}>
                {r.is_pass ? "Pass" : "Fail"}
              </span>
              <Link
                href={`/print/result-card/${r.exam_id}/${r.student_id}`}
                target="_blank"
                className="text-xs font-medium text-primary hover:underline"
              >
                View Result Card
              </Link>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
