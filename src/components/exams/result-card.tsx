import { PrintButton } from "@/components/timetable/print-button";
import type { Exam, Result, School, Student } from "@/types/database";

interface SubjectRow {
  subjectName: string;
  totalMarks: number;
  passingMarks: number;
  obtained: number | null;
}

export function ResultCard({
  school,
  exam,
  student,
  className,
  sectionName,
  academicSessionName,
  subjectRows,
  result,
  classTeacherName,
}: {
  school: School;
  exam: Exam;
  student: Student;
  className: string;
  sectionName: string;
  academicSessionName?: string;
  subjectRows: SubjectRow[];
  result: Result;
  classTeacherName?: string;
}) {
  return (
    <div className="mx-auto max-w-3xl p-6 print:p-0">
      <div className="mb-4 flex items-center justify-between print:hidden">
        <p className="text-sm text-muted">Print preview</p>
        <PrintButton />
      </div>

      <div className="rounded-xl border-2 border-foreground/20 p-6 print:border-black print:p-4">
        <header className="mb-4 border-b-2 border-foreground/20 pb-4 text-center print:border-black">
          <h1 className="text-lg font-bold uppercase tracking-wide">{school.name}</h1>
          <p className="text-sm text-muted">{school.address}</p>
          <p className="mt-2 text-base font-semibold">{exam.name} — Result Card</p>
          {academicSessionName && <p className="text-sm text-muted">Academic Session {academicSessionName}</p>}
        </header>

        <dl className="mb-5 grid grid-cols-2 gap-x-6 gap-y-2 text-sm sm:grid-cols-4">
          <div>
            <dt className="text-xs text-muted">Student Name</dt>
            <dd className="font-medium">{student.full_name}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted">Father&apos;s Name</dt>
            <dd className="font-medium">{student.father_name ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted">Admission / Roll #</dt>
            <dd className="font-medium">
              {student.admission_number} / {student.roll_number ?? "—"}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-muted">Class / Section</dt>
            <dd className="font-medium">
              {className} - {sectionName}
            </dd>
          </div>
        </dl>

        <table className="w-full border-collapse text-sm">
          <thead>
            <tr>
              <th className="border border-foreground/30 px-3 py-2 text-left print:border-black">Subject</th>
              <th className="border border-foreground/30 px-3 py-2 text-center print:border-black">Total Marks</th>
              <th className="border border-foreground/30 px-3 py-2 text-center print:border-black">Passing Marks</th>
              <th className="border border-foreground/30 px-3 py-2 text-center print:border-black">Obtained</th>
              <th className="border border-foreground/30 px-3 py-2 text-center print:border-black">Result</th>
            </tr>
          </thead>
          <tbody>
            {subjectRows.map((row) => (
              <tr key={row.subjectName}>
                <td className="border border-foreground/30 px-3 py-2 print:border-black">{row.subjectName}</td>
                <td className="border border-foreground/30 px-3 py-2 text-center print:border-black">{row.totalMarks}</td>
                <td className="border border-foreground/30 px-3 py-2 text-center print:border-black">{row.passingMarks}</td>
                <td className="border border-foreground/30 px-3 py-2 text-center print:border-black">{row.obtained ?? "—"}</td>
                <td className="border border-foreground/30 px-3 py-2 text-center print:border-black">
                  {row.obtained === null ? "—" : row.obtained >= row.passingMarks ? "Pass" : "Fail"}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="font-semibold">
              <td className="border border-foreground/30 px-3 py-2 print:border-black">Total</td>
              <td className="border border-foreground/30 px-3 py-2 text-center print:border-black">{result.total_marks}</td>
              <td className="border border-foreground/30 px-3 py-2 print:border-black"></td>
              <td className="border border-foreground/30 px-3 py-2 text-center print:border-black">{result.total_obtained}</td>
              <td className="border border-foreground/30 px-3 py-2 text-center print:border-black">{result.is_pass ? "Pass" : "Fail"}</td>
            </tr>
          </tfoot>
        </table>

        <div className="mt-5 grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
          <div>
            <dt className="text-xs text-muted">Percentage</dt>
            <dd className="text-base font-semibold">{result.percentage}%</dd>
          </div>
          <div>
            <dt className="text-xs text-muted">Grade</dt>
            <dd className="text-base font-semibold">{result.grade ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted">Class Rank</dt>
            <dd className="text-base font-semibold">{result.class_rank ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted">Overall Result</dt>
            <dd className={`text-base font-semibold ${result.is_pass ? "text-success" : "text-danger"}`}>
              {result.is_pass ? "PASS" : "FAIL"}
            </dd>
          </div>
        </div>

        {result.remarks && (
          <p className="mt-4 text-sm">
            <span className="text-xs font-medium uppercase text-muted">Remarks: </span>
            {result.remarks}
          </p>
        )}

        <footer className="mt-16 flex items-center justify-between text-sm">
          <div className="text-center">
            <p className="mb-8">&nbsp;</p>
            <p className="border-t border-foreground px-8 pt-1">
              Class Teacher {classTeacherName ? `(${classTeacherName})` : ""}
            </p>
          </div>
          <div className="text-center">
            <p className="mb-8">&nbsp;</p>
            <p className="border-t border-foreground px-8 pt-1">Headteacher Signature</p>
          </div>
          <div className="text-center">
            <p className="mb-8">&nbsp;</p>
            <p className="border-t border-foreground px-8 pt-1">School Stamp</p>
          </div>
        </footer>
      </div>
    </div>
  );
}
