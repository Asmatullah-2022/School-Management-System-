"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSession, isSchoolAdmin } from "@/lib/auth/session";
import { getStudentIdForProfile, getTeacherIdForProfile, getGuardianProfileIdsForStudent } from "@/lib/data/people";
import { submitHomework, reviewHomeworkSubmission } from "@/lib/data/homework-submissions";
import { createHomework, updateHomework, getHomework } from "@/lib/data/homework";
import { listStudents } from "@/lib/data/students";
import { createNotificationForUser } from "@/lib/notifications/create";

export async function submitHomeworkAction(homeworkId: string, formData: FormData): Promise<{ error?: string } | void> {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.profile.role !== "student") return { error: "Only a student can submit their own homework." };

  const studentId = await getStudentIdForProfile(session.profile.id);
  if (!studentId) return { error: "No student record is linked to your account." };

  const homework = await getHomework(homeworkId);
  if (!homework) return { error: "Homework not found." };
  if (homework.stage === "closed") return { error: "This homework is closed and no longer accepting submissions." };

  const isLate = new Date(homework.due_date) < new Date(new Date().toDateString());
  if (isLate && !homework.allow_late) {
    return { error: "The deadline for this homework has passed and late submissions are not allowed." };
  }

  const submissionUrl = String(formData.get("submission_url") ?? "").trim() || null;
  const comment = String(formData.get("comment") ?? "").trim() || null;

  try {
    await submitHomework(homeworkId, studentId, session.school.id, submissionUrl, comment, isLate);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Could not submit homework." };
  }
  revalidatePath("/homework");
}

function readHomeworkForm(formData: FormData) {
  return {
    classId: String(formData.get("class_id") ?? ""),
    sectionId: String(formData.get("section_id") ?? "") || null,
    subjectId: String(formData.get("subject_id") ?? ""),
    title: String(formData.get("title") ?? "").trim(),
    description: String(formData.get("description") ?? "").trim() || null,
    instructions: String(formData.get("instructions") ?? "").trim() || null,
    attachmentUrl: String(formData.get("attachment_url") ?? "").trim() || null,
    assignedDate: String(formData.get("assigned_date") ?? new Date().toISOString().slice(0, 10)),
    dueDate: String(formData.get("due_date") ?? ""),
    maxMarks: formData.get("max_marks") ? Number(formData.get("max_marks")) : null,
    allowLate: formData.get("allow_late") === "on",
  };
}

export async function createHomeworkAction(formData: FormData, publish: boolean): Promise<{ error?: string } | void> {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.profile.role !== "teacher" && !isSchoolAdmin(session.profile.role)) {
    return { error: "Only teachers and administrators can create homework." };
  }

  const input = readHomeworkForm(formData);
  if (!input.classId || !input.subjectId) return { error: "Select a class and subject." };
  if (!input.title) return { error: "Title is required." };
  if (!input.dueDate) return { error: "Due date is required." };

  const teacherId = session.profile.role === "teacher" ? (await getTeacherIdForProfile(session.profile.id)) ?? null : null;

  let homework;
  try {
    homework = await createHomework({
      schoolId: session.school.id,
      classId: input.classId,
      sectionId: input.sectionId,
      subjectId: input.subjectId,
      teacherId,
      createdBy: session.profile.id,
      title: input.title,
      description: input.description,
      instructions: input.instructions,
      attachmentUrl: input.attachmentUrl,
      assignedDate: input.assignedDate,
      dueDate: input.dueDate,
      maxMarks: input.maxMarks,
      allowLate: input.allowLate,
      stage: publish ? "published" : "draft",
    });
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Could not create homework. Make sure you are assigned to this class and subject." };
  }

  if (publish) await notifyHomeworkPublished(homework.id, session.school.id, input.classId, input.sectionId);

  revalidatePath("/homework");
  redirect("/homework/manage");
}

export async function updateHomeworkAction(id: string, formData: FormData): Promise<{ error?: string } | void> {
  const session = await getSession();
  if (!session) redirect("/login");

  const input = readHomeworkForm(formData);
  if (!input.title) return { error: "Title is required." };
  if (!input.dueDate) return { error: "Due date is required." };

  try {
    await updateHomework(id, {
      class_id: input.classId,
      section_id: input.sectionId,
      subject_id: input.subjectId,
      title: input.title,
      description: input.description,
      instructions: input.instructions,
      attachment_url: input.attachmentUrl,
      assigned_date: input.assignedDate,
      due_date: input.dueDate,
      max_marks: input.maxMarks,
      allow_late: input.allowLate,
    });
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Could not update homework." };
  }
  revalidatePath("/homework");
  revalidatePath("/homework/manage");
}

export async function publishHomeworkAction(id: string) {
  const session = await getSession();
  if (!session) redirect("/login");
  const homework = await updateHomework(id, { stage: "published" });
  if (homework) await notifyHomeworkPublished(homework.id, session.school.id, homework.class_id, homework.section_id ?? null);
  revalidatePath("/homework");
  revalidatePath("/homework/manage");
}

export async function closeHomeworkAction(id: string) {
  const session = await getSession();
  if (!session) redirect("/login");
  await updateHomework(id, { stage: "closed" });
  revalidatePath("/homework");
  revalidatePath("/homework/manage");
}

export async function reviewSubmissionAction(
  id: string,
  marks: number | null,
  remarks: string | null
): Promise<{ error?: string } | void> {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.profile.role !== "teacher" && !isSchoolAdmin(session.profile.role)) {
    return { error: "Only teachers and administrators can review submissions." };
  }

  let submission;
  try {
    submission = await reviewHomeworkSubmission(id, { marks, remarks }, session.profile.id);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Could not save review." };
  }

  if (submission) {
    const recipients = await getGuardianProfileIdsForStudent(submission.student_id);
    for (const profileId of recipients) {
      await createNotificationForUser(profileId, session.school.id, {
        title: "Homework Checked",
        message: remarks ? `Your homework has been checked. Feedback: ${remarks}` : "Your homework has been checked.",
        link: "/homework",
        category: "homework",
      });
    }
  }
  revalidatePath("/homework/manage");
}

async function notifyHomeworkPublished(homeworkId: string, schoolId: string, classId: string, sectionId: string | null) {
  const students = (await listStudents()).filter((s) => s.class_id === classId && (!sectionId || s.section_id === sectionId));
  for (const student of students) {
    const recipients = await getGuardianProfileIdsForStudent(student.id);
    for (const profileId of recipients) {
      await createNotificationForUser(profileId, schoolId, {
        title: "New Homework Assigned",
        message: "New homework has been published for your class.",
        link: "/homework",
        category: "homework",
      });
    }
  }
}
