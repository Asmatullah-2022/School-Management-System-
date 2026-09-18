import { notFound, redirect } from "next/navigation";
import { getSession, isSchoolAdmin } from "@/lib/auth/session";
import { getExam } from "@/lib/data/exams";
import { listExamSubjects } from "@/lib/data/exam-schedule";
import { listMarks } from "@/lib/data/marks";
import { listResults } from "@/lib/data/results";
import { getStudent } from "@/lib/data/students";
import { listClasses, listSections } from "@/lib/data/academics";
import { listSubjects } from "@/lib/data/subjects";
import { listTeachers } from "@/lib/data/teachers";
import { getStudentIdForProfile, getChildStudentIdsForProfile } from "@/lib/data/people";
import { getCurrentAcademicSession } from "@/lib/data/sessions";
import { ResultCard } from "@/components/exams/result-card";

export default async function ResultCardPrintPage({
  params,
}: {
  params: Promise<{ examId: string; studentId: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const { examId, studentId } = await params;
  const role = session.profile.role;

  if (role === "student") {
    const ownId = await getStudentIdForProfile(session.profile.id);
    if (ownId !== studentId) redirect("/results");
  } else if (role === "parent") {
    const childIds = await getChildStudentIdsForProfile(session.profile.id);
    if (!childIds.includes(studentId)) redirect("/results");
  }

  const [exam, examSubjects, marks, results, student, classes, sections, subjects, teachers, academicSession] = await Promise.all([
    getExam(examId),
    listExamSubjects(),
    listMarks(),
    listResults(),
    getStudent(studentId),
    listClasses(),
    listSections(),
    listSubjects(),
    listTeachers(),
    getCurrentAcademicSession(),
  ]);
  if (!exam || !student) notFound();

  if (!isSchoolAdmin(role) && role !== "teacher" && role !== "accountant" && exam.status !== "published") {
    redirect("/results");
  }

  const result = results.find((r) => r.exam_id === examId && r.student_id === studentId);
  if (!result) notFound();

  const subjectRows = examSubjects
    .filter((es) => es.exam_id === examId && es.section_id === student.section_id)
    .map((es) => {
      const mark = marks.find((m) => m.exam_subject_id === es.id && m.student_id === studentId);
      return {
        subjectName: subjects.find((s) => s.id === es.subject_id)?.name ?? "Subject",
        totalMarks: es.total_marks,
        passingMarks: es.passing_marks,
        obtained: mark?.obtained_marks ?? null,
      };
    });

  const section = sections.find((s) => s.id === student.section_id);
  const classTeacher = teachers.find((t) => t.id === section?.class_teacher_id);

  return (
    <ResultCard
      school={session.school}
      exam={exam}
      student={student}
      className={classes.find((c) => c.id === student.class_id)?.name ?? "—"}
      sectionName={section?.name ?? "—"}
      academicSessionName={academicSession?.name}
      subjectRows={subjectRows}
      result={result}
      classTeacherName={classTeacher?.full_name}
    />
  );
}
