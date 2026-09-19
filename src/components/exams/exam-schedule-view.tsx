"use client";

import { useState } from "react";
import { Card, CardHeader, EmptyState } from "@/components/ui/card";
import type { Exam, ExamSubject, Student, Subject } from "@/types/database";

export function ExamScheduleView({
  students,
  examSubjects,
  exams,
  subjects,
}: {
  students: Student[];
  examSubjects: ExamSubject[];
  exams: Exam[];
  subjects: Subject[];
}) {
  const [selectedId, setSelectedId] = useState(students[0]?.id);
  const student = students.find((s) => s.id === selectedId) ?? students[0];

  if (!student) {
    return (
      <Card>
        <EmptyState label="No children are linked to your account yet." />
      </Card>
    );
  }

  const todayISO = new Date().toISOString().slice(0, 10);
  const rows = examSubjects
    .filter((es) => es.class_id === student.class_id && (!es.section_id || es.section_id === student.section_id))
    .map((examSubject) => ({ examSubject, exam: exams.find((e) => e.id === examSubject.exam_id) }))
    .filter((x): x is { examSubject: ExamSubject; exam: Exam } => !!x.exam && x.exam.status !== "draft" && x.exam.status !== "archived")
    .sort((a, b) => (a.examSubject.exam_date ?? "9999") < (b.examSubject.exam_date ?? "9999") ? -1 : 1);

  const upcoming = rows.filter((r) => !r.examSubject.exam_date || r.examSubject.exam_date >= todayISO);
  const past = rows.filter((r) => r.examSubject.exam_date && r.examSubject.exam_date < todayISO);

  return (
    <div className="space-y-4">
      {students.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {students.map((s) => (
            <button
              key={s.id}
              onClick={() => setSelectedId(s.id)}
              className={`rounded-full px-3.5 py-2 text-sm font-medium transition ${student.id === s.id ? "bg-primary text-primary-foreground" : "border border-border text-muted hover:bg-background"}`}
            >
              {s.full_name}
            </button>
          ))}
        </div>
      )}

      <Card>
        <CardHeader title="Upcoming Examinations" />
        <ScheduleTable rows={upcoming} subjects={subjects} emptyLabel="No upcoming examinations." />
      </Card>

      {past.length > 0 && (
        <Card>
          <CardHeader title="Past Examinations" />
          <ScheduleTable rows={past} subjects={subjects} emptyLabel="No past examinations." />
        </Card>
      )}
    </div>
  );
}

function ScheduleTable({ rows, subjects, emptyLabel }: { rows: { examSubject: ExamSubject; exam: Exam }[]; subjects: Subject[]; emptyLabel: string }) {
  if (rows.length === 0) return <EmptyState label={emptyLabel} />;
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-border text-xs uppercase tracking-wide text-muted">
            <th className="px-4 py-2.5 font-medium">Exam</th>
            <th className="px-4 py-2.5 font-medium">Subject</th>
            <th className="px-4 py-2.5 font-medium">Date</th>
            <th className="hidden px-4 py-2.5 font-medium sm:table-cell">Time</th>
            <th className="hidden px-4 py-2.5 font-medium sm:table-cell">Room</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rows.map(({ examSubject, exam }) => (
            <tr key={examSubject.id}>
              <td className="px-4 py-3 font-medium">{exam.name}</td>
              <td className="px-4 py-3">{subjects.find((s) => s.id === examSubject.subject_id)?.name ?? "—"}</td>
              <td className="px-4 py-3 text-muted">{examSubject.exam_date ? new Date(examSubject.exam_date).toLocaleDateString() : "—"}</td>
              <td className="hidden px-4 py-3 text-muted sm:table-cell">
                {examSubject.start_time ?? "—"}{examSubject.end_time ? ` – ${examSubject.end_time}` : ""}
              </td>
              <td className="hidden px-4 py-3 text-muted sm:table-cell">{examSubject.exam_room ?? "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
